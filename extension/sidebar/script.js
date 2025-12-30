// sidebar/script.js - handles UI interactions inside the injected sidebar
// Expose an initializer so the content script can inject HTML then call into this module

// Add a check for extension context validity
function isExtensionContextValid() {
  try {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

// Wrapper for chrome.runtime.sendMessage with context validation
function safeSendMessage(message, callback) {
  if (!isExtensionContextValid()) {
    console.warn('Extension context is invalid');
    if (callback) callback({ error: 'Extension context invalidated' });
    return;
  }
  
  try {
    chrome.runtime.sendMessage(message, callback);
  } catch (error) {
    console.error('Error sending message:', error);
    if (callback) callback({ error: 'Failed to send message: ' + error.message });
  }
}

function __aiSidebarInit() {
  try {
    const BUS = window;

    // Elements
    const root = document.getElementById('ai-sidebar');
    if (!root) {
      console.error('AI sidebar root element not found');
      return;
    }
    const fab = root.querySelector('#ai-fab');
    const collapseBtn = root.querySelector('#ai-collapse');
    const closeBtn = root.querySelector('#ai-close');
    const navButtons = Array.from(root.querySelectorAll('.nav-btn'));
    const panels = Array.from(root.querySelectorAll('.panel'));
    const messages = root.querySelector('#messages');
    const input = root.querySelector('#messageInput');
    const sendBtn = root.querySelector('#sendBtn');
    
    // New UI elements
    const summaryInput = root.querySelector('#summaryInput');
    const summarizeBtn = root.querySelector('#summarizeBtn');
    const summaryOutput = root.querySelector('#summaryOutput');
    
    const codeInput = root.querySelector('#codeInput');
    const explainBtn = root.querySelector('#explainBtn');
    const explainOutput = root.querySelector('#explainOutput');
    
    const pdfFile = root.querySelector('#pdfFile');
    const processPdf = root.querySelector('#processPdf');
    const pdfOutput = root.querySelector('#pdfOutput');
    const pdfQuestion = root.querySelector('#pdfQuestion');
    const askPdfBtn = root.querySelector('#askPdfBtn');
    const pdfAnswer = root.querySelector('#pdfAnswer');
    
    const getPageContentBtn = root.querySelector('#getPageContentBtn');
    const getSelectedTextBtn = root.querySelector('#getSelectedTextBtn');
    const webPageOutput = root.querySelector('#webPageOutput');
    const summarizeWebBtn = root.querySelector('#summarizeWebBtn');
    const explainWebBtn = root.querySelector('#explainWebBtn');
    const webPageResult = root.querySelector('#webPageResult');
    
    const imageFile = root.querySelector('#imageFile');
    const processImage = root.querySelector('#processImage');
    const captureScreenshot = root.querySelector('#captureScreenshot');
    const ocrOutput = root.querySelector('#ocrOutput');
    const summarizeOcrBtn = root.querySelector('#summarizeOcrBtn');
    const explainOcrBtn = root.querySelector('#explainOcrBtn');
    const ocrResult = root.querySelector('#ocrResult');

    // Site info elements
    const getSiteInfoBtn = root.querySelector('#getSiteInfoBtn');
    const siteInfoOutput = root.querySelector('#siteInfoOutput');
    const siteSummary = root.querySelector('#siteSummary');
    const domainDetails = root.querySelector('#domainDetails');
    const securityDetails = root.querySelector('#securityDetails');
    const analysisList = root.querySelector('#analysisList');
    
    // Debug logging for site info elements
    console.log('Site info elements:', {
      getSiteInfoBtn,
      siteInfoOutput,
      siteSummary,
      domainDetails,
      securityDetails,
      analysisList
    });

    // Chunk summarization state
    let chunkActive = false;
    let chunkCancelled = false;
    let chunkFirstPartial = false;
    let spinnerWrapper = null;
    let currentTaskId = null;

    function showSpinner() {
      try {
        const header = root.querySelector('.ai-header');
        if (!header || spinnerWrapper) return;
        spinnerWrapper = document.createElement('div');
        spinnerWrapper.style.display = 'inline-flex';
        spinnerWrapper.style.alignItems = 'center';
        spinnerWrapper.className = 'ai-spinner-wrapper';
        const spinner = document.createElement('div');
        spinner.className = 'ai-spinner';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ai-cancel-btn';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => {
          chunkCancelled = true;
          hideSpinner();
          appendMessage('Summarization cancelled.', 'ai');
          try { 
            safeSendMessage({ type: 'CANCEL_CHUNK_SUMMARIZE', taskId: currentTaskId }, () => {});
          } catch (e) { /* ignore */ }
        });
        spinnerWrapper.appendChild(spinner);
        spinnerWrapper.appendChild(cancelBtn);
        header.appendChild(spinnerWrapper);
      } catch (e) { /* ignore */ }
    }

    function hideSpinner() {
      try {
        if (spinnerWrapper && spinnerWrapper.parentNode) spinnerWrapper.parentNode.removeChild(spinnerWrapper);
      } catch (e) { /* ignore */ }
      spinnerWrapper = null;
    }

    // Panel switching
    navButtons.forEach(btn => btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const panel = btn.dataset.panel;
      panels.forEach(p => p.classList.remove('active'));
      const target = root.querySelector('#panel-' + panel);
      if (target) target.classList.add('active');
    }));

    // Collapse / close
    fab?.addEventListener('click', () => root.classList.toggle('collapsed'));
    collapseBtn?.addEventListener('click', () => root.classList.toggle('collapsed'));
    closeBtn?.addEventListener('click', () => root.remove());

    // Drag-to-resize
    const handle = document.createElement('div');
    handle.className = 'ai-resize-handle';
    root.appendChild(handle);
    let dragging = false;
    handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); });
    window.addEventListener('pointerup', () => dragging = false);
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const newWidth = Math.max(280, window.innerWidth - e.clientX - 24);
      root.style.width = newWidth + 'px';
    });

    // Toast helper
    function toast(msg, timeout = 4000) {
      const t = document.createElement('div');
      t.className = 'ai-toast';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), timeout);
    }

    // Message helpers
    function appendMessage(text, who = 'ai') {
      if (!messages) return;
      const el = document.createElement('div');
      el.className = 'msg ' + (who === 'user' ? 'user' : 'ai');
      el.textContent = text;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    // Typing indicator
    function showTypingIndicator() {
      if (!messages) return;
      
      // Remove existing typing indicator
      const existing = messages.querySelector('.typing-indicator');
      if (existing) existing.remove();
      
      // Create typing indicator
      const typingEl = document.createElement('div');
      typingEl.className = 'typing-indicator';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingEl.appendChild(dot);
      }
      
      messages.appendChild(typingEl);
      messages.scrollTop = messages.scrollHeight;
    }

    function hideTypingIndicator() {
      const typingEl = messages.querySelector('.typing-indicator');
      if (typingEl) typingEl.remove();
    }

    // Send logic
    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      appendMessage(text, 'user');
      input.value = '';
      
      showTypingIndicator();

      try {
        const response = await new Promise((res) => 
          safeSendMessage({ type: 'AI_REQUEST', payload: { text } }, (r) => res(r))
        );
        
        hideTypingIndicator();

        if (!response) {
          toast('No response from background');
          return;
        }
        if (!response.success) {
          toast('AI error: ' + (response.error || 'unknown'));
          appendMessage('Error: ' + (response.error || 'unknown'), 'ai');
          return;
        }

        // Show response (best-effort)
        let content = '';
        if (Array.isArray(response.data) && response.data[0] && response.data[0].generated_text) 
          content = response.data[0].generated_text;
        else if (response.data && response.data.generated_text) 
          content = response.data.generated_text;
        else 
          content = JSON.stringify(response.data).slice(0, 2000);

        appendMessage(content, 'ai');
      } catch (err) {
        hideTypingIndicator();
        console.error('sendMessage error', err);
        toast('Send failed: ' + err.message);
        appendMessage('Send failed: ' + err.message, 'ai');
      }
    }

    // Auto-resize textarea
    function resizeTextarea(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    // Event listeners for chat
    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
      
      // Auto-resize on input
      if (e.key !== 'Enter') {
        setTimeout(() => resizeTextarea(input), 0);
      }
    });

    // Summarize text
    summarizeBtn?.addEventListener('click', async () => {
      const text = summaryInput?.value.trim();
      if (!text) {
        toast('Please enter text to summarize');
        return;
      }
      
      showTypingIndicator();
      if (summaryOutput) summaryOutput.textContent = 'Summarizing...';
      
      try {
        const response = await new Promise((res) => 
          safeSendMessage({ type: 'AI_REQUEST', payload: { task: 'summarize', text } }, (r) => res(r))
        );
        
        hideTypingIndicator();
        
        if (!response || !response.success) {
          const error = response?.error || 'Unknown error';
          toast('Summarization failed: ' + error);
          if (summaryOutput) summaryOutput.textContent = 'Error: ' + error;
          return;
        }
        
        let content = '';
        if (response.data?.text) {
          content = response.data.text;
        } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          content = response.data[0].generated_text;
        } else {
          content = JSON.stringify(response.data).slice(0, 1000);
        }
        
        if (summaryOutput) summaryOutput.textContent = content;
      } catch (err) {
        hideTypingIndicator();
        console.error('Summarize error', err);
        toast('Summarization failed: ' + err.message);
        if (summaryOutput) summaryOutput.textContent = 'Error: ' + err.message;
      }
    });

    // Explain code
    explainBtn?.addEventListener('click', async () => {
      const code = codeInput?.value.trim();
      if (!code) {
        toast('Please enter code to explain');
        return;
      }
      
      showTypingIndicator();
      if (explainOutput) explainOutput.textContent = 'Explaining...';
      
      try {
        const response = await new Promise((res) => 
          safeSendMessage({ type: 'AI_REQUEST', payload: { task: 'explain_code', text: code } }, (r) => res(r))
        );
        
        hideTypingIndicator();
        
        if (!response || !response.success) {
          const error = response?.error || 'Unknown error';
          toast('Explanation failed: ' + error);
          if (explainOutput) explainOutput.textContent = 'Error: ' + error;
          return;
        }
        
        let content = '';
        if (response.data?.text) {
          content = response.data.text;
        } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          content = response.data[0].generated_text;
        } else {
          content = JSON.stringify(response.data).slice(0, 1000);
        }
        
        if (explainOutput) explainOutput.textContent = content;
      } catch (err) {
        hideTypingIndicator();
        console.error('Explain error', err);
        toast('Explanation failed: ' + err.message);
        if (explainOutput) explainOutput.textContent = 'Error: ' + err.message;
      }
    });

    // Process PDF
    processPdf?.addEventListener('click', async () => {
      if (!pdfFile?.files || pdfFile.files.length === 0) {
        toast('Please select a PDF file');
        return;
      }
      
      const file = pdfFile.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast('File too large. Please select a PDF under 10MB.');
        return;
      }
      
      showTypingIndicator();
      if (pdfOutput) pdfOutput.textContent = 'Processing PDF...';
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Try client-side PDF processing first
        try {
          // Inject PDF.js loader script
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL('libs/pdfjs-loader.js');
          
          await new Promise((resolve, reject) => {
            script.onload = async () => {
              try {
                // Wait a bit for the loader to initialize
                setTimeout(async () => {
                  if (typeof window.__extractPdfText === 'function') {
                    try {
                      const text = await window.__extractPdfText(arrayBuffer);
                      if (pdfOutput) pdfOutput.textContent = text;
                      hideTypingIndicator();
                      resolve();
                    } catch (extractionError) {
                      reject(extractionError);
                    }
                  } else {
                    reject(new Error('PDF.js loader did not initialize properly'));
                  }
                }, 100);
              } catch (initError) {
                reject(initError);
              }
            };
            
            script.onerror = () => {
              reject(new Error('Failed to load PDF.js loader'));
            };
            
            document.head.appendChild(script);
          });
        } catch (clientError) {
          console.warn('Client-side PDF processing failed, trying server-side:', clientError);
          
          // Fallback to server-side processing
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('http://localhost:5000/api/pdf/extract', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          const extractedText = data.pages && data.pages[0] ? data.pages[0].text : 'No text extracted';
          if (pdfOutput) pdfOutput.textContent = extractedText;
          hideTypingIndicator();
        }
      } catch (err) {
        hideTypingIndicator();
        console.error('PDF processing error', err);
        toast('PDF processing failed: ' + err.message);
        if (pdfOutput) pdfOutput.textContent = 'Error: ' + err.message;
      }
    });

    // Ask about PDF
    askPdfBtn?.addEventListener('click', async () => {
      const question = pdfQuestion?.value.trim();
      const pdfText = pdfOutput?.value.trim();
      
      if (!question) {
        toast('Please enter a question');
        return;
      }
      
      if (!pdfText) {
        toast('Please process a PDF first');
        return;
      }
      
      showTypingIndicator();
      if (pdfAnswer) pdfAnswer.textContent = 'Thinking...';
      
      try {
        const response = await new Promise((res) => 
          safeSendMessage({ 
            type: 'AI_REQUEST', 
            payload: { 
              task: 'ask_pdf', 
              text: `PDF Content: ${pdfText}\n\nQuestion: ${question}` 
            } 
          }, (r) => res(r))
        );
        
        hideTypingIndicator();
        
        if (!response || !response.success) {
          const error = response?.error || 'Unknown error';
          toast('Failed to answer question: ' + error);
          if (pdfAnswer) pdfAnswer.textContent = 'Error: ' + error;
          return;
        }
        
        let content = '';
        if (response.data?.text) {
          content = response.data.text;
        } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          content = response.data[0].generated_text;
        } else {
          content = JSON.stringify(response.data).slice(0, 1000);
        }
        
        if (pdfAnswer) pdfAnswer.textContent = content;
      } catch (err) {
        hideTypingIndicator();
        console.error('Ask PDF error', err);
        toast('Failed to answer question: ' + err.message);
        if (pdfAnswer) pdfAnswer.textContent = 'Error: ' + err.message;
      }
    });

    // Get page content
    getPageContentBtn?.addEventListener('click', async () => {
      showTypingIndicator();
      if (webPageOutput) webPageOutput.textContent = 'Getting page content...';
      
      try {
        const response = await new Promise((res) => 
          safeSendMessage({ type: "GET_PAGE_CONTENT" }, (r) => res(r))
        );
        
        hideTypingIndicator();
        
        if (response && response.type === "PAGE_CONTENT") {
          if (webPageOutput) webPageOutput.value = response.content;
          if (webPageResult) webPageResult.textContent = `Page content extracted successfully. Length: ${response.length} characters.`;
        } else {
          const error = response?.error || 'Failed to extract page content.';
          toast(error);
          if (webPageResult) webPageResult.textContent = error;
        }
      } catch (err) {
        hideTypingIndicator();
        console.error('Get page content error', err);
        toast('Failed to get page content: ' + err.message);
        if (webPageResult) webPageResult.textContent = 'Error: ' + err.message;
      }
    });

    // Get selected text
    getSelectedTextBtn?.addEventListener('click', async () => {
      showTypingIndicator();
      if (webPageOutput) webPageOutput.textContent = 'Getting selected text...';
      
      try {
        const response = await new Promise((res) => 
          safeSendMessage({ type: "GET_SELECTED_TEXT" }, (r) => res(r))
        );
        
        hideTypingIndicator();
        
        if (response && response.type === "SELECTED_TEXT" && response.content) {
          if (webPageOutput) webPageOutput.value = response.content;
          if (webPageResult) webPageResult.textContent = `Selected text extracted successfully. Length: ${response.length} characters.`;
        } else {
          const message = response?.message || 'No text selected.';
          toast(message);
          if (webPageResult) webPageResult.textContent = message;
        }
      } catch (err) {
        hideTypingIndicator();
        console.error('Get selected text error', err);
        toast('Failed to get selected text: ' + err.message);
        if (webPageResult) webPageResult.textContent = 'Error: ' + err.message;
      }
    });

    // Summarize web content
    summarizeWebBtn?.addEventListener('click', async () => {
      const text = webPageOutput?.value.trim();
      if (!text) {
        toast('Please get web page content first');
        return;
      }
      
      showTypingIndicator();
      if (webPageResult) webPageResult.textContent = 'Summarizing...';
      
      try {
        const response = await new Promise((res) => 
          safeSendMessage({ type: 'AI_REQUEST', payload: { task: 'summarize', text } }, (r) => res(r))
        );
        
        hideTypingIndicator();
        
        if (!response || !response.success) {
          const error = response?.error || 'Unknown error';
          toast('Summarization failed: ' + error);
          if (webPageResult) webPageResult.textContent = 'Error: ' + error;
          return;
        }
        
        let content = '';
        if (response.data?.text) {
          content = response.data.text;
        } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          content = response.data[0].generated_text;
        } else {
          content = JSON.stringify(response.data).slice(0, 1000);
        }
        
        if (webPageResult) webPageResult.textContent = content;
      } catch (err) {
        hideTypingIndicator();
        console.error('Summarize web error', err);
        toast('Summarization failed: ' + err.message);
        if (webPageResult) webPageResult.textContent = 'Error: ' + err.message;
      }
    });

    // Explain web content
    explainWebBtn?.addEventListener('click', async () => {
      const text = webPageOutput?.value.trim();
      if (!text) {
        toast('Please get web page content first');
        return;
      }
      
      showTypingIndicator();
      if (webPageResult) webPageResult.textContent = 'Explaining...';
      
      try {
        const response = await new Promise((res) => 
          safeSendMessage({ type: 'AI_REQUEST', payload: { task: 'explain_code', text } }, (r) => res(r))
        );
        
        hideTypingIndicator();
        
        if (!response || !response.success) {
          const error = response?.error || 'Unknown error';
          toast('Explanation failed: ' + error);
          if (webPageResult) webPageResult.textContent = 'Error: ' + error;
          return;
        }
        
        let content = '';
        if (response.data?.text) {
          content = response.data.text;
        } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          content = response.data[0].generated_text;
        } else {
          content = JSON.stringify(response.data).slice(0, 1000);
        }
        
        if (webPageResult) webPageResult.textContent = content;
      } catch (err) {
        hideTypingIndicator();
        console.error('Explain web error', err);
        toast('Explanation failed: ' + err.message);
        if (webPageResult) webPageResult.textContent = 'Error: ' + err.message;
      }
    });

    // Process image
    processImage?.addEventListener('click', async () => {
      if (!imageFile?.files || imageFile.files.length === 0) {
        toast('Please select an image file');
        return;
      }
      
      const file = imageFile.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast('File too large. Please select an image under 5MB.');
        return;
      }
      
      showTypingIndicator();
      if (ocrOutput) ocrOutput.textContent = 'Processing image...';
      
      try {
        // Try client-side OCR first
        try {
          // Inject Tesseract.js loader script
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL('libs/tesseract-loader.js');
          
          await new Promise((resolve, reject) => {
            script.onload = async () => {
              try {
                // Wait a bit for the loader to initialize
                setTimeout(async () => {
                  if (typeof window.__loadTesseract === 'function') {
                    try {
                      if (ocrOutput) ocrOutput.textContent = 'Loading OCR engine...';
                      const Tesseract = await window.__loadTesseract();
                      
                      if (ocrOutput) ocrOutput.textContent = 'Performing OCR...';
                      const result = await Tesseract.recognize(file, 'eng', {
                        logger: (m) => {
                          if (m.status === 'recognizing text') {
                            const progress = Math.round(m.progress * 100);
                            if (ocrOutput) ocrOutput.textContent = `Performing OCR... ${progress}%`;
                          }
                        }
                      });
                      
                      if (ocrOutput) ocrOutput.value = result.data.text;
                      hideTypingIndicator();
                      resolve();
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
          });
        } catch (clientError) {
          console.warn('Client-side OCR failed, trying server-side:', clientError);
          
          // Fallback to server-side processing
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('http://localhost:5000/api/ocr/image', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          if (ocrOutput) ocrOutput.value = data.text;
          hideTypingIndicator();
        }
      } catch (err) {
        hideTypingIndicator();
        console.error('Image processing error', err);
        toast('Image processing failed: ' + err.message);
        if (ocrOutput) ocrOutput.textContent = 'Error: ' + err.message;
      }
    });

    // Capture screenshot
    captureScreenshot?.addEventListener('click', async () => {
      try {
        // This would typically use chrome.tabs.captureVisibleTab, but that's not available in content scripts
        toast('Screenshot capture not implemented in this context');
      } catch (err) {
        console.error('Screenshot error', err);
        toast('Screenshot failed: ' + err.message);
      }
    });

    // Summarize OCR content
    summarizeOcrBtn?.addEventListener('click', async () => {
      const text = ocrOutput?.value.trim();
      if (!text) {
        toast('Please process an image first');
        return;
      }
      
      showTypingIndicator();
      if (ocrResult) ocrResult.textContent = 'Summarizing...';
      
      try {
        const response = await new Promise((res) => 
          safeSendMessage({ type: 'AI_REQUEST', payload: { task: 'summarize', text } }, (r) => res(r))
        );
        
        hideTypingIndicator();
        
        if (!response || !response.success) {
          const error = response?.error || 'Unknown error';
          toast('Summarization failed: ' + error);
          if (ocrResult) ocrResult.textContent = 'Error: ' + error;
          return;
        }
        
        let content = '';
        if (response.data?.text) {
          content = response.data.text;
        } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          content = response.data[0].generated_text;
        } else {
          content = JSON.stringify(response.data).slice(0, 1000);
        }
        
        if (ocrResult) ocrResult.textContent = content;
      } catch (err) {
        hideTypingIndicator();
        console.error('Summarize OCR error', err);
        toast('Summarization failed: ' + err.message);
        if (ocrResult) ocrResult.textContent = 'Error: ' + err.message;
      }
    });

    // Explain OCR content
    explainOcrBtn?.addEventListener('click', async () => {
      const text = ocrOutput?.value.trim();
      if (!text) {
        toast('Please process an image first');
        return;
      }
      
      showTypingIndicator();
      if (ocrResult) ocrResult.textContent = 'Explaining...';
      
      try {
        const response = await new Promise((res) => 
          safeSendMessage({ type: 'AI_REQUEST', payload: { task: 'explain_code', text } }, (r) => res(r))
        );
        
        hideTypingIndicator();
        
        if (!response || !response.success) {
          const error = response?.error || 'Unknown error';
          toast('Explanation failed: ' + error);
          if (ocrResult) ocrResult.textContent = 'Error: ' + error;
          return;
        }
        
        let content = '';
        if (response.data?.text) {
          content = response.data.text;
        } else if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          content = response.data[0].generated_text;
        } else {
          content = JSON.stringify(response.data).slice(0, 1000);
        }
        
        if (ocrResult) ocrResult.textContent = content;
      } catch (err) {
        hideTypingIndicator();
        console.error('Explain OCR error', err);
        toast('Explanation failed: ' + err.message);
        if (ocrResult) ocrResult.textContent = 'Error: ' + err.message;
      }
    });

    // Get site information
    getSiteInfoBtn?.addEventListener('click', async () => {
      showTypingIndicator();
      if (siteInfoOutput) siteInfoOutput.innerHTML = '<div>Analyzing site...</div>';
      
      try {
        // Get current tab URL
        const [tab] = await new Promise(resolve => {
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, resolve);
          } else {
            // Fallback for when chrome.tabs is not available
            resolve([{ url: window.location.href }]);
          }
        });
        
        const url = tab?.url || window.location.href;
        if (!url) {
          throw new Error('Could not determine current page URL');
        }
        
        console.log('Sending ANALYZE_SITE request for URL:', url);
        
        // Send message to background to analyze site
        const response = await new Promise((res) => 
          safeSendMessage({ type: 'ANALYZE_SITE', payload: { url } }, (r) => {
            console.log('Received ANALYZE_SITE response:', r);
            res(r);
          })
        );
        
        hideTypingIndicator();
        
        // Handle different response formats
        console.log('Raw response:', response);
        
        // Check if response has success field
        if (response && response.success === false) {
          const error = response.error || 'Unknown error';
          toast('Site analysis failed: ' + error);
          if (siteInfoOutput) siteInfoOutput.innerHTML = `<div class="error">Error: ${error}</div>`;
          return;
        }
        
        // Extract data from response
        let data = null;
        if (response && response.success === true) {
          data = response.data;
        } else if (response && response.type === 'ANALYZE_SITE_RESULT') {
          data = response.data;
        } else {
          // Assume the response itself is the data
          data = response;
        }
        
        if (!data) {
          toast('Site analysis failed: No data received');
          if (siteInfoOutput) siteInfoOutput.innerHTML = `<div class="error">Error: No data received</div>`;
          return;
        }
        
        console.log('Site analysis data:', data);
        
        // Display site information
        displaySiteInfo(data);
      } catch (err) {
        hideTypingIndicator();
        console.error('Site info error', err);
        toast('Site analysis failed: ' + err.message);
        if (siteInfoOutput) siteInfoOutput.innerHTML = `<div class="error">Error: ${err.message}</div>`;
      }
    });

    // Function to display site information
    function displaySiteInfo(data) {
      console.log('Displaying site info with data:', data);
      
      if (!siteInfoOutput) return;
      
      // Site summary
      if (siteSummary) {
        siteSummary.innerHTML = `
          <div class="site-overview">
            <h4>Site Overview</h4>
            <div class="trust-score">
              <span class="score-label">Trust Score:</span>
              <span class="score-value ${getScoreClass(data.trustScore)}">${data.trustScore}/100</span>
            </div>
            <div class="safety-status">
              <span class="status-label">Safety Status:</span>
              <span class="status-value ${getStatusClass(data.safetyStatus)}">${data.safetyStatus}</span>
            </div>
          </div>
        `;
      }
      
      // Domain details
      if (domainDetails) {
        domainDetails.innerHTML = `
          <div class="detail-item">
            <span class="detail-label">Domain Age:</span>
            <span class="detail-value">${data.domainAge || 'Unknown'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Traffic Estimate:</span>
            <span class="detail-value">${data.trafficEstimate || 'Unknown'}</span>
          </div>
        `;
      }
      
      // Security details
      if (securityDetails) {
        securityDetails.innerHTML = `
          <div class="detail-item">
            <span class="detail-label">Safety Status:</span>
            <span class="detail-value ${getStatusClass(data.safetyStatus)}">${data.safetyStatus}</span>
          </div>
        `;
      }
      
      // Analysis details
      if (analysisList && data.analysisDetails) {
        analysisList.innerHTML = data.analysisDetails
          .map(detail => `<li>${detail}</li>`)
          .join('');
      }
    }
    
    // Helper function to get CSS class based on trust score
    function getScoreClass(score) {
      if (score >= 80) return 'high-score';
      if (score >= 60) return 'medium-score';
      if (score >= 40) return 'low-score';
      return 'very-low-score';
    }
    
    // Helper function to get CSS class based on safety status
    function getStatusClass(status) {
      if (status === 'Likely Safe') return 'safe-status';
      if (status === 'Caution') return 'caution-status';
      if (status === 'Suspicious') return 'suspicious-status';
      if (status === 'High Risk') return 'high-risk-status';
      return '';
    }
    
    // Ensure auto-scroll
    if (messages) {
      const observer = new MutationObserver(() => messages.scrollTop = messages.scrollHeight);
      observer.observe(messages, { childList: true });
    }

    console.log('AI sidebar initialized');
  } catch (err) {
    console.error('AI sidebar script error', err);
  }
}

