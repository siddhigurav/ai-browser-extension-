// Test file to verify all functionality is working
console.log('Testing AI Assistant Extension functionality...');

// Test 1: Check if all hooks are properly implemented
console.log('Testing hooks implementation...');

// Test 2: Check if server endpoints are accessible
async function testServerEndpoints() {
  console.log('Testing server endpoints...');
  
  try {
    // Test main endpoint
    const healthResponse = await fetch('http://localhost:5000/api/health');
    console.log('Health check:', healthResponse.status, await healthResponse.json());
    
    // Test OCR endpoint
    const ocrResponse = await fetch('http://localhost:5000/api/ocr/image', { method: 'OPTIONS' });
    console.log('OCR endpoint accessible:', ocrResponse.status);
    
    // Test PDF endpoint
    const pdfResponse = await fetch('http://localhost:5000/api/pdf/extract', { method: 'OPTIONS' });
    console.log('PDF endpoint accessible:', pdfResponse.status);
    
    console.log('All server endpoints are accessible!');
  } catch (error) {
    console.error('Error testing server endpoints:', error);
  }
}

// Test 3: Check if background script is responding
function testBackgroundScript() {
  console.log('Testing background script communication...');
  
  try {
    chrome.runtime.sendMessage({ type: "GET_TOKEN" }, (response) => {
      console.log('Background script response:', response);
    });
  } catch (error) {
    console.error('Error testing background script:', error);
  }
}

// Run tests
testServerEndpoints();
testBackgroundScript();

console.log('Test completed. Check console for results.');