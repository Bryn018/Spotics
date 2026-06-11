// Spotics Scrobbler - Bridge Script
// Injected into spotics.insights.autos to sync the extension's API key
// to the web app's localStorage.

(() => {
  // Only run on spotics.insights.autos
  if (!location.hostname.includes('spotics.insights.autos')) return;

  // Prevent double-injection
  if (window.__SPOTICS_BRIDGE_LOADED) return;
  window.__SPOTICS_BRIDGE_LOADED = true;

  // Read the API key from extension storage and sync to localStorage
  chrome.storage.local.get(['apiKey'], (result) => {
    if (result.apiKey) {
      const currentKey = localStorage.getItem('spotics_api_key');
      if (currentKey !== result.apiKey) {
        localStorage.setItem('spotics_api_key', result.apiKey);
        // Dispatch an event so the web app can react
        window.dispatchEvent(new CustomEvent('spotics-key-synced', { detail: result.apiKey }));
      }
    }
  });

  // Also listen for key changes from the extension
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.apiKey) {
      const newKey = changes.apiKey.newValue;
      if (newKey) {
        localStorage.setItem('spotics_api_key', newKey);
        window.dispatchEvent(new CustomEvent('spotics-key-synced', { detail: newKey }));
      }
    }
  });
})();
