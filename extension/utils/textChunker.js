// utils/textChunker.js
// Small utility to split large text into chunks with optional overlap.
export function chunkText(text = '', maxChars = 3000, overlap = 200) {
  if (!text) return [];
  const chunks = [];
  let start = 0;
  const len = text.length;
  while (start < len) {
    let end = Math.min(start + maxChars, len);
    // try to cut at a newline or space for nicer boundaries
    if (end < len) {
      const nl = text.lastIndexOf('\n', end);
      const sp = text.lastIndexOf(' ', end);
      const cut = Math.max(nl, sp);
      if (cut > start + Math.floor(maxChars * 0.5)) end = cut;
    }
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}
// Placeholder for textChunker.js

export function chunkText(text, mode = "tokens") {
  console.log("Chunking text using mode:", mode);
  // Dummy implementation
  return [text.substring(0, text.length / 2), text.substring(text.length / 2)];
}