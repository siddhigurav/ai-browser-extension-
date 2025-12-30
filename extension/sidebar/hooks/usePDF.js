// PDF Hook - Communicates with the server for PDF processing

export function usePDF() {
  const extractPdfContent = async (file) => {
    try {
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
      // Return concatenated text from all pages
      return data.pages.map(page => page.text).join('\n\n') || "No content extracted from PDF.";
    } catch (error) {
      console.error("PDF processing failed:", error);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  };

  const answerPdfQuestion = async (question, context) => {
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
      return data.answer || "No answer generated.";
    } catch (error) {
      console.error("PDF question answering failed:", error);
      throw new Error(`PDF question answering failed: ${error.message}`);
    }
  };

  return { extractPdfContent, answerPdfQuestion };
}