// LLM Hook - Communicates with the server for AI processing

export function useLLM() {
  const chat = async (messages) => {
    try {
      // Send message to background script to handle AI request
      const response = await chrome.runtime.sendMessage({
        type: "AI_REQUEST",
        payload: {
          task: "chat",
          messages: messages
        }
      });
      
      if (!response.success) {
        throw new Error(response.error || "AI request failed");
      }
      
      return response.data.text || "No response generated.";
    } catch (error) {
      console.error("AI chat failed:", error);
      throw new Error(`AI chat failed: ${error.message}`);
    }
  };

  const summarize = async (text) => {
    try {
      // Send message to background script to handle AI request
      const response = await chrome.runtime.sendMessage({
        type: "SUMMARIZE_REQUEST",
        payload: {
          text: text
        }
      });
      
      if (!response.success) {
        throw new Error(response.error || "Summarization failed");
      }
      
      return response.data.text || "No summary generated.";
    } catch (error) {
      console.error("AI summarization failed:", error);
      throw new Error(`AI summarization failed: ${error.message}`);
    }
  };

  const explainCode = async (code) => {
    try {
      // Send message to background script to handle AI request
      const response = await chrome.runtime.sendMessage({
        type: "AI_REQUEST",
        payload: {
          task: "explain_code",
          text: code
        }
      });
      
      if (!response.success) {
        throw new Error(response.error || "Code explanation failed");
      }
      
      return response.data.text || "No explanation generated.";
    } catch (error) {
      console.error("AI code explanation failed:", error);
      throw new Error(`AI code explanation failed: ${error.message}`);
    }
  };

  const extractPoints = async (text) => {
    try {
      // Send message to background script to handle AI request
      const response = await chrome.runtime.sendMessage({
        type: "AI_REQUEST",
        payload: {
          task: "extract_points",
          text: text
        }
      });
      
      if (!response.success) {
        throw new Error(response.error || "Point extraction failed");
      }
      
      return response.data.text || "No points extracted.";
    } catch (error) {
      console.error("AI point extraction failed:", error);
      throw new Error(`AI point extraction failed: ${error.message}`);
    }
  };

  const improveText = async (text) => {
    try {
      // Send message to background script to handle AI request
      const response = await chrome.runtime.sendMessage({
        type: "AI_REQUEST",
        payload: {
          task: "improve_text",
          text: text
        }
      });
      
      if (!response.success) {
        throw new Error(response.error || "Text improvement failed");
      }
      
      return response.data.text || "No improved text generated.";
    } catch (error) {
      console.error("AI text improvement failed:", error);
      throw new Error(`AI text improvement failed: ${error.message}`);
    }
  };

  return { chat, summarize, explainCode, extractPoints, improveText };
}