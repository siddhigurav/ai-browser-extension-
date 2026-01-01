// AI Assistant - Popup Script

// State Management
let currentTab = 'chat';
let isProcessing = false;

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Chat functionality
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = chatInput.scrollHeight + 'px';
  });
  
  sendBtn.addEventListener('click', sendChatMessage);

  // Page actions
  document.querySelectorAll('[data-action]').forEach(card => {
    card.addEventListener('click', () => handlePageAction(card.dataset.action));
  });

  // File uploads
  document.getElementById('pdfUpload').addEventListener('click', () => {
    document.getElementById('pdfInput').click();
  });
  
  document.getElementById('imageUpload').addEventListener('click', () => {
    document.getElementById('imageInput').click();
  });
  
  document.getElementById('pdfInput').addEventListener('change', handlePDFUpload);
  document.getElementById('imageInput').addEventListener('change', handleImageUpload);

  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Load chat history
  loadChatHistory();
}

function switchTab(tabName) {
  currentTab = tabName;
  
  // Update tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Update panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `${tabName}-panel`);
  });
}


// Chat Functions
async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (!message || isProcessing) return;
  
  chatInput.value = '';
  chatInput.style.height = 'auto';
  
  addMessage('user', message);
  showTyping();
  
  isProcessing = true;
  
  try {
    const modelSelect = document.getElementById('modelSelect');
    const selectedModel = modelSelect.value;
    
    const response = await chrome.runtime.sendMessage({
      type: 'AI_REQUEST',
      payload: {
        prompt: message,
        model: selectedModel,
        selectedModel: selectedModel,
        provider: 'openrouter',
        maxTokens: 2000,
        temperature: 0.7
      }
    });
    
    hideTyping();
    
    if (response && response.success && response.data) {
      const aiResponse = response.data.text || response.data.message || JSON.stringify(response.data);
      addMessage('assistant', aiResponse);
      saveChatHistory();
    } else {
      const errorMsg = response?.error || 'Failed to get response';
      addMessage('assistant', `❌ Error: ${errorMsg}`);
      showStatus('error', errorMsg);
    }
  } catch (error) {
    hideTyping();
    console.error('Chat error:', error);
    addMessage('assistant', `❌ Error: ${error.message}`);
    showStatus('error', error.message);
  } finally {
    isProcessing = false;
  }
}

function addMessage(role, content) {
  const messagesDiv = document.getElementById('chatMessages');
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? '👤' : '🤖';
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  contentEl.textContent = content;
  
  messageEl.appendChild(avatar);
  messageEl.appendChild(contentEl);
  messagesDiv.appendChild(messageEl);
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showTyping() {
  const messagesDiv = document.getElementById('chatMessages');
  const typingEl = document.createElement('div');
  typingEl.className = 'message assistant';
  typingEl.id = 'typing-indicator';
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '🤖';
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing';
  typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  
  typingEl.appendChild(avatar);
  typingEl.appendChild(typingDiv);
  messagesDiv.appendChild(typingEl);
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideTyping() {
  const typingEl = document.getElementById('typing-indicator');
  if (typingEl) typingEl.remove();
}

function saveChatHistory() {
  const messages = [];
  document.querySelectorAll('#chatMessages .message').forEach(msg => {
    const role = msg.classList.contains('user') ? 'user' : 'assistant';
    const content = msg.querySelector('.message-content')?.textContent;
    if (content) messages.push({ role, content });
  });
  chrome.storage.local.set({ chatHistory: messages });
}

function loadChatHistory() {
  chrome.storage.local.get(['chatHistory'], (result) => {
    if (result.chatHistory && result.chatHistory.length > 0) {
      result.chatHistory.forEach(msg => {
        addMessage(msg.role, msg.content);
      });
    } else {
      // Show welcome message
      addMessage('assistant', '👋 Hello! I\'m your AI assistant. How can I help you today?');
    }
  });
}


// Page Actions
async function handlePageAction(action) {
  if (isProcessing) return;
  
  showStatus('success', 'Processing...');
  isProcessing = true;
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
      showStatus('error', 'Cannot access this page. Please navigate to a regular webpage.');
      isProcessing = false;
      return;
    }
    
    // Ensure content script is injected
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScript.js']
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (e) {
      console.log('Content script already injected or failed:', e);
    }
    
    let content = '';
    let instruction = '';
    
    switch (action) {
      case 'summarize-page':
        const pageResponse = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PAGE_CONTENT' });
        content = pageResponse.content;
        instruction = 'Please summarize the key points of this webpage:';
        break;
        
      case 'explain-selection':
        const selectionResponse = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_SELECTED_TEXT' });
        content = selectionResponse.text;
        if (!content || content.trim().length === 0) {
          showStatus('error', 'Please select some text on the page first.');
          isProcessing = false;
          return;
        }
        instruction = 'Please explain this text in simple terms:';
        break;
        
      case 'extract-points':
        const pointsResponse = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PAGE_CONTENT' });
        content = pointsResponse.content;
        instruction = 'Extract the main bullet points from this content:';
        break;
        
      case 'improve-text':
        const improveResponse = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_SELECTED_TEXT' });
        content = improveResponse.text;
        if (!content || content.trim().length === 0) {
          showStatus('error', 'Please select some text to improve.');
          isProcessing = false;
          return;
        }
        instruction = 'Please improve this text (fix grammar, enhance clarity):';
        break;
    }
    
    if (!content || content.trim().length === 0) {
      showStatus('error', 'No content found to process.');
      isProcessing = false;
      return;
    }
    
    // Switch to chat tab and show the request
    switchTab('chat');
    addMessage('user', `${instruction}\n\n${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`);
    showTyping();
    
    const modelSelect = document.getElementById('modelSelect');
    const selectedModel = modelSelect.value;
    
    const response = await chrome.runtime.sendMessage({
      type: 'AI_REQUEST',
      payload: {
        prompt: `${instruction}\n\n${content}`,
        model: selectedModel,
        selectedModel: selectedModel,
        provider: 'openrouter',
        maxTokens: 2000,
        temperature: 0.7
      }
    });
    
    hideTyping();
    
    if (response && response.success && response.data) {
      const aiResponse = response.data.text || response.data.message || JSON.stringify(response.data);
      addMessage('assistant', aiResponse);
      saveChatHistory();
      showStatus('success', 'Done!');
    } else {
      const errorMsg = response?.error || 'Failed to process';
      addMessage('assistant', `❌ Error: ${errorMsg}`);
      showStatus('error', errorMsg);
    }
  } catch (error) {
    hideTyping();
    console.error('Page action error:', error);
    showStatus('error', error.message);
  } finally {
    isProcessing = false;
  }
}

