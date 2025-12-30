# AI Assistant Browser Extension

This is a browser extension that provides AI-powered assistance directly in your browser. The extension can summarize text, explain code, extract key points, improve text, and chat with an AI assistant.

## Features

- **Text Summarization**: Condense long articles or documents into concise summaries
- **Code Explanation**: Get plain English explanations of code logic
- **Key Point Extraction**: Extract important points and action items from content
- **Text Improvement**: Enhance clarity and readability while preserving meaning
- **AI Chat**: Have conversations with an AI assistant
- **Multi-Model Support**: Choose from 30+ AI models across different providers
- **Site Analysis**: Check domain reputation, age, and safety status
- **PDF Processing**: Extract text from PDF documents
- **OCR**: Extract text from images
- **Sider AI-Style Sidebar**: Modern sidebar interface with all features accessible

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

### Configuring API Keys

1. Click the extension icon in your browser toolbar
2. Click the gear icon or "Options" to open settings
3. Enter your API token from one of the supported providers:
   - **GROQ**: Free tier available at https://console.groq.com/keys
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Hugging Face**: https://huggingface.co/settings/tokens
   - **OpenRouter**: https://openrouter.ai/ (free OpenRouter models are available and do not require a key; provide an API key to use paid/private models)
4. Select your preferred model from the dropdown menu
5. Click "Save"

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

You can use the extension in two ways:

#### Popup Interface (Default)
1. Click the extension icon in your browser toolbar
2. Select your preferred AI model from the dropdown
3. Enter text in the input area
4. Select one of the available actions:
   - **Summarize**: Create a concise summary of your text
   - **Chat**: Have a conversation with the AI assistant
   - **Explain Code**: Get a plain English explanation of code
   - **Extract Points**: Extract key points and action items
   - **Improve Text**: Enhance clarity and readability
   - **Process PDF**: Extract text from PDF files
   - **OCR Image**: Extract text from images
   - **Site Info**: Get information about the current website
5. View the results in the output area

#### Sider AI-Style Sidebar Interface
1. Press `Alt+S` on any webpage to toggle the sidebar
2. Or right-click anywhere on a webpage and select "Toggle AI Assistant Sidebar"
3. Use the sidebar's tabbed interface to access all features:
   - **Chat**: Conversational AI assistant
   - **Summaries**: Text summarization
   - **Explain**: Code explanation
   - **PDF**: PDF processing
   - **Web**: Web page analysis
   - **Image**: OCR processing
4. The sidebar provides a more immersive experience with all features in one place

## Supported Models

The extension supports over 30 AI models across multiple providers:

### GROQ Models
- Llama 3.1 8B/70B
- Llama 3.2 1B/3B/11B/90B
- Llama 3.3 70B
- Mixtral 8x7B
- Gemma 7B/9B

### OpenAI Models
- GPT-4o Mini/Turbo/4
- GPT-3.5 Turbo

### Hugging Face Models
- GPT-2
- OPT 1.3B/6.7B
- FLAN-T5 Series
- GPT-J 6B
- GPT-Neo Series

### Advanced Models
- Nova 2 Lite
- Trinity Mini
- OLMo 3 32B Think
- Nemotron Nano 12B 2 VL
- GPT OSS 20B
- Gemma 3N Series
- DeepSeek Chimera Series
- Gemini 2.0 Flash

## Development

### Extension Development

The extension is built with vanilla JavaScript and uses:
- Content scripts to interact with web pages
- Background service workers for message handling
- A popup UI for user interaction
- A Sider AI-style sidebar for immersive experience

### Server Development

The server is built with Python and Flask, providing REST API endpoints for:
- LLM interactions
- Text processing
- Code analysis
- PDF and OCR processing

## Future Enhancements

- Integration with additional LLM providers
- Advanced RAG (Retrieval-Augmented Generation) capabilities
- Enhanced site analysis with more security checks
- Multi-language support
- Voice input and output
- Custom prompt templates

## Troubleshooting

- If the extension doesn't load, check that all dependencies are installed
- If API calls fail, ensure the server is running on `http://localhost:5000`
- For Python dependency issues, try creating a virtual environment before installing packages
- If the sidebar doesn't appear, try refreshing the page or using the keyboard shortcut (`Alt+S`)