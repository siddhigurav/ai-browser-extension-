// This will be the entry point for the sidebar's plain JavaScript application.

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');
  if (root) {
    // Create a script element to load App.js
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('sidebar/App.js');
    script.onload = function() {
      console.log('App.js loaded successfully');
    };
    document.head.appendChild(script);
  }
});