# AI Assistant Browser Extension

A modern AI-powered browser extension that brings powerful AI capabilities directly to your browser. Chat with AI, summarize content, explain code, process documents, and more - all with a beautiful, intuitive interface.

## 🌟 Features

- **💬 AI Chat**: Have natural conversations with powerful AI models
- **📄 Text Summarization**: Condense long articles into concise summaries
- **💡 Code Explanation**: Get plain English explanations of code
- **🎯 Key Point Extraction**: Extract important points from any content
- **✨ Text Improvement**: Enhance clarity and readability
- **📁 PDF Processing**: Extract and process text from PDF documents
- **🖼️ OCR**: Extract text from images
- **🌐 Page Analysis**: Analyze and summarize web pages
- **🎨 Modern UI**: Beautiful dark theme with smooth animations
- **🚀 Free Models**: Access free AI models from OpenRouter

## 📋 Quick Start

### 1. Install the Extension

1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** and select the `extension` folder
5. The extension icon should appear in your toolbar

### 2. Get Your Free API Key

The extension uses **OpenRouter** to access free AI models:

1. Visit [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up for a free account (no credit card required)
3. Create an API key
4. Copy your key (starts with `sk-or-v1-...`)

### 3. Configure the Extension

1. Click the extension icon in your browser toolbar
2. Click the ⚙️ **Settings** button
3. Paste your OpenRouter API key
4. Select **OpenRouter** as the provider
5. Click **Save key**

### 4. Start Using!

1. Click the extension icon to open the popup
2. Choose from three tabs:
   - **💬 Chat**: Ask questions, get help, have conversations
   - **🌐 Page**: Summarize or analyze web pages
   - **📁 Files**: Upload PDFs or images for processing
3. Select your preferred AI model
4. Start chatting or processing content!

## 🤖 Available Models

### Free Models (via OpenRouter)
- **Llama 3 8B Instruct** - Fast, versatile
- **Gemma 7B IT** - Google's efficient model
- **Mistral 7B Instruct** - Strong reasoning
- **OpenChat 7B** - Conversational AI

All models are completely free with your OpenRouter account!

## 🎯 Usage Examples

### Chat with AI
1. Click the extension icon
2. Go to **Chat** tab
3. Type your question: "Explain quantum computing in simple terms"
4. Get instant, intelligent responses

### Summarize a Web Page
1. Navigate to any article or page
2. Click the extension icon
3. Go to **Page** tab
4. Click **Summarize Page**
5. Get a concise summary in seconds

### Explain Selected Text
1. Select text on any webpage
2. Click the extension icon
3. Go to **Page** tab
4. Click **Explain Selection**
5. Get a clear explanation

### Process a PDF
1. Click the extension icon
2. Go to **Files** tab
3. Click **Upload PDF Document**
4. Select your PDF file
5. Get automatic text extraction and summary

## 🔧 Configuration Options

### Settings Page
Access via the ⚙️ button in the popup:

- **Provider**: Choose AI provider (OpenRouter recommended)
- **API Key**: Your API key for the selected provider
- **Model Selection**: Pick your preferred AI model

### Supported Providers
- **OpenRouter** (Recommended) - Free models available
- **OpenAI** - Requires paid API key
- **Hugging Face** - Requires API token
- **GROQ** - Requires API key

## 💡 Tips & Tricks

1. **No API Key Yet?** The extension will show a helpful notice and guide you to get one
2. **Rate Limits**: Free OpenRouter accounts have generous limits for personal use
3. **Model Selection**: Try different models to find your favorite
4. **Chat History**: Your conversations are saved locally in the browser
5. **Keyboard Shortcuts**: Click the extension icon or use the popup for quick access

## 🛠️ Troubleshooting

### "401 Unauthorized" Error
- Your API key is invalid or not configured
- Go to Settings and add a valid OpenRouter API key
- Make sure the key starts with `sk-or-v1-`

### Extension Not Visible
- Make sure you loaded the extension in Developer Mode
- Check that the extension is enabled in `chrome://extensions/`
- Try reloading the extension

### Chat Not Working
- Verify your API key is saved in Settings
- Check your internet connection
- Try selecting a different model

### PDF Upload Fails
- Ensure PDF is under 10MB
- Try a different PDF file
- Check browser console for error messages

## 🔒 Privacy & Security

- **Your data stays private**: API keys stored securely in Chrome's encrypted storage
- **No tracking**: We don't collect or share your data
- **Direct API calls**: Your queries go directly to the AI provider
- **Local history**: Chat history stored only in your browser

## 📚 Project Structure

```
├── extension/
│   ├── api/                 # API client for LLM providers
│   ├── background.js        # Service worker
│   ├── contentScript.js     # Content script for page interaction
│   ├── popup.html          # Main popup interface
│   ├── popup.js            # Popup logic
│   ├── options/            # Settings page
│   ├── styles/             # CSS styles
│   └── manifest.json       # Extension manifest
├── server/                 # (Optional) Backend server
└── README.md              # This file
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and available for personal and educational use.

## 🙏 Acknowledgments

- Built with Chrome Extension Manifest V3
- Uses OpenRouter for free AI model access
- Inspired by modern AI assistant interfaces

## 📞 Support

Having issues? Check the Troubleshooting section or open an issue on GitHub.

---

**Made with ❤️ for the AI community**