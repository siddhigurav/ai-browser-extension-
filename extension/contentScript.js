// contentScript.js - content script for extracting page content without modifying the page
(function () {
  // Utility to extract text content from web pages without modifying the page
  function extractPageContent() {
    // Create a clone of the body to avoid modifying the original page
    const bodyClone = document.body.cloneNode(true);
    
    // Remove script and style elements from the clone to avoid extracting code
    const scripts = bodyClone.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // Remove interactive elements that might cause issues
    const interactiveElements = bodyClone.querySelectorAll('button, input, textarea, select, video, audio');
    interactiveElements.forEach(el => el.remove());
    
    // Extract text content from the cloned page
    const content = bodyClone.textContent || bodyClone.innerText || '';
    
    // Clean up whitespace while preserving some structure
    const cleanedContent = content.replace(/\s{3,}/g, '\n\n').trim();
    
    // Get page title
    const title = document.title || '';
    
    // Get page URL
    const url = window.location.href;
    
    return {
      title: title,
      url: url,
      content: cleanedContent,
      length: cleanedContent.length
    };
  }

  // Utility to extract selected text
  function extractSelectedText() {
    // Get selected text
    const selectedText = window.getSelection().toString();
    
    if (selectedText && selectedText.trim().length > 0) {
      return selectedText.trim();
    }
    
    return null;
  }

  // Listen for messages from background if needed
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    try {
      // Handle page content extraction
      if (msg && msg.type === 'EXTRACT_PAGE_CONTENT') {
        try {
          const content = extractPageContent();
          sendResponse({ 
            type: "PAGE_CONTENT", 
            content: content.content,
            title: content.title,
            url: content.url,
            length: content.length
          });
        } catch (error) {
          console.error("Error extracting page content:", error);
          sendResponse({ error: "Failed to extract page content." });
        }
        return;
      }
      
      // Handle selected text extraction
      if (msg && msg.type === 'EXTRACT_SELECTED_TEXT') {
        try {
          const selectedText = extractSelectedText();
          if (selectedText) {
            sendResponse({ 
              type: "SELECTED_TEXT", 
              content: selectedText,
              length: selectedText.length
            });
          } else {
            sendResponse({ 
              type: "SELECTED_TEXT", 
              content: null,
              message: "No text selected."
            });
          }
        } catch (error) {
          console.error("Error extracting selected text:", error);
          sendResponse({ error: "Failed to extract selected text." });
        }
        return;
      }
      
      // Handle PDF processing
      if (msg && msg.type === 'PROCESS_PDF') {
        try {
          // Load PDF.js dynamically
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL('libs/pdfjs-loader.js');
          
          script.onload = async () => {
            try {
              // Wait a bit for the loader to initialize
              setTimeout(async () => {
                if (typeof window.__loadPdfjs === 'function') {
                  try {
                    const pdfjsLib = await window.__loadPdfjs();
                    
                    // Create a Blob from the file data
                    const blob = new Blob([new Uint8Array(msg.fileData)], { type: msg.fileType });
                    const fileUrl = URL.createObjectURL(blob);
                    
                    // Load the PDF document
                    const pdf = await pdfjsLib.getDocument(fileUrl).promise;
                    
                    // Extract text from all pages
                    let fullText = '';
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                      const page = await pdf.getPage(pageNum);
                      const textContent = await page.getTextContent();
                      const pageText = textContent.items.map(item => item.str).join(' ');
                      fullText += pageText + '\n\n';
                    }
                    
                    // Clean up
                    URL.revokeObjectURL(fileUrl);
                    
                    sendResponse({ 
                      success: true, 
                      text: fullText.trim()
                    });
                  } catch (pdfError) {
                    sendResponse({ success: false, error: 'Failed to process PDF: ' + pdfError.message });
                  }
                } else {
                  sendResponse({ success: false, error: 'PDF.js loader did not initialize properly' });
                }
              }, 100);
            } catch (initError) {
              sendResponse({ success: false, error: initError.message });
            }
          };
          
          script.onerror = () => {
            sendResponse({ success: false, error: 'Failed to load PDF.js loader' });
          };
          
          document.head.appendChild(script);
        } catch (injectError) {
          sendResponse({ success: false, error: injectError.message });
        }
        return true; // Indicates that sendResponse will be called asynchronously
      }
      
      // Handle OCR processing
      if (msg && msg.type === 'PROCESS_OCR') {
        try {
          // Load Tesseract.js dynamically
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL('libs/tesseract-loader.js');
          
          script.onload = async () => {
            try {
              // Wait a bit for the loader to initialize
              setTimeout(async () => {
                if (typeof window.__loadTesseract === 'function') {
                  try {
                    const Tesseract = await window.__loadTesseract();
                    
                    // Create a Blob from the file data
                    const blob = new Blob([new Uint8Array(msg.fileData)], { type: msg.fileType });
                    
                    // Perform OCR
                    const result = await Tesseract.recognize(
                      blob,
                      'eng',
                      {
                        logger: (m) => console.log('OCR Progress:', m)
                      }
                    );
                    
                    sendResponse({ 
                      success: true, 
                      text: result.data.text
                    });
                  } catch (ocrError) {
                    sendResponse({ success: false, error: 'Failed to process image: ' + ocrError.message });
                  }
                } else {
                  sendResponse({ success: false, error: 'Tesseract.js loader did not initialize properly' });
                }
              }, 100);
            } catch (initError) {
              sendResponse({ success: false, error: initError.message });
            }
          };
          
          script.onerror = () => {
            sendResponse({ success: false, error: 'Failed to load Tesseract.js loader' });
          };
          
          document.head.appendChild(script);
        } catch (injectError) {
          sendResponse({ success: false, error: injectError.message });
        }
        return true; // Indicates that sendResponse will be called asynchronously
      }
      
      // Handle content script ready message
      if (msg && msg.type === 'CONTENT_SCRIPT_READY') {
        try {
          sendResponse({ ready: true });
        } catch (error) {
          console.error("Error responding to content script ready:", error);
          sendResponse({ success: false, error: "Failed to respond to ready message." });
        }
        return;
      }

      // Handle sidebar injection
      if (msg && msg.type === 'INJECT_SIDEBAR') {
        try {
          injectSidebar();
          sendResponse({ success: true });
        } catch (error) {
          console.error("Error injecting sidebar:", error);
          sendResponse({ success: false, error: error.message });
        }
        return;
      }
    } catch (err) {
      console.error('onMessage handler error', err);
    }
  });

  // Function to inject the sidebar into the page
  function injectSidebar() {
    // Check if sidebar is already injected
    if (document.getElementById('ai-sidebar')) {
      console.log('Sidebar already injected');
      return;
    }

    // Fetch the sidebar HTML
    fetch(chrome.runtime.getURL('sidebar/index.html'))
      .then(response => response.text())
      .then(html => {
        // Create a temporary container to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Get the body content (skip the doctype and html tags)
        const bodyContent = temp.querySelector('body').innerHTML;

        // Create a container for the sidebar
        const sidebarContainer = document.createElement('div');
        sidebarContainer.id = 'ai-sidebar-container';
        sidebarContainer.innerHTML = bodyContent;

        // Inject into the page
        document.body.appendChild(sidebarContainer);

        // Load and inject sidebar CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('sidebar/styles.css');
        document.head.appendChild(link);

        // Load and execute sidebar script
        const scriptTag = document.createElement('script');
        scriptTag.src = chrome.runtime.getURL('sidebar/script.js');
        document.body.appendChild(scriptTag);

        console.log('Sidebar injected successfully');
      })
      .catch(error => {
        console.error('Failed to inject sidebar:', error);
      });
  }
  
  // Notify background script that content script is ready
  chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' }, (response) => {
    if (chrome.runtime.lastError) {
      console.log('Background not ready yet, will retry when needed');
    }
  });
})();