// storage.js - wrapper around storage for api key and messages
// Gracefully falls back to window.localStorage when chrome.storage is unavailable
const Storage = (function(){
  const hasChromeStorage = (typeof chrome !== 'undefined') && chrome.storage && chrome.storage.local;

  function _lsGet(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : undefined;
    } catch (e) { return undefined; }
  }
  function _lsSet(key, val) {
    try { window.localStorage.setItem(key, JSON.stringify(val)); return true; } catch (e) { return false; }
  }

  function getApiKey() {
    if (hasChromeStorage) {
      return new Promise((res) => {
        chrome.storage.local.get(['openrouter_api_key'], (d) => res(d.openrouter_api_key || ''));
      });
    }
    return Promise.resolve(_lsGet('openrouter_api_key') || '');
  }

  function setApiKey(key) {
    if (hasChromeStorage) {
      return new Promise((res) => {
        chrome.storage.local.set({ openrouter_api_key: key }, () => res(true));
      });
    }
    _lsSet('openrouter_api_key', key);
    return Promise.resolve(true);
  }

  function getMode() {
    if (hasChromeStorage) {
      return new Promise((res) => {
        chrome.storage.local.get(['default_mode'], (d) => res(d.default_mode || 'FAST'));
      });
    }
    return Promise.resolve(_lsGet('default_mode') || 'FAST');
  }

  function setMode(mode) {
    if (hasChromeStorage) {
      return new Promise((res) => {
        chrome.storage.local.set({ default_mode: mode }, () => res(true));
      });
    }
    _lsSet('default_mode', mode);
    return Promise.resolve(true);
  }

  function getMessages() {
    if (hasChromeStorage) {
      return new Promise((res) => {
        chrome.storage.local.get(['messages'], (d) => res(d.messages || []));
      });
    }
    return Promise.resolve(_lsGet('messages') || []);
  }

  function saveMessages(messages) {
    if (hasChromeStorage) {
      return new Promise((res) => {
        chrome.storage.local.set({ messages }, () => res(true));
      });
    }
    _lsSet('messages', messages);
    return Promise.resolve(true);
  }

  function clearMessages() {
    if (hasChromeStorage) {
      return new Promise((res) => {
        chrome.storage.local.set({ messages: [] }, () => res(true));
      });
    }
    _lsSet('messages', []);
    return Promise.resolve(true);
  }

  return { getApiKey, setApiKey, getMode, setMode, getMessages, saveMessages, clearMessages };
})();
