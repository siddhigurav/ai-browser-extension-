// background.js - service worker (module) handling API calls and persistent tasks
// Import api client statically to avoid dynamic import issues in ServiceWorkerGlobalScope
import { callModel } from './api/apiClient.js';

// Simple in-memory token cache (persist with chrome.storage)
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Assistant background worker installed');
  
  // Create context menu item for sidebar
  chrome.contextMenus.create({
    id: "toggleSidebar",
    title: "Toggle AI Assistant Sidebar",
    contexts: ["all"]
  });
});

// Keep track of which tabs have reported that the content script and UI are ready
const tabReady = new Map(); // tabId -> { ready: boolean, resolve?:fn }
// Track long-running chunk summarize tasks so they can be cancelled
const chunkTasks = new Map(); // taskId -> { cancelled: boolean, controllers: AbortController[] }

// Global unhandled rejection handler to avoid worker crashes
self.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection in background:', ev.reason);
});

// Global error handler to log unexpected errors
self.addEventListener('error', (ev) => {
  console.error('Unhandled error in background service worker:', ev.error || ev.message, ev.filename, ev.lineno, ev.colno);
});

// Helper to wait for content script readiness (resolved when CONTENT_SCRIPT_READY arrives)
function waitForContentScript(tabId, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const existing = tabReady.get(tabId);
    if (existing && existing.ready) return resolve(true);
    // create resolver
    const timer = setTimeout(() => {
      tabReady.delete(tabId);
      reject(new Error('CONTENT_SCRIPT_READY timeout'));
    }, timeout);
    tabReady.set(tabId, { ready: false, resolve: (ok) => { clearTimeout(timer); tabReady.set(tabId, { ready: true }); resolve(ok); } });
  });
}

// Send a message to a tab and ensure the content script is present; inject and wait if necessary
async function sendMessageToTab(tabId, message, ensureReady = true) {
  try {
    // If ensureReady is true, wait for content script ready, otherwise just try sending
    if (ensureReady) {
      try {
        await waitForContentScript(tabId, 2000);
      } catch (err) {
        // attempt injection
        console.info('Content script not ready, injecting...', err?.message);
        try {
          await chrome.scripting.executeScript({ target: { tabId }, files: ['contentScript.js'] });
        } catch (injErr) {
          console.error('Injection failed', injErr);
          throw injErr;
        }
      }
    }

    return await new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (resp) => {
        if (chrome.runtime.lastError) {
          console.warn('sendMessage failed:', chrome.runtime.lastError.message);
          return resolve({ success: false, error: chrome.runtime.lastError.message });
        }
        resolve({ success: true, resp });
      });
    });
  } catch (err) {
    return { success: false, error: String(err?.message || err) };
  }
}

// Try each provided relative path and return the first valid URL (non-empty) or null
async function getAvailableIconUrl(paths = []) {
  for (const p of paths) {
    try {
      const url = chrome.runtime.getURL(p);
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) continue;
      const blob = await res.blob().catch(() => null);
      if (blob && blob.size && blob.size > 64) return url;
    } catch (e) { /* ignore */ }
  }
  return null;
}

// Helper to call external AI API (delegated from content scripts)
// Accepts an optional `options` object: { signal } to allow aborting long requests.
async function callAIEndpoint(payload, token, options = {}) {
  const signal = options.signal;
  try {
    console.log('callAIEndpoint called with:', { payload, token });
    
    // Use the api client imported at module top to perform provider-aware calls
    const data = await callModel(payload, token, options);
    return { success: true, data };
  } catch (err) {
    if (err && err.message === 'aborted') return { success: false, error: 'aborted' };
    
    // Log more detailed error information
    console.error('callAIEndpoint error:', {
      message: err?.message || err,
      stack: err?.stack,
      payload: payload,
      tokenProvided: !!token,
      tokenLength: token ? token.length : 0,
      provider: payload?.provider,
      model: payload?.model
    });
    
    return { success: false, error: String(err?.message || err) };
  }
}

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggleSidebar") {
    // Send message to inject sidebar
    sendMessageToTab(tab.id, { type: 'INJECT_SIDEBAR' });
  }
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    // Get active tab and inject sidebar
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendMessageToTab(tabs[0].id, { type: 'INJECT_SIDEBAR' });
      }
    });
  }
});

