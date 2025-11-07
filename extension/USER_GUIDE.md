# AI Assistant Extension User Guide

This guide will help you get started with the AI Assistant browser extension and make the most of its features.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `extension` directory
4. The extension icon should now appear in your toolbar

## Features Overview

The AI Assistant extension provides several powerful features:

### 1. Text Analysis
- **Summarize**: Create concise summaries of long articles or documents
- **Extract Points**: Identify key points and action items
- **Improve Text**: Enhance clarity and readability while preserving meaning
- **Explain Code**: Get plain English explanations of code logic

### 2. Web Page Interaction
- **Get Page Content**: Extract all text content from the current webpage
- **Get Selected Text**: Process only the text you've selected

### 3. Document Processing
- **PDF Processing**: Extract text from PDF documents
- **Image OCR**: Extract text from images using optical character recognition

### 4. AI Chat
- Have conversations with an AI assistant about any content

## How to Use

### Basic Text Processing

1. Click the extension icon in your browser toolbar
2. Select the "Text" tab (default)
3. Enter or paste text in the input area
4. Choose an action:
   - Click "Summarize" to create a summary
   - Click "Chat" to discuss the content
   - Click "Explain Code" for code explanations
   - Click "Extract Points" to identify key information
   - Click "Improve Text" to enhance readability

### Web Page Content

1. Navigate to any webpage
2. Click the extension icon
3. Select the "Web Page" tab
4. Click "Get Page Content" to extract all text from the page
5. Or select text on the page and click "Get Selected Text"
6. Use any of the processing features on the extracted content

### PDF Processing

1. Click the extension icon
2. Select the "PDF" tab
3. Click "Choose File" and select a PDF document
4. Click "Process PDF" to extract text
5. Use any of the processing features on the extracted content
6. Ask questions about the PDF using the question input

### Image OCR

1. Click the extension icon
2. Select the "Image" tab
3. Click "Choose File" and select an image containing text
4. Click "Process Image" to extract text using OCR
5. Or click "Capture Screenshot" to process the current page (simulated)
6. Use any of the processing features on the extracted text

## Tips for Best Results

1. **For Summarization**: Longer texts generally produce better summaries
2. **For Code Explanation**: Include complete functions or code blocks for better explanations
3. **For Point Extraction**: Well-structured documents work best
4. **For Text Improvement**: Focus on content that needs clarity or flow improvements

## Troubleshooting

### Extension Not Working
- Ensure the extension is properly loaded in Chrome
- Check that all files are in the correct directory structure
- Refresh the browser after loading the extension

### Features Not Responding
- Some features require the backend server to be running
- Check the browser console for error messages (Ctrl+Shift+J)
- Ensure you have selected or entered content before processing

### PDF or Image Processing Issues
- Make sure you've selected a valid file
- Check that the file format is supported (.pdf for PDFs, common image formats for OCR)
- Large files may take longer to process

## Privacy and Security

- All processing happens locally on your computer
- No data is sent to external servers unless you're running the backend
- The extension only accesses content you explicitly choose to process
- Your browsing history is not tracked or stored

## Feedback and Support

If you encounter any issues or have suggestions for improvement, please check the project documentation or contact the development team.