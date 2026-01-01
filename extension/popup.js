// popup-modern.js - Modern AI Assistant like Sider.ai

// DOM Elements
const messagesContainer = document.getElementById('messages');
const welcomeScreen = document.getElementById('welcome');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const errorMsg = document.getElementById('errorMsg');
const modelSelect = document.getElementById('modelSelect');
const settingsBtn = document.getElementById('settingsBtn');
const quickActions = document.getElementById('quickActions');

// State
let isLoading = false;
let conversationStarted = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(['model'], (data) => {
    if (data.model) {
      modelSelect.value = data.model;
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Send button
  sendBtn.addEventListener('click', handleSend);

  // Enter to send (Shift+Enter for new line)
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea
  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
  });

  // Model selection
  modelSelect.addEventListener('change', () => {
    chrome.storage.sync.set({ model: modelSelect.value });
  });

  // Settings button
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Suggestion cards
  document.querySelectorAll('.suggestion').forEach(suggestion => {
    suggestion.addEventListener('click', () => {
      const action = suggestion.getAttribute('data-action');
      if (action) {
        handleQuickAction(action);
      } else {
        const prompt = suggestion.getAttribute('data-prompt');
        if (prompt) {
          userInput.value = prompt;
          handleSend();
        }
      }
    });
  });

  // Quick action buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      handleQuickAction(action);
    });
  });
}

// Handle quick actions
async function handleQuickAction(action) {
  hideError();

  try {
    switch (action) {
      case 'summarize':
        await extractAndProcess('Summarize the main points of this page in 3-4 sentences:', 'page');
        break;
      case 'explain':
        await extractAndProcess('Explain the following text in simple terms:', 'selection');
        break;
      case 'improve':
        await extractAndProcess('Improve the clarity and readability of this text:', 'selection');
        break;
      case 'extract':
        await extractAndProcess('Extract the key points and action items from this text:', 'page');
        break;
      case 'pdf':
        handlePDFUpload();
        break;
      case 'ocr':
        handleImageUpload();
        break;
      case 'translate':
        userInput.value = 'Translate the following to English:';
        userInput.focus();
        break;
    }
  } catch (error) {
    showError('Failed to perform action: ' + error.message);
  }
}

// Extract page content or selection and process
async function extractAndProcess(instruction, type) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: type === 'page' ? 'EXTRACT_PAGE_CONTENT' : 'EXTRACT_SELECTED_TEXT'
    });

    if (response && response.content) {
      const prompt = `${instruction}\n\n${response.content.substring(0, 3000)}`;
      await sendMessage(prompt, true);
    } else {
      showError(type === 'page' ? 'Failed to extract page content' : 'No text selected');
    }
  } catch (error) {
    showError('Failed to extract content: ' + error.message);
  }
}

// Handle send message
async function handleSend() {
  const message = userInput.value.trim();
  if (!message || isLoading) return;

  await sendMessage(message);
}

// Send message to AI
async function sendMessage(message, skipDisplay = false) {
  if (!skipDisplay) {
    // Display user message
    addMessage(message, 'user');
  }

  // Clear input and hide welcome
  userInput.value = '';
  userInput.style.height = 'auto';
  hideWelcome();

  // Show typing indicator
  showTyping();
  isLoading = true;
  sendBtn.disabled = true;

  try {
    // Get API token and provider
    const { apiToken, provider, model: savedModel } = await chrome.storage.sync.get(['apiToken', 'provider', 'model']);

    // Construct payload for background script
    const selectedModel = modelSelect.value || savedModel || 'meta-llama/llama-3-8b-instruct';
    
    // Call background script with the correct message type
    const response = await chrome.runtime.sendMessage({
      type: 'AI_REQUEST',
      payload: {
        prompt: message,
        model: selectedModel,
        selectedModel: selectedModel,
        provider: provider || 'openrouter',
        maxTokens: 1000,
        temperature: 0.7
      },
      apiToken: apiToken || '',
      provider: provider || ''
    });

    hideTyping();

    if (response && response.success && response.data) {
      // Extract text from the response data
      let responseText = '';
      if (typeof response.data === 'string') {
        responseText = response.data;
      } else if (response.data.text) {
        responseText = response.data.text;
      } else if (response.data.message) {
        responseText = response.data.message;
      } else {
        responseText = JSON.stringify(response.data);
      }
      
      addMessage(responseText, 'assistant');
      hideError();
    } else if (response && response.error) {
      handleError(response.error);
    } else {
      showError('No response from AI. Please try again.');
    }
  } catch (error) {
    hideTyping();
    handleError(error.message);
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
  }
}

