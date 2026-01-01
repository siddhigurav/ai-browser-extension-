// Modern Sider-AI style popup UI
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const statusEl = document.getElementById('status');

// Remove empty state when first message is added
let firstMessage = true;

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Ctrl+Enter or Shift+Enter
userInput.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
});

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Clear input
  userInput.value = '';
  userInput.style.height = '40px';
  
  // Remove empty state
  if (firstMessage) {
    const emptyState = messagesContainer.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    firstMessage = false;
  }

  // Add user message
  addMessage(message, 'user');
  
  // Show typing indicator
  showTypingIndicator();
  updateStatus('Thinking...');
  sendBtn.disabled = true;

  try {
    // Get saved model and provider
    const { model, apiToken, provider } = await new Promise(resolve => {
      chrome.storage.sync.get(['model', 'apiToken', 'provider'], resolve);
    });

    const selectedModel = model || 'meta-llama/llama-3-8b-instruct';
    
    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      type: 'CALL_MODEL',
      model: selectedModel,
      provider: provider,
      prompt: message,
      apiToken: apiToken
    });

    if (response.error) {
      showError(response.error);
      updateStatus('Error', 'error');
    } else {
      removeTypingIndicator();
      addMessage(response.response || response.text || 'No response', 'assistant');
      updateStatus('Ready');
    }
  } catch (error) {
    console.error('Error:', error);
    showError(`Error: ${error.message}`);
    removeTypingIndicator();
    updateStatus('Error', 'error');
  } finally {
    sendBtn.disabled = false;
  }
}

function addMessage(text, role) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;
  
  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
  removeTypingIndicator();
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typing-indicator';
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'typing-dot';
    indicator.appendChild(dot);
  }
  
  messagesContainer.appendChild(indicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

function showError(message) {
  removeTypingIndicator();
  addMessage(`❌ ${message}`, 'assistant');
}

function updateStatus(text, type = 'normal') {
  statusEl.textContent = text;
  statusEl.className = 'status ' + (type === 'error' ? 'error' : type === 'success' ? 'success' : '');
}

// Initialize
window.addEventListener('load', () => {
  updateStatus('Ready');
});
