// extension/background/messaging.js

// Function to send a message to a specific tab (content script)
function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(response);
    });
  });
}

// Function to send a message to the active tab's content script
async function sendMessageToActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    return sendMessageToTab(tab.id, message);
  } else {
    console.warn("No active tab found to send message.");
    return null;
  }
}

// Function to send a message to the service worker (from content script or popup)
function sendMessageToServiceWorker(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(response);
    });
  });
}

// Export functions for use in other parts of the extension
export { sendMessageToTab, sendMessageToActiveTab, sendMessageToServiceWorker };