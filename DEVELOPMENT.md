# AI Assistant Extension Development Guide

This guide provides instructions for setting up, running, and extending the AI Assistant browser extension.

## Prerequisites

- Python 3.8 or higher
- Node.js and npm
- Google Chrome or Microsoft Edge browser
- Git (for version control)

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd browser_extension
```

### 2. Set up the Extension (Frontend)

Navigate to the extension directory:

```bash
cd extension
```

Install dependencies:

```bash
npm install
```

### 3. Set up the Server (Backend)

Navigate to the server directory:

```bash
cd server
```

Create a virtual environment (recommended):

```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

For a minimal setup, you can use the basic requirements:

```bash
pip install -r requirements_basic.txt
```

## Running the Project

### Start the Server

From the server directory:

```bash
python app.py
```

The server will start on `http://localhost:5000`.

### Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select the `extension` directory from the project
5. The extension icon should appear in your toolbar

### Test the Extension

1. Click the extension icon in the toolbar
2. Enter text in the input area
3. Select an action (Summarize, Chat, etc.)
4. View the results in the output area

## Project Structure

```
├── extension/              # Browser extension code
│   ├── background/         # Service worker and messaging
│   ├── sidebar/            # UI components and main application
│   ├── src/content/        # Content scripts
│   ├── utils/              # Utility functions
│   ├── manifest.json       # Extension configuration
│   └── package.json        # Frontend dependencies
│
└── server/                 # Backend server
    ├── routers/            # API endpoints
    ├── services/           # LLM providers and integrations
    ├── app.py              # Main server application
    ├── requirements.txt    # Full Python dependencies
    └── requirements_basic.txt # Minimal Python dependencies
```

## Adding New Features

### 1. Adding a New API Endpoint

To add a new feature, create a new endpoint in the appropriate router file in `server/routers/` or create a new router.

Example for adding a new endpoint in `server/routers/llm.py`:

```python
@llm_bp.route('/new-feature', methods=['POST'])
def new_feature():
    data = request.json
    # Process the data
    result = process_new_feature(data)
    return jsonify({'result': result}), 200
```

### 2. Adding a New UI Feature

To add a new feature to the UI:

1. Add a new button in `extension/sidebar/App.js`:

```javascript
// Add button HTML
<button id="newFeatureBtn" style="background-color: #COLOR; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer;">New Feature</button>

// Add button reference
const newFeatureBtn = document.getElementById('newFeatureBtn');

// Add event listener
newFeatureBtn.addEventListener('click', async () => {
  // Feature implementation
});
```

2. Add the corresponding API call function:

```javascript
async function callNewFeatureAPI(data) {
  try {
    const response = await fetch('http://localhost:5000/api/llm/new-feature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error during new feature:', error);
    throw error;
  }
}
```

## Testing

### Server Testing

Run the test script to verify server functionality:

```bash
python test_server.py
```

### Extension Testing

Use the test.html file to test the extension UI without installing it:

1. Open `extension/test.html` in your browser
2. Test the various features using the sample content

## Extending Functionality

### Adding New LLM Providers

1. Create a new provider file in `server/services/llm_providers/`
2. Implement the required methods for the provider
3. Update the router to use the new provider

### Adding New Processing Capabilities

1. Create a new directory in `server/` for the capability (e.g., `translation/`)
2. Implement the processing logic
3. Create a router for the new capability
4. Register the router in `server/app.py`

## Troubleshooting

### Common Issues

1. **Extension not loading**: 
   - Ensure all dependencies are installed
   - Check the Chrome extensions console for errors

2. **API calls failing**:
   - Verify the server is running on `http://localhost:5000`
   - Check the server console for errors
   - Ensure CORS is properly configured

3. **Python dependencies not installing**:
   - Try creating a virtual environment
   - Ensure you have the necessary build tools installed

### Debugging Tips

1. Use browser developer tools to inspect the extension popup
2. Check the server console for error messages
3. Use the test scripts to isolate issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- Integration with multiple LLM providers
- Advanced RAG capabilities
- OCR support for image analysis
- PDF processing
- YouTube transcript analysis
- Voice input and output
- Multi-language support
- Enhanced UI/UX