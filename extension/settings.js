document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const modeSelect = document.getElementById('modeSelect');
  const saveBtn = document.getElementById('saveBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  const currentKey = await Storage.getApiKey();
  const currentMode = await Storage.getMode();
  apiKeyInput.value = currentKey || '';
  modeSelect.value = currentMode || 'FAST';

  saveBtn.addEventListener('click', async () => {
    await Storage.setApiKey(apiKeyInput.value.trim());
    await Storage.setMode(modeSelect.value);
    alert('Settings saved');
  });

  clearHistoryBtn.addEventListener('click', async () => {
    if (!confirm('Clear chat history?')) return;
    await Storage.clearMessages();
    alert('Chat history cleared');
  });
});
