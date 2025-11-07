// Placeholder for useLLM.js

export function useLLM() {
  const chat = (messages) => {
    console.log("LLM chat called with:", messages);
    return "Dummy LLM chat response.";
  };

  const summarize = (text) => {
    console.log("LLM summarize called with:", text);
    return "Dummy LLM summary.";
  };

  return { chat, summarize };
}