// Content script: detect selection and offer "Explain with AI" floating button
(function(){
  let btn = null;
  let hideTimer = null;

  function createButton() {
    btn = document.createElement('button');
    btn.innerText = 'Explain with AI';
    btn.id = 'ai-explain-btn-ext';
    btn.style.position = 'absolute';
    btn.style.zIndex = 2147483647;
    btn.style.padding = '6px 10px';
    btn.style.background = '#fff';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    btn.style.border = '1px solid #e6e6e6';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '13px';
    btn.style.display = 'none';
    document.body.appendChild(btn);
    btn.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const selection = window.getSelection().toString().trim();
      if (!selection) return;
      chrome.runtime.sendMessage({ action: 'selection', text: selection });
      hideButton();
    });
  }

  function showButtonAtRange() {
    const sel = window.getSelection();
    const text = sel.toString().trim();
    if (!text) { hideButton(); return; }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!btn) createButton();
    const top = window.scrollY + Math.max(0, rect.top - 40);
    const left = window.scrollX + rect.left;
    btn.style.top = top + 'px';
    btn.style.left = left + 'px';
    btn.style.display = 'block';
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hideButton, 5000);
  }

  function hideButton() {
    if (btn) btn.style.display = 'none';
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  }

  document.addEventListener('selectionchange', () => {
    setTimeout(() => {
      try { showButtonAtRange(); } catch (e) { hideButton(); }
    }, 10);
  });

  // Extract page content for summarization
  function extractPageContent() {
    const title = document.title || '';
    let main = '';
    const mainEl = document.querySelector('main') || document.querySelector('article');
    if (mainEl) main = mainEl.innerText;
    if (!main) main = document.body ? document.body.innerText : '';
    main = main.replace(/\s+/g, ' ').trim();
    return { title, text: main };
  }

  // Listen for messages from background/sidebar
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !msg.action) return;
    if (msg.action === 'summarizePage') {
      const content = extractPageContent();
      chrome.runtime.sendMessage({ action: 'pageContent', title: content.title, text: content.text });
      sendResponse({ ok: true });
    }
  });
})();
