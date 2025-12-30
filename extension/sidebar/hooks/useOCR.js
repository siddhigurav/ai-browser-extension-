// OCR Hook - Communicates with the server for OCR processing

export function useOCR() {
  const performOcr = async (file) => {
    try {
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
      return data.text || "No text extracted.";
    } catch (error) {
      console.error("OCR processing failed:", error);
      throw new Error(`OCR failed: ${error.message}`);
    }
  };

  const captureScreenshot = async (imageBase64) => {
    try {
      const response = await fetch('http://localhost:5000/api/ocr/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_base64: imageBase64 })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.text || "No text extracted from screenshot.";
    } catch (error) {
      console.error("Screenshot OCR processing failed:", error);
      throw new Error(`Screenshot OCR failed: ${error.message}`);
    }
  };

  return { performOcr, captureScreenshot };
}