import { sendMessageToTab, sendMessageToActiveTab } from './messaging.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in service worker:", message);

  switch (message.type) {
    case "CONTENT_SCRIPT_LOADED":
      console.log("Content script loaded on:", message.url);
      sendResponse({ status: "Service worker acknowledged content script load." });
      break;
      
    case "GET_PAGE_CONTENT":
      // Request page content from the active tab
      sendMessageToActiveTab({ type: "EXTRACT_PAGE_CONTENT" })
        .then(response => {
          if (response && response.type === "PAGE_CONTENT") {
            sendResponse({ 
              type: "PAGE_CONTENT", 
              content: response.content,
              title: response.title,
              url: response.url,
              length: response.length
            });
          } else {
            sendResponse({ error: "Failed to extract page content." });
          }
        })
        .catch(error => {
          console.error("Error getting page content:", error);
          sendResponse({ error: "Failed to extract page content." });
        });
      break;
      
    case "GET_SELECTED_TEXT":
      // Request selected text from the active tab
      sendMessageToActiveTab({ type: "EXTRACT_SELECTED_TEXT" })
        .then(response => {
          if (response && response.type === "SELECTED_TEXT") {
            sendResponse({ 
              type: "SELECTED_TEXT", 
              content: response.content,
              length: response.length
            });
          } else {
            sendResponse({ 
              type: "SELECTED_TEXT", 
              content: null,
              message: response?.message || "No text selected."
            });
          }
        })
        .catch(error => {
          console.error("Error getting selected text:", error);
          sendResponse({ error: "Failed to extract selected text." });
        });
      break;
      
    // Add more cases for different message types as needed
    default:
      console.log("Unknown message type:", message.type);
      sendResponse({ status: "Unknown message type." });
      break;
  }
  
  return true; // Indicates that sendResponse will be called asynchronously
});

console.log("Service worker initialized.");