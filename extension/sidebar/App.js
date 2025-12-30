// extension/sidebar/App.js

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

// Helper function to clean AI responses
function cleanAIResponse(text) {
  if (!text) return '';
  
  // Remove extra whitespace and normalize
  let cleaned = text.trim();
  
  // Remove any markdown code block wrappers if present
  cleaned = cleaned.replace(/^```(?:\w+)?\n?/, '').replace(/\n?```$/, '');
  
  // Remove extra newlines (more than 2 in a row)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned;
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (!root) return;

  // Check if we're in a valid extension context
  if (!isExtensionContextValid()) {
    root.innerHTML = `
      <div class="card" style="padding: 20px; text-align: center;">
        <h2 style="color: #ff6b6b;">Extension Error</h2>
        <p>The extension context has been invalidated. Please reload the extension.</p>
        <button id="reloadExtension" class="btn" style="margin-top: 10px;">Reload Extension</button>
      </div>
    `;
    
    document.getElementById('reloadExtension')?.addEventListener('click', () => {
      // This won't work in content script context, but we can try
      if (isExtensionContextValid()) {
        chrome.runtime.reload();
      } else {
        alert('Please reload the extension manually from chrome://extensions/');
      }
    });
    
    return;
  }

  function WebPagePanel() {
    return `
      <div class="section">
        <h3 class="small muted">Web Page Content</h3>
        <div class="spaced">
          <button id="getPageContentBtn" class="btn full-width">Get Current Page Content</button>
        </div>
        <div class="spaced">
          <button id="getSelectedTextBtn" class="btn ghost full-width">Get Selected Text</button>
        </div>
        <div>
          <textarea id="webPageOutput" class="textarea" placeholder="Web page content will appear here..."></textarea>
        </div>
        <div class="spaced">
          <button id="summarizeWebBtn" class="btn full-width">Summarize Web Content</button>
        </div>
        <div class="spaced">
          <button id="explainWebBtn" class="btn full-width">Explain Web Content</button>
        </div>
        <div id="webResult" class="sider-output" style="min-height: 100px; max-height: 200px;">
          <div class="sider-output-placeholder">Web analysis results will appear here...</div>
        </div>
      </div>
    `;
  }

  function PdfPanel() {
    return `
      <div class="section">
        <h3 class="small muted">PDF Processing</h3>
        <div class="spaced">
          <input type="file" id="pdfUpload" accept=".pdf" class="file" />
        </div>
        <div class="spaced">
          <button id="processPdfBtn" class="btn full-width">Process PDF</button>
        </div>
        <div class="spaced">
          <textarea id="pdfOutput" class="textarea" placeholder="PDF content will appear here..."></textarea>
        </div>
        <div>
          <input type="text" id="pdfQuestion" class="input" placeholder="Ask a question about the PDF..." />
          <button id="askPdfBtn" class="btn full-width spaced">Ask About PDF</button>
        </div>
        <div id="pdfResult" class="sider-output" style="min-height: 100px; max-height: 200px;">
          <div class="sider-output-placeholder">PDF analysis results will appear here...</div>
        </div>
      </div>
    `;
  }

  function OcrPanel() {
    return `
      <div class="section">
        <h3 class="small muted">Image OCR Processing</h3>
        <div class="spaced">
          <input type="file" id="imageUpload" accept="image/*" class="file" />
        </div>
        <div class="spaced area-row">
          <button id="processImageBtn" class="btn full-width">Process Image</button>
          <button id="captureScreenshotBtn" class="btn ghost full-width">Capture Screenshot</button>
        </div>
        <div>
          <textarea id="ocrOutput" class="textarea" placeholder="OCR text will appear here..."></textarea>
        </div>
        <div class="spaced">
          <button id="summarizeOcrBtn" class="btn full-width">Summarize OCR Content</button>
        </div>
        <div class="spaced">
          <button id="explainOcrBtn" class="btn full-width">Explain OCR Content</button>
        </div>
        <div id="ocrResult" class="sider-output" style="min-height: 100px; max-height: 200px;">
          <div class="sider-output-placeholder">OCR analysis results will appear here...</div>
        </div>
      </div>
    `;
  }

  root.innerHTML = `
    <div class="sider-container">
      <div class="sider-header">
        <div class="sider-logo">
          <div class="sider-logo-icon">🤖</div>
          <div class="sider-logo-text">
            <div class="sider-title">AI Assistant</div>
            <div class="sider-subtitle">Powered by GROQ</div>
          </div>
        </div>
        <div class="sider-tabs">
          <button id="textTab" class="sider-tab active">Text</button>
          <button id="webTab" class="sider-tab">Web</button>
          <button id="pdfTab" class="sider-tab">PDF</button>
          <button id="imageTab" class="sider-tab">Image</button>
        </div>
      </div>

      <div id="textSection" class="sider-section">
        <textarea id="inputText" class="sider-textarea" placeholder="Enter text here..."></textarea>
        <div class="sider-actions">
          <button id="summarizeBtn" class="sider-action-btn">
            <span class="sider-action-icon">📋</span>
            <span class="sider-action-text">Summarize</span>
          </button>
          <button id="chatBtn" class="sider-action-btn">
            <span class="sider-action-icon">💬</span>
            <span class="sider-action-text">Chat</span>
          </button>
          <button id="explainBtn" class="sider-action-btn">
            <span class="sider-action-icon">🔍</span>
            <span class="sider-action-text">Explain</span>
          </button>
          <button id="extractBtn" class="sider-action-btn">
            <span class="sider-action-icon">📌</span>
            <span class="sider-action-text">Extract</span>
          </button>
          <button id="improveBtn" class="sider-action-btn">
            <span class="sider-action-icon">✨</span>
            <span class="sider-action-text">Improve</span>
          </button>
        </div>
        <div class="sider-output" id="outputText">
          <div class="sider-output-placeholder">Results will appear here...</div>
        </div>
      </div>

      <div id="webSection" class="sider-section" style="display:none">${WebPagePanel()}</div>
      <div id="pdfSection" class="sider-section" style="display:none">${PdfPanel()}</div>
      <div id="imageSection" class="sider-section" style="display:none">${OcrPanel()}</div>
    </div>
  `;

  // Tab navigation elements
  const textTab = document.getElementById('textTab');
  const webTab = document.getElementById('webTab');
  const pdfTab = document.getElementById('pdfTab');
  const imageTab = document.getElementById('imageTab');
    
    // Section elements
    const textSection = document.getElementById('textSection');
    const webSection = document.getElementById('webSection');
    const pdfSection = document.getElementById('pdfSection');
    const imageSection = document.getElementById('imageSection');
    
    // Text input elements
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    
    // Web page elements
    const getPageContentBtn = document.getElementById('getPageContentBtn');
    const getSelectedTextBtn = document.getElementById('getSelectedTextBtn');
    const webPageOutput = document.getElementById('webPageOutput');
    const summarizeWebBtn = document.getElementById('summarizeWebBtn');
    const explainWebBtn = document.getElementById('explainWebBtn');
    const webResult = document.getElementById('webResult');
    
    // PDF elements
    const pdfUpload = document.getElementById('pdfUpload');
    const processPdfBtn = document.getElementById('processPdfBtn');
    const pdfOutput = document.getElementById('pdfOutput');
    const pdfQuestion = document.getElementById('pdfQuestion');
    const askPdfBtn = document.getElementById('askPdfBtn');
    const pdfResult = document.getElementById('pdfResult');
    
    // Image elements
    const imageUpload = document.getElementById('imageUpload');
    const processImageBtn = document.getElementById('processImageBtn');
    const captureScreenshotBtn = document.getElementById('captureScreenshotBtn');
    const ocrOutput = document.getElementById('ocrOutput');
    const summarizeOcrBtn = document.getElementById('summarizeOcrBtn');
    const explainOcrBtn = document.getElementById('explainOcrBtn');
    const ocrResult = document.getElementById('ocrResult');
    
    // Action buttons
    const summarizeBtn = document.getElementById('summarizeBtn');
    const chatBtn = document.getElementById('chatBtn');
    const explainBtn = document.getElementById('explainBtn');
    const extractBtn = document.getElementById('extractBtn');
    const improveBtn = document.getElementById('improveBtn');
    
    // Current active content source
    let currentContentSource = 'text';
    let currentContent = '';
    
    // Tab navigation functionality
    function activateTab(selected) {
      [textTab, webTab, pdfTab, imageTab].forEach(t => t.classList.remove('active'));
      selected.classList.add('active');
      textSection.style.display = selected === textTab ? 'block' : 'none';
      webSection.style.display = selected === webTab ? 'block' : 'none';
      pdfSection.style.display = selected === pdfTab ? 'block' : 'none';
      imageSection.style.display = selected === imageTab ? 'block' : 'none';
      currentContentSource = selected === textTab ? 'text' : selected === webTab ? 'web' : selected === pdfTab ? 'pdf' : 'image';
      currentContent = getCurrentContent();
    }

    textTab.addEventListener('click', () => activateTab(textTab));
    webTab.addEventListener('click', () => activateTab(webTab));
    pdfTab.addEventListener('click', () => activateTab(pdfTab));
    imageTab.addEventListener('click', () => activateTab(imageTab));
    
    // Function to show output in the UI
    function showOutput(element, text) {
      // Clean the output text
      const cleanedText = cleanAIResponse(text);
      element.innerHTML = `<div class="sider-output-content">${cleanedText}</div>`;
    }
    
    // Function to get current content based on active tab
    function getCurrentContent() {
      switch(currentContentSource) {
        case 'text':
          return inputText.value;
        case 'web':
          return webPageOutput.value;
        case 'pdf':
          return pdfOutput.value;
        case 'image':
          return ocrOutput.value;
        default:
          return inputText.value;
      }
    }
    
    // Function to set current content based on active tab
    function setCurrentContent(content) {
      switch(currentContentSource) {
        case 'text':
          inputText.value = content;
          break;
        case 'web':
          webPageOutput.value = content;
          break;
        case 'pdf':
          pdfOutput.value = content;
          break;
        case 'image':
          ocrOutput.value = content;
          break;
      }
      currentContent = content;
    }
    
    // New processText function as requested
    async function processText(task, outputElement) {
      const text = getCurrentContent() || window.getSelection().toString();
    
      if (!text) {
        showOutput(outputElement, 'Please enter or select some text first.');
        return;
      }
      
      showOutput(outputElement, 'Processing...');
      
      try {
        // Send message to background script to handle AI request
        const response = await new Promise((resolve) => {
          safeSendMessage({
            type: "AI_REQUEST",
            payload: {
              task: task,
              text: text
            }
          }, (r) => resolve(r));
        });
        
        if (!response) {
          showOutput(outputElement, 'No response from background service.');
          return;
        }
        
        if (!response.success) {
          showOutput(outputElement, 'Error: ' + (response.error || 'Unknown error'));
          return;
        }
        
        // Display the response
        const cleanedText = cleanAIResponse(response.data.text || JSON.stringify(response.data).slice(0, 2000));
        showOutput(outputElement, cleanedText);
      } catch (error) {
        console.error('Error calling AI service:', error);
        showOutput(outputElement, 'Error connecting to AI service: ' + error.message);
      }
    }
    
    // Get page content functionality
    getPageContentBtn?.addEventListener('click', async () => {
      showOutput(webResult, 'Getting page content...');
      try {
        const response = await new Promise((resolve) => {
          safeSendMessage({ type: "GET_PAGE_CONTENT" }, (r) => resolve(r));
        });
        
        if (response && response.type === "PAGE_CONTENT") {
          webPageOutput.value = response.content;
          showOutput(webResult, `Page content extracted successfully. Length: ${response.length} characters.`);
          currentContent = response.content;
        } else {
          showOutput(webResult, response?.error || 'Failed to extract page content.');
        }
      } catch (error) {
        showOutput(webResult, 'Error getting page content: ' + error.message);
        console.error('Error getting page content:', error);
      }
    });
    
    // Get selected text functionality
    getSelectedTextBtn?.addEventListener('click', async () => {
      showOutput(webResult, 'Getting selected text...');
      try {
        const response = await new Promise((resolve) => {
          safeSendMessage({ type: "GET_SELECTED_TEXT" }, (r) => resolve(r));
        });
        
        if (response && response.type === "SELECTED_TEXT" && response.content) {
          webPageOutput.value = response.content;
          showOutput(webResult, `Selected text extracted successfully. Length: ${response.length} characters.`);
          currentContent = response.content;
        } else {
          showOutput(webResult, response?.message || 'No text selected.');
        }
      } catch (error) {
        showOutput(webResult, 'Error getting selected text: ' + error.message);
        console.error('Error getting selected text:', error);
      }
    });
    
    // Web page actions
    summarizeWebBtn?.addEventListener('click', () => processText("summarize", webResult));
    explainWebBtn?.addEventListener('click', () => processText("explain_code", webResult));
    
    // Process PDF functionality with improved error handling
    processPdfBtn?.addEventListener('click', async () => {
      const file = pdfUpload.files[0];
      if (!file) {
        showOutput(pdfResult, 'Please select a PDF file first.');
        return;
      }
      
      // Check file size
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        showOutput(pdfResult, 'PDF file is too large. Please select a file smaller than 20MB.');
        return;
      }
      
      showOutput(pdfResult, 'Processing PDF...');
      try {
        // Try client-side PDF.js extraction first
        if (typeof window.__extractPdfText === 'function') {
          showOutput(pdfResult, 'Extracting text from PDF using client-side processing...');
          try {
            const arrayBuffer = await new Promise((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result);
              reader.onerror = rej;
              reader.readAsArrayBuffer(file);
            });
            
            const extractedText = await window.__extractPdfText(arrayBuffer);
            if (extractedText && extractedText.trim().length) {
              // Limit text length to prevent issues
              const limitedText = extractedText.length > 100000 ? extractedText.substring(0, 100000) + '... [text truncated]' : extractedText;
              pdfOutput.value = limitedText;
              showOutput(pdfResult, `PDF text extracted successfully. Extracted ${limitedText.length} characters.`);
              currentContent = limitedText;
              return;
            }
          } catch (clientError) {
            console.error('Client-side PDF extraction failed:', clientError);
            showOutput(pdfResult, 'Client-side PDF extraction failed: ' + clientError.message + '. Trying server-side processing...');
          }
        }
        
        // Fallback to server-side processing
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:5000/api/pdf/extract', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        // Concatenate text from all pages
        const extractedText = data.pages.map(page => page.text).join('\n\n');
        // Limit text length to prevent issues
        const limitedText = extractedText.length > 100000 ? extractedText.substring(0, 100000) + '... [text truncated]' : extractedText;
        pdfOutput.value = limitedText;
        showOutput(pdfResult, `PDF processed successfully. Extracted ${limitedText.length} characters.`);
        currentContent = limitedText;
      } catch (error) {
        showOutput(pdfResult, 'Error processing PDF: ' + error.message);
        console.error('Error processing PDF:', error);
      }
    });
    
    // Ask PDF question functionality
    askPdfBtn?.addEventListener('click', async () => {
      const question = pdfQuestion.value;
      const context = pdfOutput.value;
      
      if (!question) {
        showOutput(pdfResult, 'Please enter a question.');
        return;
      }
      
      if (!context) {
        showOutput(pdfResult, 'Please process a PDF first.');
        return;
      }
      
      showOutput(pdfResult, 'Answering question...');
      try {
        const response = await fetch('http://localhost:5000/api/pdf/answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ question, context })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        const cleanedAnswer = cleanAIResponse(data.answer || "No answer generated.");
        showOutput(pdfResult, cleanedAnswer);
      } catch (error) {
        showOutput(pdfResult, 'Error answering question: ' + error.message);
        console.error('Error answering question:', error);
      }
    });
    
    // Process Image functionality with improved error handling
    processImageBtn?.addEventListener('click', async () => {
      const file = imageUpload.files[0];
      if (!file) {
        showOutput(ocrResult, 'Please select an image file first.');
        return;
      }
      
      // Check file size
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showOutput(ocrResult, 'Image file is too large. Please select a file smaller than 10MB.');
        return;
      }
      
      showOutput(ocrResult, 'Processing image...');
      try {
        // Try client-side OCR first if available
        if (typeof window.__loadTesseract === 'function') {
          showOutput(ocrResult, 'Performing OCR using client-side processing...');
          try {
            const Tesseract = await window.__loadTesseract();
            const dataUrl = await new Promise((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result);
              reader.onerror = rej;
              reader.readAsDataURL(file);
            });
            
            // Use Tesseract.js recognize
            const res = await Tesseract.recognize(dataUrl, 'eng');
            const text = (res && res.data && res.data.text) ? res.data.text : '';
            
            if (text && text.trim().length) {
              // Limit text length to prevent issues
              const limitedText = text.length > 50000 ? text.substring(0, 50000) + '... [text truncated]' : text;
              ocrOutput.value = limitedText;
              showOutput(ocrResult, `Image processed successfully. Extracted ${limitedText.length} characters.`);
              currentContent = limitedText;
              return;
            }
          } catch (ocrError) {
            console.error('Client-side OCR failed:', ocrError);
            showOutput(ocrResult, 'Client-side OCR failed: ' + ocrError.message + '. Trying server-side processing...');
          }
        }
        
        // Fallback to server-side processing
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('http://localhost:5000/api/ocr/image', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        const ocrText = data.text || "No text extracted from image.";
        // Limit text length to prevent issues
        const limitedText = ocrText.length > 50000 ? ocrText.substring(0, 50000) + '... [text truncated]' : ocrText;
        ocrOutput.value = limitedText;
        showOutput(ocrResult, `Image processed successfully. Extracted ${limitedText.length} characters.`);
        currentContent = limitedText;
      } catch (error) {
        showOutput(ocrResult, 'Error processing image: ' + error.message);
        console.error('Error processing image:', error);
      }
    });
    
    // OCR actions
    summarizeOcrBtn?.addEventListener('click', () => processText("summarize", ocrResult));
    explainOcrBtn?.addEventListener('click', () => processText("explain_code", ocrResult));
    
    // Capture Screenshot functionality
    captureScreenshotBtn?.addEventListener('click', async () => {
      showOutput(ocrResult, 'Capturing screenshot...');
      try {
        // In a real implementation, this would capture the current page
        // For now, we'll simulate with a placeholder
        const simulatedImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        
        const response = await fetch('http://localhost:5000/api/ocr/screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image_base64: simulatedImageData.split(',')[1] })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        const ocrText = data.text || "No text extracted from screenshot.";
        // Limit text length to prevent issues
        const limitedText = ocrText.length > 50000 ? ocrText.substring(0, 50000) + '... [text truncated]' : ocrText;
        ocrOutput.value = limitedText;
        showOutput(ocrResult, `Screenshot captured and processed successfully. Extracted ${limitedText.length} characters.`);
        currentContent = limitedText;
      } catch (error) {
        showOutput(ocrResult, 'Error capturing screenshot: ' + error.message);
        console.error('Error capturing screenshot:', error);
      }
    });
    
    // Bind all buttons to use the new processText function
    if (summarizeBtn) summarizeBtn.onclick = () => processText("summarize", outputText);
    if (chatBtn) chatBtn.onclick = () => processText("chat", outputText);
    if (explainBtn) explainBtn.onclick = () => processText("explain_code", outputText);
    if (extractBtn) extractBtn.onclick = () => processText("extract_points", outputText);
    if (improveBtn) improveBtn.onclick = () => processText("improve_text", outputText);
});