// Handle errors
function handleError(error) {
  console.error('AI Error:', error);

  // Check if it's a 401 error with OpenRouter
  if (error.includes('401') || error.includes('unauthorized')) {
    // Try to detect if user is using free models
    const selectedModel = modelSelect.value;
    const freeModels = [
      'meta-llama/llama-3-8b-instruct',
      'google/gemma-7b-it',
      'mistralai/mistral-7b-instruct',
      'openchat/openchat-7b'
    ];

    if (freeModels.includes(selectedModel)) {
      showError('Free models don\'t require API keys, but may have rate limits. Try again or select a different model.');
      addMessage('I encountered a rate limit. Please try again in a moment or select a different free model.', 'assistant');
    } else {
      showError('API authentication failed. Please add your API key in Settings.');
      addMessage('Please configure your API key in Settings (⚙️ button) to use this model.', 'assistant');
    }
  } else {
    showError(error);
    addMessage('I encountered an error: ' + error, 'assistant');
  }
}

// Add message to chat
function addMessage(text, role) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? '👤' : '✨';

  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTyping() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message assistant';
  typingDiv.id = 'typing-indicator';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '✨';

  const content = document.createElement('div');
  content.className = 'message-content';

  const typing = document.createElement('div');
  typing.className = 'typing';
  typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  content.appendChild(typing);
  typingDiv.appendChild(avatar);
  typingDiv.appendChild(content);

  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();
}

// Show error
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
  setTimeout(() => hideError(), 5000);
}

// Hide error
function hideError() {
  errorMsg.classList.remove('show');
}

// Hide welcome screen
function hideWelcome() {
  if (!conversationStarted) {
    welcomeScreen.style.display = 'none';
    conversationStarted = true;
  }
}

// Handle PDF upload
function handlePDFUpload() {
  const pdfInput = document.getElementById('pdfInput');
  pdfInput.click();
  
  pdfInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      showError('PDF file too large. Max 10MB.');
      return;
    }
    
    showTyping();
    hideWelcome();
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const response = await chrome.runtime.sendMessage({
        type: 'PROCESS_PDF',
        fileData: Array.from(new Uint8Array(arrayBuffer)),
        fileName: file.name
      });
      
      hideTyping();
      
      if (response && response.success && response.text) {
        addMessage(`Extracted text from ${file.name}:\n\n${response.text.substring(0, 500)}...`, 'assistant');
        userInput.value = `Summarize this PDF content:\n\n${response.text}`;
        userInput.focus();
      } else {
        showError(response.error || 'Failed to process PDF');
      }
    } catch (error) {
      hideTyping();
      showError('PDF processing error: ' + error.message);
    }
    
    pdfInput.value = '';
  };
}

// Handle image upload for OCR
function handleImageUpload() {
  const imageInput = document.getElementById('imageInput');
  imageInput.click();
  
  imageInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showError('Image file too large. Max 5MB.');
      return;
    }
    
    showTyping();
    hideWelcome();
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const response = await chrome.runtime.sendMessage({
        type: 'PROCESS_OCR',
        fileData: Array.from(new Uint8Array(arrayBuffer)),
        fileType: file.type,
        fileName: file.name
      });
      
      hideTyping();
      
      if (response && response.success && response.text) {
        addMessage(`Extracted text from ${file.name}:\n\n${response.text}`, 'assistant');
        userInput.value = `Process this extracted text:\n\n${response.text}`;
        userInput.focus();
      } else {
        showError(response.error || 'Failed to process image');
      }
    } catch (error) {
      hideTyping();
      showError('OCR processing error: ' + error.message);
    }
    
    imageInput.value = '';
  };
}

