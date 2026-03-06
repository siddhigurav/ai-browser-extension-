// sidebar.js - UI logic for the persistent AI sidebar
(function(){
  function safeLog(...args){ if (window.console) console.log('[sidebar]', ...args); }
  function safeError(...args){ if (window.console) console.error('[sidebar]', ...args); }

  document.addEventListener('DOMContentLoaded', () => {
    try {
      const messagesEl = document.getElementById('messages');
      const inputBox = document.getElementById('inputBox');
      const sendBtn = document.getElementById('sendBtn');
      const modeSelect = document.getElementById('modeSelect');
      const settingsBtn = document.getElementById('settingsBtn');
      const summarizePageBtn = document.getElementById('summarizePage');

      if (!messagesEl || !inputBox || !sendBtn) {
        safeError('Essential UI elements missing');
        return;
      }

      let messages = [];

      function renderMessages(){
        messagesEl.innerHTML = '';
        messages.forEach(m => {
          const d = document.createElement('div');
          d.className = 'msg ' + (m.role === 'user' ? 'user' : 'assistant');
          d.textContent = m.content;
          messagesEl.appendChild(d);
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }

      async function loadState(){
        try {
          messages = await Storage.getMessages();
          const mode = await Storage.getMode();
          if (modeSelect) modeSelect.value = mode || 'FAST';
        } catch (e) {
          safeError('Error loading state', e);
        }
        renderMessages();
      }

      async function handleSend(task){
        const text = inputBox.value.trim();
        if (!text) return;
        const userMsg = { role: 'user', content: text };
        messages.push(userMsg);
        renderMessages();
        inputBox.value = '';
        try { await Storage.saveMessages(messages); } catch(e){ safeError('saveMessages failed', e); }
        await callAssistant(text, task || 'chat');
      }

      async function callAssistant(text, task){
        try {
          const apiKey = await Storage.getApiKey();
          if (!apiKey) {
            messages.push({ role: 'assistant', content: 'OpenRouter API key missing. Open Settings to add it.' });
            renderMessages();
            return;
          }
          const mode = await Storage.getMode();
          const model = Router.chooseModel(task, mode);
          const convo = messages.map(m => ({ role: m.role, content: m.content }));
          convo.push({ role: 'user', content: text });

          messages.push({ role: 'assistant', content: 'Thinking...' });
          renderMessages();
          const reply = await OpenRouterAPI.callOpenRouter(apiKey, model, convo);

          // remove temporary 'Thinking...'
          const tmpIndex = messages.findIndex(m => m.content === 'Thinking...');
          if (tmpIndex >= 0) messages.splice(tmpIndex, 1);
          messages.push({ role: 'assistant', content: reply });
          await Storage.saveMessages(messages);
          renderMessages();
        } catch (err) {
          safeError('callAssistant error', err);
          const tmpIndex = messages.findIndex(m => m.content === 'Thinking...');
          if (tmpIndex >= 0) messages.splice(tmpIndex, 1);
          messages.push({ role: 'assistant', content: 'Error: ' + (err && err.message ? err.message : 'API request failed') });
          try { await Storage.saveMessages(messages); } catch(e){ safeError('saveMessages failed', e); }
          renderMessages();
        }
      }

      // Quick action buttons: now they prefill AND send automatically
      document.querySelectorAll('.quick-actions button[data-action]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const action = btn.getAttribute('data-action');
          inputBox.placeholder = action + '...';
          // prefill from last selection if available
          chrome.storage.local.get(['lastSelection'], async (d) => {
            let text = '';
            if (d.lastSelection && d.lastSelection.text) text = d.lastSelection.text;
            if (!text) text = inputBox.value.trim();
            if (!text) return;
            inputBox.value = text;
            await handleSend(action);
          });
        });
      });

      // send button
      sendBtn.addEventListener('click', () => handleSend());
      inputBox.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey||e.metaKey) ) handleSend(); });

      // settings open
      if (settingsBtn) settingsBtn.addEventListener('click', () => {
        try {
          const url = chrome.runtime.getURL('settings.html');
          // Try to open in a new tab (may fail in sidePanel context)
          if (chrome && chrome.tabs && chrome.tabs.create) {
            chrome.tabs.create({ url }, () => {});
            return;
          }
          // If tabs API unavailable (sidePanel), navigate the current panel to settings
          window.location.href = url;
        } catch (e) {
          safeError('open settings failed', e);
          try { window.location.href = chrome.runtime.getURL('settings.html'); } catch (ee) { safeError('fallback open failed', ee); }
        }
      });

      // Summarize page
      if (summarizePageBtn) summarizePageBtn.addEventListener('click', async () => {
        try {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const tab = tabs && tabs[0];
          if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'summarizePage' }, (resp) => {});
          }
        } catch (e) { safeError('summarizePage failed', e); }
      });

      // Listen for messages from background / content
      if (chrome && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
          if (!msg || !msg.action) return;
          try {
            if (msg.action === 'selection') {
              inputBox.value = msg.text || '';
              inputBox.focus();
            }
            if (msg.action === 'contextAction') {
              inputBox.value = msg.text || '';
              const map = { explain: 'explain', summarize: 'summarize', rewrite: 'rewrite', translate: 'translate' };
              callAssistant(inputBox.value, map[msg.type] || 'chat');
            }
            if (msg.action === 'pageContent') {
              const title = msg.title || '';
              const text = msg.text || '';
              const snippet = `${title}\n\n${text.slice(0, 2000)}`;
              inputBox.value = snippet;
              callAssistant(snippet, 'summarize');
            }
          } catch (e) { safeError('onMessage handler error', e); }
        });
      }

      // clear history UI hook
      window.clearChatHistory = async function(){
        messages = [];
        try { await Storage.clearMessages(); } catch(e){ safeError('clearMessages failed', e); }
        renderMessages();
      };

      loadState();
    } catch (ex) {
      safeError('Fatal sidebar initialization error', ex);
    }
  });
})();
