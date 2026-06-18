/**
 * Spotics — IndexedDB Database Module
 * Handles all local storage for session keys and listening history.
 */
(function (global) {
  'use strict';

  const DB_NAME = 'SpoTicsPro';
  const DB_VERSION = 1;

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('session'))
          db.createObjectStore('session', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('history')) {
          const s = db.createObjectStore('history', { keyPath: 'id' });
          s.createIndex('played_at', 'played_at', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbPut(store, val) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(val);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function dbGet(store, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(store, 'readonly').objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbGetAll(store) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(store, 'readonly').objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function dbClear(store) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function dbCount(store) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(store, 'readonly').objectStore(store).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // ── Session helpers ──

  async function saveSessionKey(key) {
    await dbPut('session', { id: 'lastfm_session', key });
  }

  async function getSessionKey() {
    const r = await dbGet('session', 'lastfm_session');
    return r ? r.key : null;
  }

  // ── Play history helpers ──

  async function savePlay(play) {
    const id = play.played_at + '_' + play.track_id;
    await dbPut('history', {
      id,
      played_at: play.played_at,
      track_name: play.track_name,
      track_id: play.track_id,
      artist_name: play.artist_name,
      album_name: play.album_name || '',
      album_cover: play.album_cover || '',
      duration_ms: 0,
    });
  }

  async function getAllPlays() {
    return await dbGetAll('history');
  }

  // ── Exports ──

  global.db = { openDB, dbPut, dbGet, dbGetAll, dbClear, dbCount };
  global.saveSessionKey = saveSessionKey;
  global.getSessionKey = getSessionKey;
  global.savePlay = savePlay;
  global.getAllPlays = getAllPlays;
})(window);
