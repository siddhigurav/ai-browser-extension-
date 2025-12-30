// Readability Hook - Gets web page content

export function useReadability() {
  const extractReadableContent = async () => {
    try {
      // Send message to background script to get page content
      const response = await chrome.runtime.sendMessage({ type: "GET_PAGE_CONTENT" });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.content || "No content extracted from page.";
    } catch (error) {
      console.error("Web page content extraction failed:", error);
      throw new Error(`Web page content extraction failed: ${error.message}`);
    }
  };

  const getSelectedText = async () => {
    try {
      // Send message to background script to get selected text
      const response = await chrome.runtime.sendMessage({ type: "GET_SELECTED_TEXT" });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.content || "No text selected.";
    } catch (error) {
      console.error("Selected text extraction failed:", error);
      throw new Error(`Selected text extraction failed: ${error.message}`);
    }
  };

  return { extractReadableContent, getSelectedText };
}