// Listen for messages from content scripts / sidebar / popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      // helper to fetch token and provider from storage
      // Fallback: if no token in storage, try to load a local dev file 'dev_token.txt' packaged in the extension root.
      const fetchDevToken = async () => {
        try {
          const url = chrome.runtime.getURL('dev_token.txt');
          const r = await fetch(url);
          if (!r.ok) return null;
          const txt = (await r.text()).trim();
          
          // Check if the file contains actual documentation/comments rather than a token
          // If it contains typical documentation markers, it's not a real token
          if (txt.includes('# AI Assistant API Token') || 
              txt.includes('developer-provided API keys') ||
              txt.includes('For free usage without any API keys')) {
            return null;
          }
          
          // Validate that the token is actually a real token, not a placeholder
          if (txt && txt.length > 8 && txt !== 'YOUR_API_TOKEN_HERE') return txt;
        } catch (e) { /* ignore */ }
        return null;
      };

      // Helper to get settings from storage
      async function getSettings() {
        return new Promise(async (resolve) => {
          chrome.storage.sync.get(['apiToken', 'provider', 'model', 'groqEndpoint', 'hfModel'], async (data) => {
            let token = data.apiToken;
            if (!token) {
              // try dev token file fallback
              const dev = await fetchDevToken();
              if (dev) token = dev;
            }
            
            // Use stored provider and model if present. Do NOT force a default provider; let
            // the api client detect provider from the token or model when provider is not set.
            const provider = data.provider || null;
            const model = data.model || 'meta-llama/llama-3-8b-instruct';
            
            resolve({ token, provider, model, hfModel: data.hfModel, groqEndpoint: data.groqEndpoint });
          });
        });
      }

      // Normalize payload helper: if payload is a string, convert to object { input: payload }
      function normalizePayload(p) {
        if (typeof p === 'string') return { input: p };
        if (!p) return {};
        return p;
      }
      
      if (message.type === 'CONTENT_SCRIPT_READY') {
        const tabId = sender?.tab?.id;
        console.log('Content script ready from', tabId);
        const entry = tabReady.get(tabId);
        if (entry && typeof entry.resolve === 'function') {
          try { entry.resolve(true); } catch (e) { /* ignore */ }
        }
        tabReady.set(tabId, { ready: true });
        sendResponse({ ready: true });
        return;
      }
      
      if (message.type === 'AI_REQUEST') {
        const settings = await getSettings();
        const token = settings.token;
        
        // Normalize payload structure
        message.payload = normalizePayload(message.payload);
        
        // Handle model selection properly
        // If payload has selectedModel, use its configuration
        if (message.payload.selectedModel) {
          // Don't override provider/model from payload if they're already set
          if (!message.payload.provider) {
            // Check if the selected model exists in MODEL_CONFIGS and use its provider
            // We need to import the MODEL_CONFIGS, but since we can't do that easily in a service worker,
            // we'll use a simpler approach: default to openrouter for free models
            if (message.payload.selectedModel.includes('openchat') || 
                message.payload.selectedModel.includes('mistral') || 
                message.payload.selectedModel.includes('nousresearch') || 
                message.payload.selectedModel.includes('phi-3') ||
                message.payload.selectedModel.includes('meta-llama')) {
              message.payload.provider = 'openrouter'; // Default to openrouter for free models
            } else if (message.payload.selectedModel.includes('gpt') || message.payload.selectedModel.includes('openai')) {
              message.payload.provider = 'openai';
            } else if (message.payload.selectedModel.includes('llama') || message.payload.selectedModel.includes('groq')) {
              message.payload.provider = 'groq';
            } else if (message.payload.selectedModel.includes('huggingface') || message.payload.selectedModel.includes('facebook') || message.payload.selectedModel.includes('google')) {
              message.payload.provider = 'huggingface';
            } else {
              // For other models, default to openrouter as well to avoid GROQ issues
              message.payload.provider = 'openrouter';
            }
          }
          if (!message.payload.model) {
            message.payload.model = message.payload.selectedModel;
          }
        } else {
          // Use settings if no selectedModel in payload
          if (!message.payload.provider && settings.provider) message.payload.provider = settings.provider;
          if (!message.payload.model && settings.model) message.payload.model = settings.model;
        }
        
        // Ensure we have a valid model for OpenRouter
        if (message.payload.provider === 'openrouter' && !message.payload.model) {
          message.payload.model = 'meta-llama/llama-3-8b-instruct'; // Default to free model
        }
        
        const { success, data, error } = await callAIEndpoint(message.payload, token);
        sendResponse({ success, data, error });
        return;
      }

      if (message.type === 'SUMMARIZE_REQUEST') {
        const settings = await getSettings();
        const token = settings.token;
        message.payload = normalizePayload(message.payload);
        const text = message.payload?.text || message.payload?.input || '';
        const provider = message.payload?.provider || settings.provider || 'openrouter'; // Default to OpenRouter
        const model = message.payload?.model || settings.model || 'meta-llama/llama-3-8b-instruct'; // Default to free model
        const payload = {
          provider,
          model,
          messages: [{ role: 'user', content: `Please provide a concise summary (3 bullet points) of the following text:\n\n${text}` }],
          max_tokens: 512
        };
        const { success, data, error } = await callAIEndpoint(payload, token);
        sendResponse({ success, data, error });
        return;
      }

      if (message.type === 'GET_PAGE_CONTENT') {
        // Request page content from the active tab
        sendMessageToTab(sender.tab.id, { type: "EXTRACT_PAGE_CONTENT" })
          .then(response => {
            if (response && response.success && response.resp && response.resp.type === "PAGE_CONTENT") {
              sendResponse({ 
                type: "PAGE_CONTENT", 
                content: response.resp.content,
                title: response.resp.title,
                url: response.resp.url,
                length: response.resp.length
              });
            } else {
              sendResponse({ error: "Failed to extract page content." });
            }
          })
          .catch(error => {
            console.error("Error getting page content:", error);
            sendResponse({ error: "Failed to extract page content." });
          });
        return true; // Indicates that sendResponse will be called asynchronously
      } else if (message.type === 'GET_SELECTED_TEXT') {
        // Request selected text from the active tab
        sendMessageToTab(sender.tab.id, { type: "EXTRACT_SELECTED_TEXT" })
          .then(response => {
            if (response && response.success && response.resp && response.resp.type === "SELECTED_TEXT") {
              sendResponse({ 
                type: "SELECTED_TEXT", 
                content: response.resp.content,
                length: response.resp.length
              });
            } else {
              sendResponse({ 
                type: "SELECTED_TEXT", 
                content: null,
                message: response?.resp?.message || "No text selected."
              });
            }
          })
          .catch(error => {
            console.error("Error getting selected text:", error);
            sendResponse({ error: "Failed to extract selected text." });
          });
        return true; // Indicates that sendResponse will be called asynchronously
      } else if (message.type === 'PROCESS_PDF') {
        // Handle PDF processing by forwarding to content script
        try {
          // Forward to content script for processing
          const tab = sender.tab;
          if (!tab) {
            sendResponse({ success: false, error: "No active tab" });
            return true;
          }
          
          // Send message to content script to process PDF
          // Note: We can't send File objects through message passing, so we'll handle the file data in popup.js
          sendMessageToTab(tab.id, { 
            type: 'PROCESS_PDF',
            fileData: message.fileData,
            fileName: message.fileName,
            fileType: message.fileType
          })
            .then(response => {
              if (response && response.success) {
                sendResponse({ success: true, data: response.resp });
              } else {
                sendResponse({ success: false, error: response?.error || "Failed to process PDF" });
              }
            })
            .catch(error => {
              sendResponse({ success: false, error: error.message });
            });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        return true; // Indicates that sendResponse will be called asynchronously
      } else if (message.type === 'PROCESS_OCR') {
        // Handle OCR processing by forwarding to content script
        try {
          // Forward to content script for processing
          const tab = sender.tab;
          if (!tab) {
            sendResponse({ success: false, error: "No active tab" });
            return true;
          }
          
          // Send message to content script to process OCR
          // Note: We can't send File objects through message passing, so we'll handle the file data in popup.js
          sendMessageToTab(tab.id, { 
            type: 'PROCESS_OCR',
            fileData: message.fileData,
            fileName: message.fileName,
            fileType: message.fileType
          })
            .then(response => {
              if (response && response.success) {
                sendResponse({ success: true, data: response.resp });
              } else {
                sendResponse({ success: false, error: response?.error || "Failed to process image" });
              }
            })
            .catch(error => {
              sendResponse({ success: false, error: error.message });
            });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        return true; // Indicates that sendResponse will be called asynchronously
      } else if (message.type === 'ANALYZE_SITE') {
        // Handle site analysis
        try {
          console.log('ANALYZE_SITE message received:', message);
          
          const url = message.payload?.url;
          if (!url) {
            sendResponse({ success: false, error: 'No URL provided for analysis' });
            return true;
          }
          
          // Extract domain from URL
          const domain = new URL(url).hostname;
          console.log('Extracted domain:', domain);
          
          // Initialize values
          let domainAge = 'Unknown';
          let trustScore = 50;
          let trafficEstimate = 'Unknown';
          let safetyStatus = 'Unknown';
          let creationDate = 'Unknown';
          const analysisDetails = [];
          
          // Check domain age using multiple sources
          try {
            analysisDetails.push('Checking domain registration...');
            
            // Try different WHOIS APIs for better reliability
            const apis = [
              `https://api.whois.vu/?domain=${domain}`,
              `https://www.whoiis.com/api/whois/${domain}`
            ];
            
            let whoisData = null;
            
            for (const apiUrl of apis) {
              try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                  const data = await response.json();
                  if (data && (data.created_date || data.creationDate || data.Created_Date)) {
                    whoisData = data;
                    break;
                  }
                }
              } catch (e) {
                // Continue to next API if this one fails
                continue;
              }
            }
            
            if (whoisData) {
              // Extract creation date from various possible formats
              const createdDateString = whoisData.created_date || whoisData.creationDate || whoisData.Created_Date || whoisData.created || whoisData.Created;
              
              if (createdDateString) {
                const createdDate = new Date(createdDateString);
                if (!isNaN(createdDate.getTime())) {
                  creationDate = createdDate.toISOString().split('T')[0];
                  const today = new Date();
                  const diffTime = Math.abs(today - createdDate);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  domainAge = diffDays > 365 ? `${Math.floor(diffDays/365)} years` : `${diffDays} days`;
                  
                  // Older domains are generally more trustworthy
                  if (diffDays > 365 * 5) {
                    trustScore += 25; // Very old domain (5+ years)
                    analysisDetails.push(`Domain registered ${Math.floor(diffDays/365)} years ago (very established)`);
                  } else if (diffDays > 365 * 2) {
                    trustScore += 15; // Moderately old domain (2-5 years)
                    analysisDetails.push(`Domain registered ${Math.floor(diffDays/365)} years ago (established)`);
                  } else if (diffDays > 365) {
                    trustScore += 5;  // Somewhat established (1-2 years)
                    analysisDetails.push(`Domain registered 1+ years ago`);
                  } else if (diffDays < 30) {
                    trustScore -= 25; // Very new domain (< 30 days)
                    analysisDetails.push(`Domain registered recently (${diffDays} days ago) - higher risk`);
                  } else if (diffDays < 180) {
                    trustScore -= 10; // Relatively new domain (< 6 months)
                    analysisDetails.push(`Domain registered ${diffDays} days ago`);
                  }
                }
              }
            } else {
              // If no WHOIS data, make a heuristic-based estimate
              domainAge = 'Unknown';
              analysisDetails.push('Unable to verify domain registration - using heuristic analysis');
              
              // Heuristic analysis based on domain characteristics
              const domainParts = domain.split('.');
              if (domainParts.length >= 2) {
                const tld = domainParts[domainParts.length - 1].toLowerCase();
                // Common trusted TLDs
                const trustedTlds = ['com', 'org', 'net', 'edu', 'gov'];
                if (trustedTlds.includes(tld)) {
                  trustScore += 5;
                  analysisDetails.push(`Common trusted TLD (.${tld})`);
                }
                
                // Length of domain name (shorter is often more professional)
                const domainName = domainParts[0];
                if (domainName.length >= 3 && domainName.length <= 15) {
                  trustScore += 5;
                  analysisDetails.push('Domain name length appears professional');
                }
              }
            }
          } catch (whoisError) {
            console.warn('WHOIS API error:', whoisError);
            domainAge = 'Check failed';
            analysisDetails.push('Domain registration check failed - using heuristic analysis');
            
            // Even with WHOIS failure, we can still do heuristic analysis
            trustScore = Math.max(30, trustScore); // Don't let it go too low
          }
          
          // Check safety status with multiple heuristic checks
          try {
            analysisDetails.push('Analyzing security factors...');
            let suspicionLevel = 0;
            const suspiciousIndicators = [];
            
            // Check for suspicious patterns in domain name
            const suspiciousPatterns = [
              {pattern: /(phish|scam|fake)/i, weight: 30, desc: 'Contains phishing/scam keywords'},
              {pattern: /(-free|free-)/i, weight: 20, desc: 'Uses "free" in domain'},
              {pattern: /(win-|-win|-winner)/i, weight: 20, desc: 'Uses "win" in domain'},
              {pattern: /(urgent|alert|warning)/i, weight: 25, desc: 'Urgent/alert keywords'},
              {pattern: /(login|secure|account|update)/i, weight: 15, desc: 'Login/account keywords'},
              {pattern: /\d{5,}/, weight: 20, desc: 'Many consecutive digits'},
              {pattern: /(paypal|google|facebook|amazon)/i, weight: -10, desc: 'Known brand name (may be legitimate)'}
            ];
            
            for (const {pattern, weight, desc} of suspiciousPatterns) {
              if (pattern.test(domain)) {
                suspicionLevel += weight;
                if (weight > 0) {
                  suspiciousIndicators.push(desc);
                }
              }
            }
            
            // Check for IP-based domains (often suspicious)
            if (/^\d+\.\d+\.\d+\.\d+/.test(domain)) {
              suspicionLevel += 30;
              suspiciousIndicators.push('IP-based address');
            }
            
            // Check for excessive hyphens or numbers
            const hyphenCount = (domain.match(/-/g) || []).length;
            const digitCount = (domain.match(/\d/g) || []).length;
            
            if (hyphenCount > 3) {
              suspicionLevel += 15;
              suspiciousIndicators.push('Excessive hyphens');
            }
            
            if (digitCount > 4) {
              suspicionLevel += 15;
              suspiciousIndicators.push('Excessive numbers');
            }
            
            // Adjust trust score based on suspicion level
            trustScore -= suspicionLevel;
            
            // Determine safety status
            if (suspicionLevel > 50) {
              safetyStatus = 'High Risk';
              analysisDetails.push('High risk detected - multiple suspicious factors');
            } else if (suspicionLevel > 25) {
              safetyStatus = 'Suspicious';
              analysisDetails.push('Suspicious factors detected');
            } else if (suspicionLevel > 0) {
              safetyStatus = 'Caution';
              analysisDetails.push('Some caution advised');
            } else {
              safetyStatus = 'Likely Safe';
              analysisDetails.push('No major security concerns detected');
            }
            
            // Add suspicious indicators to details if any
            if (suspiciousIndicators.length > 0) {
              analysisDetails.push(...suspiciousIndicators.slice(0, 3)); // Limit to top 3
            }
          } catch (safetyError) {
            console.warn('Safety check error:', safetyError);
            safetyStatus = 'Check failed';
            analysisDetails.push('Security analysis failed');
          }
          
          // Estimate traffic based on domain characteristics
          try {
            analysisDetails.push('Estimating traffic volume...');
            const popularDomains = [
              'google', 'facebook', 'youtube', 'amazon', 'twitter', 'instagram', 
              'linkedin', 'microsoft', 'apple', 'github', 'stackoverflow', 'reddit',
              'wikipedia', 'yahoo', 'ebay', 'netflix', 'spotify', 'zoom', 'slack',
              'dropbox', 'salesforce', 'adobe', 'oracle', 'ibm', 'intel', 'nvidia',
              'nykaa' // Add nykaa as it's the example domain
            ];
            
            let isPopular = false;
            for (const popular of popularDomains) {
              if (domain.includes(popular)) {
                isPopular = true;
                trustScore += 20;
                analysisDetails.push(`Recognized popular domain (${popular})`);
                break;
              }
            }
            
            // Estimate traffic based on trust score and other factors
            if (isPopular) {
              trafficEstimate = 'Very High';
              analysisDetails.push('Belongs to a major platform');
            } else if (trustScore > 85) {
              trafficEstimate = 'High';
              analysisDetails.push('High trust score indicates established site');
            } else if (trustScore > 70) {
              trafficEstimate = 'Medium';
              analysisDetails.push('Moderate traffic expected');
            } else if (trustScore > 50) {
              trafficEstimate = 'Low';
              analysisDetails.push('Lower traffic site');
            } else {
              trafficEstimate = 'Very Low';
              analysisDetails.push('Very low traffic or new site');
            }
          } catch (trafficError) {
            console.warn('Traffic estimation error:', trafficError);
            trafficEstimate = 'Estimation failed';
            analysisDetails.push('Traffic estimation failed');
          }
          
          // Final adjustments to trust score
          trustScore = Math.max(0, Math.min(100, trustScore));
          
          const result = {
            domainAge,
            trustScore,
            trafficEstimate,
            safetyStatus,
            analysisDetails
          };
          
          console.log('Site analysis result:', result);
          
          // Return the analysis results
          sendResponse({
            success: true,
            type: 'ANALYZE_SITE_RESULT',
            data: result
          });
        } catch (error) {
          console.error('Site analysis error:', error);
          sendResponse({ success: false, error: error.message });
        }
        return true; // Indicates that sendResponse will be called asynchronously
      } else if (message.type === 'GET_SETTINGS') {
        // Handle get settings request
        try {
          const settings = await getSettings();
          sendResponse({
            success: true,
            provider: settings.provider,
            model: settings.model
          });
        } catch (error) {
          console.error('Get settings error:', error);
          sendResponse({ success: false, error: error.message });
        }
        return true;
      } else {
        sendResponse({ ok: true });
      }
    } catch (err) {
      console.error('Background message handler error:', err);
      sendResponse({ success: false, error: err.message });
    }
  })();
  // Will respond asynchronously
  return true;
});

// Add a simple ping handler for testing
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ success: true, message: 'PONG' });
    return true;
  }
  // For all other messages, let the main listener handle them
  return false;
});
