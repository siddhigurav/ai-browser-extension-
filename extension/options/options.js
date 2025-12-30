document.addEventListener('DOMContentLoaded', () => {
  const modelSelect = document.getElementById('modelSelect');
  const saveModelBtn = document.getElementById('saveModelBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveBtn = document.getElementById('saveBtn');
  const clearKeyBtn = document.getElementById('clearKeyBtn');
  const providerSelect = document.getElementById('providerSelect');
  const status = document.getElementById('status');
  const detectedProviderEl = document.getElementById('detectedProvider');
  const validationMessageEl = document.getElementById('validationMessage');

  // Models considered free on OpenRouter
  const openrouterFreeModels = [
    'openchat/openchat-7b',
    'mistralai/mistral-7b-instruct',
    'google/gemma-7b-it',
    'nousresearch/nous-hermes-2-mixtral-8x7b-dpo',
    'microsoft/phi-3-medium-128k-instruct',
    'meta-llama/llama-3-8b-instruct'
  ];

  // Load saved settings (model + apiToken + provider)
  chrome.storage.sync.get(['model', 'apiToken', 'provider'], (data) => {
    if (data.model) modelSelect.value = data.model;
    if (data.apiToken) apiKeyInput.value = data.apiToken;
    if (data.provider) providerSelect.value = data.provider;
    // Update detection UI after restoring values
    setTimeout(updateDetectionUI, 50);
  });

  function showStatus(msg, ms = 2000) {
    status.textContent = msg;
    if (ms > 0) setTimeout(() => status.textContent = '', ms);
  }

  function detectProviderFromTokenAndModel(token = '', model = '', explicitProvider = '') {
    // If user explicitly selected a provider, respect it
    if (explicitProvider) return explicitProvider;

    if (typeof token === 'string' && token.length) {
      if (token.startsWith('hf_')) return 'huggingface';
      if (token.startsWith('sk-') || token.includes('openai')) return 'openai';
      if (token.startsWith('gsk_')) return 'groq';
      if (token.startsWith('openrouter-')) return 'openrouter';
    }

    // Detect from model name for common free OpenRouter models
    if (model && openrouterFreeModels.includes(model)) return 'openrouter';

    // No clear detection
    return null;
  }

  function validateTokenForProvider(provider, token) {
    if (!provider) return { ok: true, message: '' };
    const t = token || '';
    if (provider === 'openai') {
      if (!t) return { ok: false, message: 'OpenAI selected but no API key provided.' };
      if (t.startsWith('sk-') || t.includes('openai')) return { ok: true, message: '' };
      return { ok: false, message: 'Invalid OpenAI token. It usually starts with "sk-".' };
    }
    if (provider === 'huggingface') {
      if (!t) return { ok: false, message: 'Hugging Face selected but no API key provided.' };
      if (t.startsWith('hf_')) return { ok: true, message: '' };
      return { ok: false, message: 'Invalid Hugging Face token. It should start with "hf_".' };
    }
    if (provider === 'groq') {
      if (!t) return { ok: false, message: 'GROQ selected but no API key provided.' };
      if (t.startsWith('gsk_')) return { ok: true, message: '' };
      return { ok: false, message: 'Invalid GROQ token. It should start with "gsk_".' };
    }
    if (provider === 'openrouter') {
      // OpenRouter tokens are optional for free models — accept empty token
      if (!t) return { ok: true, message: 'No OpenRouter token provided — free models will be used.' };
      if (t.startsWith('openrouter-')) return { ok: true, message: '' };
      return { ok: false, message: 'Invalid OpenRouter token. It usually starts with "openrouter-".' };
    }
    return { ok: true, message: '' };
  }

  function updateDetectionUI() {
    const token = apiKeyInput.value ? apiKeyInput.value.trim() : '';
    const model = modelSelect.value || '';
    const explicit = providerSelect.value || '';
    const detected = detectProviderFromTokenAndModel(token, model, explicit);

    if (explicit) {
      detectedProviderEl.textContent = `Provider (explicit): ${explicit}`;
    } else if (detected) {
      detectedProviderEl.textContent = `Detected provider: ${detected}`;
    } else {
      detectedProviderEl.textContent = `Provider: Auto (not detected)`;
    }

    // Validation
    let validation = { ok: true, message: '' };
    // If explicit provider chosen, validate token for that provider
    if (explicit) validation = validateTokenForProvider(explicit, token);
    else if (detected) validation = validateTokenForProvider(detected, token);

    if (!validation.ok) {
      validationMessageEl.textContent = validation.message;
      saveBtn.disabled = true;
    } else {
      // show informational message when token missing for OpenRouter detected (allowed)
      if (validation.message) {
        validationMessageEl.textContent = validation.message;
      } else {
        validationMessageEl.textContent = '';
      }
      saveBtn.disabled = false;
    }
  }

  // Save API Key + provider when Save key is clicked
  saveBtn.addEventListener('click', () => {
    const apiToken = apiKeyInput.value ? apiKeyInput.value.trim() : '';
    const provider = providerSelect.value || '';
    // If explicit provider is selected and token is invalid, prevent saving
    const validation = provider ? validateTokenForProvider(provider, apiToken) : { ok: true };
    if (!validation.ok) {
      showStatus(validation.message, 3000);
      return;
    }
    // Persist token and provider so background.js will pick them up
    chrome.storage.sync.set({ apiToken, provider }, () => {
      showStatus('API key & provider saved');
      updateDetectionUI();
    });
  });

  // Clear stored API key + provider
  clearKeyBtn.addEventListener('click', () => {
    apiKeyInput.value = '';
    providerSelect.value = '';
    chrome.storage.sync.remove(['apiToken', 'provider'], () => {
      showStatus('API key & provider cleared');
      updateDetectionUI();
    });
  });

  // Save selected model (separate button for clarity)
  saveModelBtn.addEventListener('click', () => {
    const model = modelSelect.value;
    chrome.storage.sync.set({ model }, () => {
      showStatus('Model saved');
      updateDetectionUI();
    });
  });

  // Real-time updates
  apiKeyInput.addEventListener('input', updateDetectionUI);
  providerSelect.addEventListener('change', updateDetectionUI);
  modelSelect.addEventListener('change', updateDetectionUI);
  // Initial detection
  updateDetectionUI();
});