// libs/tesseract-loader.js
// Lightweight loader that exposes window.__loadTesseract()
// It will try to inject a local file at libs/tesseract/tesseract.min.js (if you add it)
// Usage: await window.__loadTesseract(); // resolves to window.Tesseract

(function () {
  async function loadTesseract() {
    if (window.Tesseract) return window.Tesseract;
    
    // Check if the file exists by trying to fetch it first
    const scriptUrl = chrome.runtime.getURL('libs/tesseract/tesseract.min.js');
    
    try {
      // Try to fetch the file to check if it exists
      const response = await fetch(scriptUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Tesseract.js file not found at ${scriptUrl}`);
      }
    } catch (fetchError) {
      console.error('Failed to fetch Tesseract.js:', fetchError);
      throw new Error('Tesseract.js file not accessible. Please ensure it is properly downloaded.');
    }
    
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = scriptUrl;
      
      s.onload = () => {
        // Try multiple approaches to access Tesseract
        let tesseract = null;
        
        // Direct access
        if (window.Tesseract) {
          tesseract = window.Tesseract;
        }
        
        // Alternative access patterns
        if (!tesseract) {
          const possibleNames = ['Tesseract', 'tesseract', 'TesseractJS'];
          for (const name of possibleNames) {
            if (window[name]) {
              tesseract = window[name];
              console.log(`Found Tesseract library under alternative name: ${name}`);
              break;
            }
          }
        }
        
        if (tesseract) {
          console.log('Tesseract.js loaded successfully');
          resolve(tesseract);
        } else {
          // Give a short timeout for the lib to initialize
          setTimeout(() => {
            // Try again after delay
            let delayedTesseract = null;
            
            if (window.Tesseract) {
              delayedTesseract = window.Tesseract;
            } else {
              const possibleNames = ['Tesseract', 'tesseract', 'TesseractJS'];
              for (const name of possibleNames) {
                if (window[name]) {
                  delayedTesseract = window[name];
                  console.log(`Found Tesseract library under alternative name (delayed): ${name}`);
                  break;
                }
              }
            }
            
            if (delayedTesseract) {
              console.log('Tesseract.js initialized successfully (delayed)');
              resolve(delayedTesseract);
            } else {
              console.error('Tesseract.js loaded but window.Tesseract not found');
              reject(new Error('Tesseract loaded but window.Tesseract not found. This might be due to Content Security Policy restrictions.'));
            }
          }, 2000);
        }
      };
      
      s.onerror = (e) => {
        console.error('Failed to load Tesseract script:', e);
        reject(new Error('Failed to load tesseract script: ' + scriptUrl + '. This might be due to network issues or Content Security Policy restrictions.'));
      };
      
      document.head.appendChild(s);
    });
  }

  try {
    window.__loadTesseract = loadTesseract;
    console.log('Tesseract.js loader initialized successfully');
  } catch (e) {
    console.error('Failed to expose Tesseract.js functions:', e);
  }
})();