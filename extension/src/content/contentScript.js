import { sendMessageToServiceWorker } from '../background/messaging.js';
import { extractPageContent, extractSelectedText } from './domReader.js';

console.log("Content script loaded.");

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);

  switch (message.type) {
    case "EXTRACT_PAGE_CONTENT":
      try {
        const content = extractPageContent();
        sendResponse({ 
          type: "PAGE_CONTENT", 
          content: content.content,
          title: content.title,
          url: content.url,
          length: content.length
        });
      } catch (error) {
        console.error("Error extracting page content:", error);
        sendResponse({ error: "Failed to extract page content." });
      }
      break;
      
    case "EXTRACT_SELECTED_TEXT":
      try {
        const selectedText = extractSelectedText();
        if (selectedText) {
          sendResponse({ 
            type: "SELECTED_TEXT", 
            content: selectedText,
            length: selectedText.length
          });
        } else {
          sendResponse({ 
            type: "SELECTED_TEXT", 
            content: null,
            message: "No text selected."
          });
        }
      } catch (error) {
        console.error("Error extracting selected text:", error);
        sendResponse({ error: "Failed to extract selected text." });
      }
      break;
      
    default:
      console.log("Unknown message type:", message.type);
      sendResponse({ status: "Unknown message type." });
      break;
  }
  
  return true; // Indicates that sendResponse will be called asynchronously
});

// Notify the service worker that the content script is loaded
sendMessageToServiceWorker({ type: "CONTENT_SCRIPT_LOADED", url: window.location.href })
  .then(response => {
    console.log("Message sent from content script, response:", response);
  })
  .catch(error => {
    console.error("Error sending message from content script:", error);
  });