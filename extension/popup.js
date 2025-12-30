// popup.js - handles popup UI interactions and message passing

// Function to show status messages
function showStatus(message) {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
  }
}

// Function to showError messages
function showError(message) {
  // Remove any existing error messages
  const existingError = document.querySelector('.error');
  if (existingError) {
    existingError.remove();
  }
  
  // Create and show new error message
  const errorEl = document.createElement('div');
  errorEl.className = 'error';
  errorEl.textContent = message;
  
  // Insert before the input area
  const inputArea = document.querySelector('.input-area');
  if (inputArea) {
    inputArea.parentNode.insertBefore(errorEl, inputArea);
  }
}

// Function to show output in chat format
function showOutput(text, isUser = false) {
  const messagesContainer = document.getElementById('messages');
  if (messagesContainer) {
    // Remove any typing indicators
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
    
    // Create message bubble
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message assistant-message';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    headerDiv.textContent = isUser ? 'You' : 'Assistant';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Switch to chat tab to show the response
    if (!isUser) {
      switchTab('chat');
    }
  }
}

// Function to show loading/typing indicator
function showTypingIndicator() {
  const messagesContainer = document.getElementById('messages');
  if (messagesContainer) {
    // Remove any existing typing indicators
    const existingIndicator = document.querySelector('.typing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    // Create typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      typingDiv.appendChild(dot);
    }
    
    messagesContainer.appendChild(typingDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Function to hide loading state
function hideLoading() {
  // Remove typing indicator if present
  const typingIndicator = document.querySelector('.typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Function to get the current tab
async function getCurrentTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  } catch (error) {
    console.error('Error getting current tab:', error);
    return null;
  }
}

// Function to load model options
async function loadModelOptions() {
  const modelSelect = document.getElementById('modelSelect');
  
  // Get saved model preference
  chrome.storage.sync.get(['model'], (data) => {
    const savedModel = data.model || '';
    
    // Clear existing options
    modelSelect.innerHTML = '';
    
    // Add model options - ONLY OpenRouter models
    const models = [
      // OpenRouter Free Models
      { value: 'openchat/openchat-7b', label: 'OpenChat 7B (Free)', group: 'OpenRouter Free' },
      { value: 'mistralai/mistral-7b-instruct', label: 'Mistral 7B Instruct (Free)', group: 'OpenRouter Free' },
      { value: 'google/gemma-7b-it', label: 'Gemma 7B IT (Free)', group: 'OpenRouter Free' },
      { value: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo', label: 'Nous Hermes 2 Mixtral 8x7B (Free)', group: 'OpenRouter Free' },
      { value: 'microsoft/phi-3-medium-128k-instruct', label: 'Phi-3 Medium 128K (Free)', group: 'OpenRouter Free' },
      { value: 'meta-llama/llama-3-8b-instruct', label: 'Llama 3 8B Instruct (Free)', group: 'OpenRouter Free' }
    ];
    
    // Group models by provider
    const groups = {};
    models.forEach(model => {
      if (!groups[model.group]) {
        groups[model.group] = [];
      }
      groups[model.group].push(model);
    });
    
    // Add options to select
    Object.keys(groups).forEach(groupName => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = groupName;
      
      groups[groupName].forEach(model => {
        const option = document.createElement('option');
        option.value = model.value;
        option.textContent = model.label;
        if (model.value === savedModel) {
          option.selected = true;
        }
        optgroup.appendChild(option);
      });
      
      modelSelect.appendChild(optgroup);
    });
    
    // Add event listener for model change
    modelSelect.addEventListener('change', () => {
      const selectedModel = modelSelect.value;
      chrome.storage.sync.set({ model: selectedModel }, () => {
        showStatus(`Model updated to: ${selectedModel}`);
        setTimeout(() => showStatus('Ready'), 2000);
      });
    });
  });
}

// Function to call the AI API through the background script
async function callAI(prompt, task = 'chat') {
  try {
    showTypingIndicator();
    showStatus('Sending request to AI...');
    
    // Get selected model
    const modelSelect = document.getElementById('modelSelect');
    const selectedModel = modelSelect.value;
    
    // Prepare payload based on task
    let payload = {};
    
    if (task === 'chat') {
      payload = {
        task: task,
        text: prompt,
        selectedModel: selectedModel
      };
    } else if (task === 'summarize') {
      payload = {
        task: task,
        text: prompt,
        selectedModel: selectedModel
      };
    } else {
      // Default chat payload
      payload = {
        task: task,
        text: prompt,
        selectedModel: selectedModel
      };
    }
    
    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      type: 'AI_REQUEST',
      payload: payload
    });
    
    hideLoading();
    
    if (!response) {
      throw new Error('No response from background script');
    }
    
    if (!response.success) {
      throw new Error(response.error || 'Unknown error from AI service');
    }
    
    // Extract text from response
    let text = '';
    if (response.data && typeof response.data === 'object') {
      if (response.data.text) {
        text = response.data.text;
      } else if (response.data.choices && response.data.choices.length > 0) {
        const choice = response.data.choices[0];
        if (choice.message && choice.message.content) {
          text = choice.message.content;
        } else if (choice.text) {
          text = choice.text;
        }
      } else if (response.data.result) {
        text = response.data.result;
      } else {
        // Try to stringify the whole response data
        text = JSON.stringify(response.data, null, 2);
      }
    } else if (typeof response.data === 'string') {
      text = response.data;
    }
    
    // Clean up the response - remove extra whitespace and trim
    text = text.trim();
    
    if (!text) {
      throw new Error('Received empty response from AI service');
    }
    
    return text;
  } catch (error) {
    hideLoading();
    console.error('AI call error:', error);
    throw error;
  }
}

// Function to get selected text from the current page
async function getSelectedText() {
  try {
    const tab = await getCurrentTab();
    if (!tab) {
      throw new Error('No active tab found');
    }
    
    // Send message to content script to get selected text
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_SELECTED_TEXT' });
    
    if (response && response.type === 'SELECTED_TEXT' && response.content) {
      return response.content;
    } else {
      throw new Error('No text selected');
    }
  } catch (error) {
    console.error('Error getting selected text:', error);
    throw error;
  }
}

// Function to get page content
async function getPageContent() {
  try {
    const tab = await getCurrentTab();
    if (!tab) {
      throw new Error('No active tab found');
    }
    
    // Send message to content script to get page content
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PAGE_CONTENT' });
    
    if (response && response.type === 'PAGE_CONTENT' && response.content) {
      return response.content;
    } else {
      throw new Error('Failed to get page content');
    }
  } catch (error) {
    console.error('Error getting page content:', error);
    throw error;
  }
}

// Function to check site reputation
async function checkSiteReputation(url) {
  try {
    showStatus('Checking site reputation...');
    
    // Extract domain from URL
    const domain = new URL(url).hostname;
    
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
        domainAge = 'Not registered';
        trustScore -= 20; // Suspicious if no registration info
        analysisDetails.push('Unable to verify domain registration');
      }
    } catch (whoisError) {
      console.warn('WHOIS API error:', whoisError);
      domainAge = 'Check failed';
      analysisDetails.push('Domain registration check failed');
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
        'dropbox', 'salesforce', 'adobe', 'oracle', 'ibm', 'intel', 'nvidia'
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
    
    // Return the analysis results
    return {
      domainAge,
      trustScore,
      trafficEstimate,
      safetyStatus,
      analysisDetails
    };
  } catch (error) {
    console.error('Error checking site reputation:', error);
    throw error;
  }
}

