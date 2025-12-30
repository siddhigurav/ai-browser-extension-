// OCR Panel Component
export function OcrPanel() {
  return `
    <div style="padding: 10px;">
      <h3>Image OCR Processing</h3>
      <div style="margin-bottom: 15px;">
        <input type="file" id="imageUpload" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 15px;">
        <button id="processImageBtn" style="background-color: #9C27B0; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Process Image</button>
        <button id="captureScreenshotBtn" style="background-color: #9C27B0; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 10px;">Capture Screenshot</button>
      </div>
      <div style="margin-bottom: 15px;">
        <textarea id="ocrOutput" placeholder="OCR text will appear here..." style="width: 100%; height: 150px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
      </div>
      <div id="ocrStatus" style="margin-bottom: 15px; color: #f44336; display: none;"></div>
    </div>
  `;
}