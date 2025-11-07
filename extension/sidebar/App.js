// extension/sidebar/App.js

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    // Web Page Content Panel Component
    function WebPagePanel() {
      return `
        <div style="padding: 10px;">
          <h3 style="color: #9D7CBF;">Web Page Content</h3>
          <div style="margin-bottom: 15px;">
            <button id="getPageContentBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Get Current Page Content</button>
          </div>
          <div style="margin-bottom: 15px;">
            <button id="getSelectedTextBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Get Selected Text</button>
          </div>
          <div style="margin-bottom: 15px;">
            <textarea id="webPageOutput" placeholder="Web page content will appear here..." style="width: 100%; height: 150px; padding: 8px; border: 1px solid #333; border-radius: 4px; background-color: #1E1E1E; color: #E0E0E0;"></textarea>
          </div>
        </div>
      `;
    }
    
    // PDF Panel Component
    function PdfPanel() {
      return `
        <div style="padding: 10px;">
          <h3 style="color: #9D7CBF;">PDF Processing</h3>
          <div style="margin-bottom: 15px;">
            <input type="file" id="pdfUpload" accept=".pdf" style="width: 100%; padding: 8px; border: 1px solid #333; border-radius: 4px; background-color: #1E1E1E; color: #E0E0E0;">
          </div>
          <div style="margin-bottom: 15px;">
            <button id="processPdfBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Process PDF</button>
          </div>
          <div style="margin-bottom: 15px;">
            <textarea id="pdfOutput" placeholder="PDF content will appear here..." style="width: 100%; height: 150px; padding: 8px; border: 1px solid #333; border-radius: 4px; background-color: #1E1E1E; color: #E0E0E0;"></textarea>
          </div>
          <div style="margin-bottom: 15px;">
            <input type="text" id="pdfQuestion" placeholder="Ask a question about the PDF..." style="width: 100%; padding: 8px; border: 1px solid #333; border-radius: 4px; margin-bottom: 10px; background-color: #1E1E1E; color: #E0E0E0;">
            <button id="askPdfBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Ask About PDF</button>
          </div>
        </div>
      `;
    }
    
    // OCR Panel Component
    function OcrPanel() {
      return `
        <div style="padding: 10px;">
          <h3 style="color: #9D7CBF;">Image OCR Processing</h3>
          <div style="margin-bottom: 15px;">
            <input type="file" id="imageUpload" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #333; border-radius: 4px; background-color: #1E1E1E; color: #E0E0E0;">
          </div>
          <div style="margin-bottom: 15px;">
            <button id="processImageBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Process Image</button>
            <button id="captureScreenshotBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 10px;">Capture Screenshot</button>
          </div>
          <div style="margin-bottom: 15px;">
            <textarea id="ocrOutput" placeholder="OCR text will appear here..." style="width: 100%; height: 150px; padding: 8px; border: 1px solid #333; border-radius: 4px; background-color: #1E1E1E; color: #E0E0E0;"></textarea>
          </div>
        </div>
      `;
    }
    
    root.innerHTML = `
      <div style="font-family: sans-serif; padding: 10px; max-width: 300px; background-color: #121212; color: #E0E0E0;">
        <h2 style="color: #9D7CBF;">AI Assistant</h2>
        
        <!-- Tab navigation -->
        <div style="margin-bottom: 15px; border-bottom: 1px solid #333;">
          <button id="textTab" style="background-color: #5D3A9B; color: white; padding: 8px 12px; border: none; border-radius: 4px 4px 0 0; cursor: pointer; margin-right: 5px;">Text</button>
          <button id="webTab" style="background-color: #2A2A2A; color: #E0E0E0; padding: 8px 12px; border: none; border-radius: 4px 4px 0 0; cursor: pointer; margin-right: 5px;">Web Page</button>
          <button id="pdfTab" style="background-color: #2A2A2A; color: #E0E0E0; padding: 8px 12px; border: none; border-radius: 4px 4px 0 0; cursor: pointer; margin-right: 5px;">PDF</button>
          <button id="imageTab" style="background-color: #2A2A2A; color: #E0E0E0; padding: 8px 12px; border: none; border-radius: 4px 4px 0 0; cursor: pointer;">Image</button>
        </div>
        
        <!-- Text Input Section -->
        <div id="textSection">
          <div style="margin-bottom: 10px;">
            <textarea id="inputText" placeholder="Enter text here..." style="width: 100%; height: 80px; padding: 8px; border: 1px solid #333; border-radius: 4px; background-color: #1E1E1E; color: #E0E0E0;"></textarea>
          </div>
        </div>
        
        <!-- Web Page Content Section -->
        <div id="webSection" style="display: none;">
          ${WebPagePanel()}
        </div>
        
        <!-- PDF Upload Section -->
        <div id="pdfSection" style="display: none;">
          ${PdfPanel()}
        </div>
        
        <!-- Image Upload Section -->
        <div id="imageSection" style="display: none;">
          ${OcrPanel()}
        </div>
        
        <!-- Action Buttons -->
        <div style="margin-bottom: 10px;">
          <button id="summarizeBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">Summarize</button>
          <button id="chatBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Chat</button>
          <button id="explainBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin-top: 5px; width: 100%;">Explain Code</button>
        </div>
        <div style="margin-bottom: 10px;">
          <button id="extractBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 48%;">Extract Points</button>
          <button id="improveBtn" style="background-color: #5D3A9B; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; margin-left: 4%; width: 48%;">Improve Text</button>
        </div>
        
        <!-- Output Area -->
        <div style="background-color: #1E1E1E; padding: 10px; border-radius: 4px; min-height: 100px; overflow-y: auto; border: 1px solid #333;">
          <p id="outputText" style="color: #9D7CBF;">Output will appear here...</p>
        </div>
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
    
    // Web page elements
    const getPageContentBtn = document.getElementById('getPageContentBtn');
    const getSelectedTextBtn = document.getElementById('getSelectedTextBtn');
    const webPageOutput = document.getElementById('webPageOutput');
    
    // PDF elements
    const pdfUpload = document.getElementById('pdfUpload');
    const processPdfBtn = document.getElementById('processPdfBtn');
    const pdfOutput = document.getElementById('pdfOutput');
    const pdfQuestion = document.getElementById('pdfQuestion');
    const askPdfBtn = document.getElementById('askPdfBtn');
    
    // Image elements
    const imageUpload = document.getElementById('imageUpload');
    const processImageBtn = document.getElementById('processImageBtn');
    const captureScreenshotBtn = document.getElementById('captureScreenshotBtn');
    const ocrOutput = document.getElementById('ocrOutput');
    
    // Action buttons
    const summarizeBtn = document.getElementById('summarizeBtn');
    const chatBtn = document.getElementById('chatBtn');
    const explainBtn = document.getElementById('explainBtn');
    const extractBtn = document.getElementById('extractBtn');
    const improveBtn = document.getElementById('improveBtn');
    
    // Output element
    const outputText = document.getElementById('outputText');
    
    // Current active content source
    let currentContentSource = 'text';
    let currentContent = '';
    
    // Tab navigation functionality
    textTab.addEventListener('click', () => {
      textTab.style.backgroundColor = '#5D3A9B';
      webTab.style.backgroundColor = '#2A2A2A';
      pdfTab.style.backgroundColor = '#2A2A2A';
      imageTab.style.backgroundColor = '#2A2A2A';
      textSection.style.display = 'block';
      webSection.style.display = 'none';
      pdfSection.style.display = 'none';
      imageSection.style.display = 'none';
      currentContentSource = 'text';
      currentContent = inputText.value;
    });
    
    webTab.addEventListener('click', () => {
      textTab.style.backgroundColor = '#2A2A2A';
      webTab.style.backgroundColor = '#5D3A9B';
      pdfTab.style.backgroundColor = '#2A2A2A';
      imageTab.style.backgroundColor = '#2A2A2A';
      textSection.style.display = 'none';
      webSection.style.display = 'block';
      pdfSection.style.display = 'none';
      imageSection.style.display = 'none';
      currentContentSource = 'web';
    });
    
    pdfTab.addEventListener('click', () => {
      textTab.style.backgroundColor = '#2A2A2A';
      webTab.style.backgroundColor = '#2A2A2A';
      pdfTab.style.backgroundColor = '#5D3A9B';
      imageTab.style.backgroundColor = '#2A2A2A';
      textSection.style.display = 'none';
      webSection.style.display = 'none';
      pdfSection.style.display = 'block';
      imageSection.style.display = 'none';
      currentContentSource = 'pdf';
    });
    
    imageTab.addEventListener('click', () => {
      textTab.style.backgroundColor = '#2A2A2A';
      webTab.style.backgroundColor = '#2A2A2A';
      pdfTab.style.backgroundColor = '#2A2A2A';
      imageTab.style.backgroundColor = '#5D3A9B';
      textSection.style.display = 'none';
      webSection.style.display = 'none';
      pdfSection.style.display = 'none';
      imageSection.style.display = 'block';
      currentContentSource = 'image';
    });
    
    // New processText function as requested
    async function processText(task) {
      const text = getCurrentContent() || window.getSelection().toString();
    
      try {
        const res = await fetch("http://127.0.0.1:5000/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, task })
        });
    
        const data = await res.json();
        document.getElementById("outputText").innerText =
          data.output || "⚠️ No response received. Check your Flask server.";
      } catch (error) {
        console.error('Error calling process API:', error);
        document.getElementById("outputText").innerText =
          "⚠️ Error connecting to AI service. Check your Flask server and Hugging Face token.";
      }
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
    
    // Get page content functionality
    getPageContentBtn.addEventListener('click', async () => {
      outputText.textContent = 'Getting page content...';
      try {
        chrome.runtime.sendMessage({ type: "GET_PAGE_CONTENT" }, (response) => {
          if (response && response.type === "PAGE_CONTENT") {
            webPageOutput.value = response.content;
            outputText.textContent = `Page content extracted successfully. Length: ${response.length} characters.`;
            currentContent = response.content;
          } else {
            outputText.textContent = 'Failed to extract page content.';
          }
        });
      } catch (error) {
        outputText.textContent = 'Error getting page content.';
        console.error('Error getting page content:', error);
      }
    });
    
    // Get selected text functionality
    getSelectedTextBtn.addEventListener('click', async () => {
      outputText.textContent = 'Getting selected text...';
      try {
        chrome.runtime.sendMessage({ type: "GET_SELECTED_TEXT" }, (response) => {
          if (response && response.type === "SELECTED_TEXT" && response.content) {
            webPageOutput.value = response.content;
            outputText.textContent = `Selected text extracted successfully. Length: ${response.length} characters.`;
            currentContent = response.content;
          } else {
            outputText.textContent = response?.message || 'No text selected.';
          }
        });
      } catch (error) {
        outputText.textContent = 'Error getting selected text.';
        console.error('Error getting selected text:', error);
      }
    });
    
    // Process PDF functionality
    processPdfBtn.addEventListener('click', async () => {
      const file = pdfUpload.files[0];
      if (!file) {
        outputText.textContent = 'Please select a PDF file first.';
        return;
      }
      
      outputText.textContent = 'Processing PDF...';
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Simulate PDF processing
        setTimeout(() => {
          const simulatedText = "This is simulated text extracted from the PDF. In a complete implementation, this would contain the actual text content of the PDF document.";
          pdfOutput.value = simulatedText;
          outputText.textContent = `PDF processed successfully. Extracted ${simulatedText.length} characters.`;
          currentContent = simulatedText;
        }, 1500);
      } catch (error) {
        outputText.textContent = 'Error processing PDF.';
        console.error('Error processing PDF:', error);
      }
    });
    
    // Ask PDF question functionality
    askPdfBtn.addEventListener('click', async () => {
      const question = pdfQuestion.value;
      const context = pdfOutput.value;
      
      if (!question) {
        outputText.textContent = 'Please enter a question.';
        return;
      }
      
      if (!context) {
        outputText.textContent = 'Please process a PDF first.';
        return;
      }
      
      outputText.textContent = 'Answering question...';
      try {
        // Simulate question answering
        setTimeout(() => {
          const simulatedAnswer = `This is a simulated answer to your question: "${question}". In a complete implementation, this would use AI to analyze the PDF content and provide a relevant answer.`;
          outputText.textContent = simulatedAnswer;
        }, 1500);
      } catch (error) {
        outputText.textContent = 'Error answering question.';
        console.error('Error answering question:', error);
      }
    });
    
    // Process Image functionality
    processImageBtn.addEventListener('click', async () => {
      const file = imageUpload.files[0];
      if (!file) {
        outputText.textContent = 'Please select an image file first.';
        return;
      }
      
      outputText.textContent = 'Processing image...';
      try {
        // Simulate image processing
        setTimeout(() => {
          const simulatedText = "This is simulated text extracted from the image using OCR. In a complete implementation, this would contain the actual text content of the image.";
          ocrOutput.value = simulatedText;
          outputText.textContent = `Image processed successfully. Extracted ${simulatedText.length} characters.`;
          currentContent = simulatedText;
        }, 1500);
      } catch (error) {
        outputText.textContent = 'Error processing image.';
        console.error('Error processing image:', error);
      }
    });
    
    // Capture Screenshot functionality
    captureScreenshotBtn.addEventListener('click', async () => {
      outputText.textContent = 'Capturing screenshot...';
      try {
        // Simulate screenshot capture
        setTimeout(() => {
          const simulatedText = "This is simulated text extracted from the screenshot using OCR. In a complete implementation, this would capture and process a screenshot of the current page.";
          ocrOutput.value = simulatedText;
          outputText.textContent = `Screenshot captured and processed successfully. Extracted ${simulatedText.length} characters.`;
          currentContent = simulatedText;
        }, 1500);
      } catch (error) {
        outputText.textContent = 'Error capturing screenshot.';
        console.error('Error capturing screenshot:', error);
      }
    });
    
    // Bind all buttons to use the new processText function
    summarizeBtn.onclick = () => processText("summarize");
    chatBtn.onclick = () => processText("chat");
    explainBtn.onclick = () => processText("explain_code");
    extractBtn.onclick = () => processText("extract_points");
    improveBtn.onclick = () => processText("improve_text");
  }
});