// Function to handle sending messages
async function sendMessage() {
  const promptInput = document.getElementById('userInput'); // Changed from 'promptInput' to 'userInput'
  const prompt = promptInput.value.trim();
  
  if (!prompt) {
    showError('Please enter a message');
    return;
  }
  
  // Show user message
  showOutput(prompt, true);
  
  // Clear input
  promptInput.value = '';
  promptInput.style.height = 'auto';
  
  // Add system instruction to keep responses short and focused
  const systemInstruction = "You are a helpful AI assistant. Provide clear, concise responses in 2-3 sentences maximum. Do not include model information, token counts, or debugging details. Only provide the requested information.";
  const fullPrompt = `${systemInstruction}\n\nUser: ${prompt}\nAssistant:`;
  
  try {
    const result = await callAI(fullPrompt, 'chat');
    showOutput(result);
    showStatus('Response received');
  } catch (error) {
    showError(`Error: ${error.message}`);
    showStatus('Error occurred');
  }
}

// Client-side OCR using Tesseract.js
async function performOcrClientSide(file) {
  return new Promise((resolve, reject) => {
    try {
      // Inject Tesseract.js loader script
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('libs/tesseract-loader.js');
      
      script.onload = async () => {
        try {
          // Wait a bit for the loader to initialize
          setTimeout(async () => {
            if (typeof window.__loadTesseract === 'function') {
              try {
                showStatus('Loading OCR engine...');
                const Tesseract = await window.__loadTesseract();
                
                showStatus('Performing OCR...');
                const result = await Tesseract.recognize(file, 'eng', {
                  logger: (m) => {
                    if (m.status === 'recognizing text') {
                      const progress = Math.round(m.progress * 100);
                      showStatus(`Performing OCR... ${progress}%`);
                    }
                  }
                });
                
                resolve(result.data.text);
              } catch (ocrError) {
                reject(ocrError);
              }
            } else {
              reject(new Error('Tesseract.js loader did not initialize properly'));
            }
          }, 100);
        } catch (initError) {
          reject(initError);
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Tesseract.js loader'));
      };
      
      document.head.appendChild(script);
    } catch (injectError) {
      reject(injectError);
    }
  });
}

// Function to switch tabs
function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show the selected tab content
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Mark the clicked tab as active
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved settings and populate model selection
  chrome.storage.sync.get(['model'], (data) => {
    const modelSelect = document.getElementById('modelSelect');
    if (data.model) {
      modelSelect.value = data.model;
    } else {
      // Set default model if none is saved
      modelSelect.value = 'meta-llama/llama-3-8b-instruct';
    }
  });
  
  // Get DOM elements
  const promptInput = document.getElementById('userInput'); // Changed from 'promptInput' to 'userInput'
  const sendButton = document.getElementById('sendButton');
  
  // Check if we have access to chrome APIs
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    showError('Extension context is not available. Please reload the extension.');
    return;
  }
  
  // Set up tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });
  
  // Load model options
  loadModelOptions();
  
  // Set up event listeners
  sendButton.addEventListener('click', sendMessage);
  
  // Allow Enter key to submit when Shift is not pressed
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    
    // Auto-resize textarea
    if (e.key !== 'Enter') {
      setTimeout(() => {
        promptInput.style.height = 'auto';
        promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
      }, 0);
    }
  });
  
  // Summarize button
  document.getElementById('summarizePage').addEventListener('click', async () => { // Changed from 'summarizeButton' to 'summarizePage'
    // Show the summarize panel
    document.getElementById('summarize-panel').style.display = 'block';
    // Hide other panels
    document.getElementById('explain-panel').style.display = 'none';
    document.getElementById('rewrite-panel').style.display = 'none';
  });
  
  // Handle summarize submission
  document.getElementById('submitSummarize').addEventListener('click', async () => {
    const content = document.getElementById('summarizeContent').value.trim();
    if (!content) {
      showError('Please enter text to summarize');
      return;
    }
    
    try {
      showTypingIndicator();
      showStatus('Summarizing text...');
      
      // Add system instruction to keep responses short and focused
      const systemInstruction = "You are a helpful AI assistant. Provide a concise summary in 2-3 sentences maximum. Do not include model information, token counts, or debugging details. Only provide the summary.";
      const prompt = `${systemInstruction}
        
Please provide a concise summary of the following text:
        
${content}`;
      
      const result = await callAI(prompt, 'summarize');
      showOutput(result);
      showStatus('Summary completed');
      
      // Hide the panel after submission
      document.getElementById('summarize-panel').style.display = 'none';
      // Clear the input
      document.getElementById('summarizeContent').value = '';
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      showStatus('Error occurred');
    }
  });
  
  // Explain button
  document.getElementById('explainSelection').addEventListener('click', async () => { // Changed from 'explainButton' to 'explainSelection'
    // Show the explain panel
    document.getElementById('explain-panel').style.display = 'block';
    // Hide other panels
    document.getElementById('summarize-panel').style.display = 'none';
    document.getElementById('rewrite-panel').style.display = 'none';
  });
  
  // Handle explain submission
  document.getElementById('submitExplain').addEventListener('click', async () => {
    const content = document.getElementById('explainContent').value.trim();
    if (!content) {
      showError('Please enter code or text to explain');
      return;
    }
    
    try {
      showTypingIndicator();
      showStatus('Explaining code...');
      
      // Add system instruction to keep responses short and focused
      const systemInstruction = "You are a helpful AI assistant. Provide a clear explanation in 2-3 sentences maximum. Do not include model information, token counts, or debugging details. Only provide the explanation.";
      const prompt = `${systemInstruction}
        
Please explain the following code or text in simple terms:
        
${content}`;
      
      const result = await callAI(prompt, 'explain_code');
      showOutput(result);
      showStatus('Explanation completed');
      
      // Hide the panel after submission
      document.getElementById('explain-panel').style.display = 'none';
      // Clear the input
      document.getElementById('explainContent').value = '';
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      showStatus('Error occurred');
    }
  });
  
  // Rewrite button
  document.getElementById('rewriteContent').addEventListener('click', async () => { // Changed from 'rewriteButton' to 'rewriteContent'
    // Show the rewrite panel
    document.getElementById('rewrite-panel').style.display = 'block';
    // Hide other panels
    document.getElementById('summarize-panel').style.display = 'none';
    document.getElementById('explain-panel').style.display = 'none';
  });
  
  // Handle rewrite submission
  document.getElementById('submitRewrite').addEventListener('click', async () => {
    const content = document.getElementById('rewriteContentInput').value.trim();
    const instructions = document.getElementById('rewriteInstructions').value.trim();
    
    if (!content) {
      showError('Please enter text to rewrite');
      return;
    }
    
    if (!instructions) {
      showError('Please enter rewrite instructions');
      return;
    }
    
    try {
      showTypingIndicator();
      showStatus('Rewriting text...');
      
      // Add system instruction to keep responses short and focused
      const systemInstruction = "You are a helpful AI assistant. Rewrite the text to improve clarity and flow in 2-3 sentences maximum. Do not include model information, token counts, or debugging details. Only provide the rewritten text.";
      const prompt = `${systemInstruction}
      
Please rewrite the following text according to the instructions:
      
Text to rewrite:
${content}

Instructions:
${instructions}`;
      
      const result = await callAI(prompt, 'improve_text');
      showOutput(result);
      showStatus('Rewrite completed');
      
      // Hide the panel after submission
      document.getElementById('rewrite-panel').style.display = 'none';
      // Clear the inputs
      document.getElementById('rewriteContentInput').value = '';
      document.getElementById('rewriteInstructions').value = '';
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      showStatus('Error occurred');
    }
  });
  
  // PDF processing button
  document.getElementById('processPDF').addEventListener('click', async () => { // Changed from 'pdfButton' to 'processPDF'
    try {
      showTypingIndicator();
      showStatus('Selecting PDF file...');
      
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf';
      
      // Wait for file selection
      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
          hideLoading();
          showError('No file selected');
          return;
        }
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          hideLoading();
          showError('File too large. Please select a PDF under 10MB.');
          return;
        }
        
        try {
          showStatus('Processing PDF...');
          
          // Read file as ArrayBuffer for transmission
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Send message to background script to process PDF
          const response = await chrome.runtime.sendMessage({
            type: 'PROCESS_PDF',
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: Array.from(uint8Array) // Convert to array for transmission
          });
          
          if (!response) {
            throw new Error('No response from background script');
          }
          
          if (!response.success) {
            throw new Error(response.error || 'Failed to process PDF');
          }
          
          // Show the extracted text
          showOutput(`PDF Content Extracted:\n\n${response.data.text}`);
          showStatus('PDF processed successfully');
        } catch (error) {
          hideLoading();
          showError(`Error: ${error.message}`);
          showStatus('Error occurred');
        }
      };
      
      // Trigger file selection
      fileInput.click();
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      showStatus('Error occurred');
    }
  });
  
  // OCR button
  document.getElementById('processImage').addEventListener('click', async () => { // Changed from 'ocrButton' to 'processImage'
    try {
      showTypingIndicator();
      showStatus('Selecting image file...');
      
      // Create a file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      
      // Wait for file selection
      fileInput.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
          hideLoading();
          showError('No file selected');
          return;
        }
        
        // Check file size (limit to 5MB for OCR)
        if (file.size > 5 * 1024 * 1024) {
          hideLoading();
          showError('File too large. Please select an image under 5MB.');
          return;
        }
        
        try {
          showStatus('Processing image...');
          
          // Read file as ArrayBuffer for transmission
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Send message to background script to process OCR
          const response = await chrome.runtime.sendMessage({
            type: 'PROCESS_OCR',
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: Array.from(uint8Array) // Convert to array for transmission
          });
          
          if (!response) {
            throw new Error('No response from background script');
          }
          
          if (!response.success) {
            throw new Error(response.error || 'Failed to process image');
          }
          
          // Show the extracted text
          showOutput(`OCR Content Extracted:\n\n${response.data.text}`);
          showStatus('Image processed successfully');
        } catch (error) {
          hideLoading();
          showError(`Error: ${error.message}`);
          showStatus('Error occurred');
        }
      };
      
      // Trigger file selection
      fileInput.click();
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      showStatus('Error occurred');
    }
  });

  // Site Info button
  document.getElementById('analyzeSite').addEventListener('click', async () => { // Changed from 'siteInfoButton' to 'analyzeSite'
    try {
      showTypingIndicator();
      showStatus('Analyzing site...');
      
      // Get current tab info
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const tab = tabs[0];
      
      if (!tab) {
        throw new Error('No active tab found');
      }
      
      // Send message to background script to analyze site
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_SITE',
        payload: {
          url: tab.url
        }
      });
      
      if (!response || !response.success) {
        throw new Error(response?.error || 'Failed to analyze site');
      }
      
      // Get page metadata
      const pageInfo = {
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl
      };
      
      // Use the analysis data from the response
      const analysis = response.data;
      
      // Format the information nicely with emojis and better formatting
      const trustScorePercentage = Math.round(analysis.trustScore);
      const trustScoreVisual = '█'.repeat(Math.floor(trustScorePercentage / 10)) + '░'.repeat(10 - Math.floor(trustScorePercentage / 10));
      
      // Determine emoji based on trust score
      let trustEmoji = '🔴'; // Red circle for low trust
      if (trustScorePercentage >= 80) trustEmoji = '🟢'; // Green circle for high trust
      else if (trustScorePercentage >= 60) trustEmoji = '🟡'; // Yellow circle for medium trust
      else if (trustScorePercentage >= 40) trustEmoji = '🟠'; // Orange circle for moderate trust
      
      // Determine safety emoji
      let safetyEmoji = '⚠️';
      if (analysis.safetyStatus === 'Likely Safe') safetyEmoji = '✅';
      else if (analysis.safetyStatus === 'High Risk') safetyEmoji = '🚨';
      else if (analysis.safetyStatus === 'Suspicious') safetyEmoji = '⚠️';
      else if (analysis.safetyStatus === 'Caution') safetyEmoji = '🔶';
      
      // Determine traffic emoji
      let trafficEmoji = '📊';
      if (analysis.trafficEstimate === 'Very High') trafficEmoji = '📈';
      else if (analysis.trafficEstimate === 'High') trafficEmoji = '📊';
      else if (analysis.trafficEstimate === 'Medium') trafficEmoji = '📉';
      else if (analysis.trafficEstimate === 'Low' || analysis.trafficEstimate === 'Very Low') trafficEmoji = '🔍';
      
      // Improve formatting when domain age is unknown
      let domainAgeDisplay = analysis.domainAge;
      if (analysis.domainAge === 'Unknown' || analysis.domainAge === 'Not registered' || analysis.domainAge === 'Check failed') {
        domainAgeDisplay = `${analysis.domainAge} (heuristic analysis used)`;
      }
      
      const infoText = `
🌐 Site Analysis Report 🌐

🔖 Title: ${pageInfo.title}
🔗 URL: ${pageInfo.url}
🖼️ Favicon: ${pageInfo.favicon || 'Not available'}

${trustEmoji} Trust Score: ${trustScorePercentage}/100
[${trustScoreVisual}]

${safetyEmoji} Safety Status: ${analysis.safetyStatus}
📅 Domain Age: ${domainAgeDisplay}
${trafficEmoji} Traffic Estimate: ${analysis.trafficEstimate}

🔍 Analysis Details:
• ${analysis.analysisDetails.slice(0, 5).join('\n• ')}`;

      showOutput(infoText);
      showStatus('Site analysis completed');
    } catch (error) {
      hideLoading();
      showError(`Error: ${error.message}`);
      showStatus('Error occurred');
    }
  });

  showStatus('Ready');
});