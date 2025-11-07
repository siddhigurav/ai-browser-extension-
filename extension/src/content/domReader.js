// Utility to extract text content from web pages
export function extractPageContent() {
  // Remove script and style elements to avoid extracting code
  const scripts = document.querySelectorAll('script, style');
  scripts.forEach(script => script.remove());
  
  // Extract text content from the page
  const content = document.body.textContent || document.body.innerText || '';
  
  // Clean up whitespace
  const cleanedContent = content.replace(/\s+/g, ' ').trim();
  
  // Get page title
  const title = document.title || '';
  
  // Get page URL
  const url = window.location.href;
  
  return {
    title: title,
    url: url,
    content: cleanedContent,
    length: cleanedContent.length
  };
}

export function extractSelectedText() {
  // Get selected text
  const selectedText = window.getSelection().toString();
  
  if (selectedText && selectedText.trim().length > 0) {
    return selectedText.trim();
  }
  
  return null;
}