// Make available in content-script isolated world
try { window.__aiSidebarInit = __aiSidebarInit; } catch (e) { /* ignore if not writable */ }

// Auto-init if the sidebar already exists (in case the HTML was injected first)
try {
  if (document.getElementById('ai-sidebar')) {
    __aiSidebarInit();
  }
} catch (e) { /* ignore */ }

// Listen for an injected event in case the injector dispatches it before the init is available
try {
  window.addEventListener('ai-sidebar-injected', () => {
    try { __aiSidebarInit(); } catch (e) { /* ignore */ }
  });
} catch (e) { /* ignore */ }

// Note: no module export here - this file is injected as a content script and exposes
// `window.__aiSidebarInit` for the injector to call.

// Listen for progress updates from the background
try {
  if (isExtensionContextValid()) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      try {
        if (!msg || typeof msg !== 'object') return;
        if (msg.type === 'PROGRESS_UPDATE') {
          // create or update a simple progress indicator in the header
          try {
            const header = document.querySelector('.ai-header');
            if (!header) return;
            let bar = header.querySelector('.ai-progress');
            if (!bar) {
              bar = document.createElement('div');
              bar.className = 'ai-progress';
              bar.style.cssText = 'height:6px;background:#2b2b2b;border-radius:4px;overflow:hidden;margin-left:12px;flex:1;align-self:center;';
              const fill = document.createElement('div');
              fill.className = 'ai-progress-fill';
              fill.style.cssText = 'width:0%;height:100%;background:linear-gradient(90deg,var(--sider-primary),var(--sider-primary-hover));transition:width .25s;';
              bar.appendChild(fill);
              header.appendChild(bar);
            }
            const fill = bar.querySelector('.ai-progress-fill');
            if (msg.phase === 'chunking' && msg.index && msg.total) {
              const pct = Math.round((msg.index - 1) / msg.total * 100);
              fill.style.width = pct + '%';
            }
          } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }
    });
  }
} catch (e) { /* ignore */ }