// File Upload Functions
async function handlePDFUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 10 * 1024 * 1024) {
    showStatus('error', 'PDF file is too large (max 10MB)');
    return;
  }
  
  showStatus('success', `Processing PDF: ${file.name}...`);
  isProcessing = true;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    const response = await chrome.runtime.sendMessage({
      type: 'PROCESS_PDF',
      data: base64,
      filename: file.name
    });
    
    if (response && response.success && response.text) {
      switchTab('chat');
      addMessage('user', `📄 Uploaded PDF: ${file.name}\n\n✓ Extracted ${response.text.length} characters`);
      
      showTyping();
      
      // Auto-summarize
      const modelSelect = document.getElementById('modelSelect');
      const selectedModel = modelSelect.value;
      
      const aiResponse = await chrome.runtime.sendMessage({
        type: 'AI_REQUEST',
        payload: {
          prompt: `Please summarize this PDF document:\n\n${response.text}`,
          model: selectedModel,
          selectedModel: selectedModel,
          provider: 'openrouter',
          maxTokens: 2000,
          temperature: 0.7
        }
      });
      
      hideTyping();
      
      if (aiResponse && aiResponse.success && aiResponse.data) {
        const summary = aiResponse.data.text || aiResponse.data.message || JSON.stringify(aiResponse.data);
        addMessage('assistant', summary);
        saveChatHistory();
        showStatus('success', 'PDF processed successfully!');
      }
    } else {
      showStatus('error', response?.error || 'Failed to process PDF');
    }
  } catch (error) {
    console.error('PDF upload error:', error);
    showStatus('error', error.message);
  } finally {
    isProcessing = false;
    event.target.value = '';
  }
}

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    showStatus('error', 'Image file is too large (max 5MB)');
    return;
  }
  
  showStatus('success', `Processing image: ${file.name}...`);
  isProcessing = true;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    const response = await chrome.runtime.sendMessage({
      type: 'PROCESS_OCR',
      data: base64,
      filename: file.name
    });
    
    if (response && response.success && response.text) {
      switchTab('chat');
      addMessage('user', `🖼️ Uploaded image: ${file.name}`);
      addMessage('assistant', `✓ Extracted text:\n\n${response.text}`);
      saveChatHistory();
      showStatus('success', 'Text extracted successfully!');
    } else {
      showStatus('error', response?.error || 'Failed to process image');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    showStatus('error', error.message);
  } finally {
    isProcessing = false;
    event.target.value = '';
  }
}

// Status Messages
function showStatus(type, message) {
  const statusMsg = document.getElementById('statusMsg');
  statusMsg.textContent = message;
  statusMsg.className = `status-msg ${type} show`;
  
  setTimeout(() => {
    statusMsg.classList.remove('show');
  }, 3000);
}

