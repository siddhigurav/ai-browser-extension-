// libs/pdfjs-loader.js
// Loader that exposes window.__loadPdfJs() and window.__extractPdfText(arrayBuffer)
// It expects local files at libs/pdfjs/pdf.min.js and libs/pdfjs/pdf.worker.min.js

(function () {
  async function loadPdfJs() {
    // If already loaded, return the existing instance
    if (window.pdfjsLib) return window.pdfjsLib;
    
    // Get the URLs for PDF.js files
    const scriptUrl = chrome.runtime.getURL('libs/pdfjs/pdf.min.js');
    const workerUrl = chrome.runtime.getURL('libs/pdfjs/pdf.worker.min.js');
    
    console.log('Loading PDF.js from:', scriptUrl);
    console.log('Loading PDF worker from:', workerUrl);
    
    // Check if files exist
    try {
      const scriptResponse = await fetch(scriptUrl, { method: 'HEAD' });
      const workerResponse = await fetch(workerUrl, { method: 'HEAD' });
      
      if (!scriptResponse.ok) {
        throw new Error(`PDF.js file not found at ${scriptUrl}`);
      }
      
      if (!workerResponse.ok) {
        throw new Error(`PDF worker file not found at ${workerUrl}`);
      }
    } catch (fetchError) {
      console.error('Failed to fetch PDF.js files:', fetchError);
      throw new Error('PDF.js files not accessible. Please ensure they are properly downloaded.');
    }
    
    return new Promise((resolve, reject) => {
      // Create script element to load PDF.js
      const script = document.createElement('script');
      script.src = scriptUrl;
      
      script.onload = () => {
        try {
          // Multiple attempts to access pdfjsLib
          let pdfjsLib = null;
          
          // Direct access
          if (window.pdfjsLib) {
            pdfjsLib = window.pdfjsLib;
          }
          
          // Alternative access patterns
          if (!pdfjsLib) {
            const possibleNames = ['pdfjsLib', 'pdfjs', 'PDFJS', 'pdf'];
            for (const name of possibleNames) {
              if (window[name]) {
                pdfjsLib = window[name];
                console.log(`Found PDF.js library under alternative name: ${name}`);
                break;
              }
            }
          }
          
          if (pdfjsLib) {
            console.log('PDF.js loaded successfully');
            // Set the worker source
            try {
              if (pdfjsLib.GlobalWorkerOptions) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
                console.log('PDF worker source set successfully');
              } else {
                console.warn('GlobalWorkerOptions not available, worker might not work properly');
              }
              resolve(pdfjsLib);
            } catch (workerError) {
              console.error('Failed to set PDF worker source:', workerError);
              // Still resolve since the library is loaded
              resolve(pdfjsLib);
            }
          } else {
            // Wait a bit more for pdfjsLib to be available
            setTimeout(() => {
              let delayedPdfjsLib = null;
              
              // Try again after delay
              if (window.pdfjsLib) {
                delayedPdfjsLib = window.pdfjsLib;
              } else {
                const possibleNames = ['pdfjsLib', 'pdfjs', 'PDFJS', 'pdf'];
                for (const name of possibleNames) {
                  if (window[name]) {
                    delayedPdfjsLib = window[name];
                    console.log(`Found PDF.js library under alternative name (delayed): ${name}`);
                    break;
                  }
                }
              }
              
              if (delayedPdfjsLib) {
                try {
                  if (delayedPdfjsLib.GlobalWorkerOptions) {
                    delayedPdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
                    console.log('PDF worker source set successfully (delayed)');
                  }
                  resolve(delayedPdfjsLib);
                } catch (workerError) {
                  console.error('Failed to set PDF worker source (delayed):', workerError);
                  // Still resolve since the library is loaded
                  resolve(delayedPdfjsLib);
                }
              } else {
                reject(new Error('PDF.js loaded but pdfjsLib is not available even after delay. This might be due to Content Security Policy restrictions.'));
              }
            }, 2500);
          }
        } catch (err) {
          console.error('Error initializing PDF.js:', err);
          reject(err);
        }
      };
      
      script.onerror = (error) => {
        console.error('Failed to load PDF.js script:', error);
        reject(new Error('Failed to load pdf.min.js from ' + scriptUrl + '. This might be due to network issues or Content Security Policy restrictions.'));
      };
      
      // Add script to document head
      document.head.appendChild(script);
    });
  }

  async function extractPdfTextFromArrayBuffer(arrayBuffer) {
    try {
      console.log('Starting PDF text extraction');
      const pdfjsLib = await loadPdfJs();
      console.log('PDF.js loaded, processing document');
      
      // Validate input
      if (!arrayBuffer || !(arrayBuffer instanceof ArrayBuffer)) {
        throw new Error('Invalid input: Expected ArrayBuffer');
      }
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log('PDF document loaded, pages:', pdf.numPages);
      
      let fullText = '';
      
      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          console.log('Processing page', i);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Filter out empty strings and join with spaces
          const pageText = textContent.items
            .map(item => item.str)
            .filter(str => str && str.trim().length > 0)
            .join(' ');
            
          fullText += (i > 1 ? '\n\n' : '') + pageText;
          console.log('Page', i, 'processed, text length:', pageText.length);
        } catch (pageError) {
          console.error('Error processing page', i, ':', pageError);
          // Continue with other pages
        }
      }
      
      console.log('PDF text extraction completed, total length:', fullText.length);
      
      // If no text was extracted, provide a meaningful message
      if (fullText.trim().length === 0) {
        return "No text could be extracted from this PDF. The PDF might be an image-only document or use unsupported fonts.";
      }
      
      return fullText;
    } catch (err) {
      console.error('PDF.js extraction failed', err);
      // Provide a fallback message with more details
      throw new Error('Failed to extract text from PDF: ' + err.message + '. This might be due to a corrupted PDF file, password protection, or an incompatible PDF format.');
    }
  }

  // Expose functions globally
  try {
    window.__loadPdfJs = loadPdfJs;
    window.__extractPdfText = extractPdfTextFromArrayBuffer;
    console.log('PDF.js loader initialized successfully');
  } catch (e) {
    console.error('Failed to expose PDF.js functions:', e);
  }
})();