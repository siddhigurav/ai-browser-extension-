# AI Assistant Browser Extension

This is a browser extension that provides AI-powered assistance directly in your browser. The extension can summarize text, explain code, extract key points, improve text, and chat with an AI assistant.

## Features

- **Text Summarization**: Condense long articles or documents into concise summaries
- **Code Explanation**: Get plain English explanations of code logic
- **Key Point Extraction**: Extract important points and action items from content
- **Text Improvement**: Enhance clarity and readability while preserving meaning
- **AI Chat**: Have conversations with an AI assistant

## Project Structure

```
├── extension/              # Browser extension code
│   ├── background/         # Service worker and messaging
│   ├── sidebar/            # UI components
│   ├── src/content/        # Content scripts
│   └── utils/              # Utility functions
└── server/                 # Backend server
    ├── routers/            # API endpoints
    ├── services/           # LLM providers
    └── requirements.txt    # Python dependencies
```

## Installation

### Extension Setup

1. Navigate to the extension directory:
   ```
   cd extension
   ```

2. Install dependencies:
   ```
   npm install
   ```

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

### Loading the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `extension` directory
4. The extension icon should now appear in your toolbar

### Running the Server

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Start the server:
   ```
   python app.py
   ```

3. The server will start on `http://localhost:5000`

### Using the Extension

1. Click the extension icon in your browser toolbar
2. Enter text in the input area
3. Select one of the available actions:
   - **Summarize**: Create a concise summary of your text
   - **Chat**: Have a conversation with the AI assistant
   - **Explain Code**: Get a plain English explanation of code
   - **Extract Points**: Extract key points and action items
   - **Improve Text**: Enhance clarity and readability
4. View the results in the output area

## Development

### Extension Development

The extension is built with vanilla JavaScript and uses:
- Content scripts to interact with web pages
- Background service workers for message handling
- A sidebar UI for user interaction

### Server Development

The server is built with Python and Flask, providing REST API endpoints for:
- LLM interactions
- Text processing
- Code analysis

## Future Enhancements

- Integration with multiple LLM providers (OpenAI, Anthropic, etc.)
- Advanced RAG (Retrieval-Augmented Generation) capabilities
- OCR support for image analysis
- PDF processing
- YouTube transcript analysis
- Voice input and output
- Multi-language support

## Troubleshooting

- If the extension doesn't load, check that all dependencies are installed
- If API calls fail, ensure the server is running on `http://localhost:5000`
- For Python dependency issues, try creating a virtual environment before installing packages