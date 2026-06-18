/**
 * Spotics — Secure Configuration Module
 * All credentials loaded from localStorage. No hardcoded secrets.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'spotics_config';
  const DEFAULTS = { pollIntervalMs: 5 * 60 * 1000 };
  const REQUIRED_KEYS = ['apiKey', 'apiSecret', 'username'];

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0; }

  function sanitizePollInterval(v) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 10000) return 10000;
    if (n > 1800000) return 1800000;
    return Math.floor(n);
  }

  const stored = loadFromStorage();
  const CONFIG = {
    apiKey: stored.apiKey || '',
    apiSecret: stored.apiSecret || '',
    username: stored.username || '',
    pollIntervalMs: sanitizePollInterval(stored.pollIntervalMs || DEFAULTS.pollIntervalMs),
  };

  function saveConfig(partial) {
    if (!partial || typeof partial !== 'object') throw new Error('saveConfig requires an object.');
    const cur = loadFromStorage();
    const next = { ...cur };
    for (const key of [...REQUIRED_KEYS, 'pollIntervalMs']) {
      if (key in partial) {
        next[key] = key === 'pollIntervalMs' ? sanitizePollInterval(partial[key]) : partial[key].trim();
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    Object.assign(CONFIG, next);
  }

  function validateConfig() {
    const missing = REQUIRED_KEYS.filter(k => !isNonEmptyString(CONFIG[k]));
    return { valid: missing.length === 0, missing };
  }

  global.CONFIG = CONFIG;
  global.saveConfig = saveConfig;
  global.validateConfig = validateConfig;
})(window);
