// PDF Panel Component
export function PdfPanel() {
  return `
    <div style="padding: 10px;">
      <h3>PDF Processing</h3>
      <div style="margin-bottom: 15px;">
        <input type="file" id="pdfUpload" accept=".pdf" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 15px;">
        <button id="processPdfBtn" style="background-color: #FF9800; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Process PDF</button>
      </div>
      <div style="margin-bottom: 15px;">
        <textarea id="pdfOutput" placeholder="PDF content will appear here..." style="width: 100%; height: 150px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
      </div>
      <div style="margin-bottom: 15px;">
        <input type="text" id="pdfQuestion" placeholder="Ask a question about the PDF..." style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;">
        <button id="askPdfBtn" style="background-color: #2196F3; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Ask About PDF</button>
      </div>
    </div>
  `;
}