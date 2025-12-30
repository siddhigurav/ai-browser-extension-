// Web Page Content Panel Component
export function WebPagePanel() {
  return `
    <div style="padding: 10px;">
      <h3>Web Page Content</h3>
      <div style="margin-bottom: 15px;">
        <button id="getPageContentBtn" style="background-color: #4CAF50; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Get Current Page Content</button>
      </div>
      <div style="margin-bottom: 15px;">
        <button id="getSelectedTextBtn" style="background-color: #2196F3; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Get Selected Text</button>
      </div>
      <div style="margin-bottom: 15px;">
        <textarea id="webPageOutput" placeholder="Web page content will appear here..." style="width: 100%; height: 150px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>
      </div>
      <div id="webPageStatus" style="margin-bottom: 15px; color: #f44336; display: none;"></div>
    </div>
  `;
}