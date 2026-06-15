const DB_NAME = 'SpoTicsLastFM';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('session')) {
        db.createObjectStore('session', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('history')) {
        const store = db.createObjectStore('history', { keyPath: 'id' });
        store.createIndex('played_at', 'played_at', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbPut(storeName, value) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function dbGet(storeName, key) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGetAll(storeName) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveSessionKey(key) {
  await dbPut('session', { id: 'lastfm_session', key });
}

async function getSessionKey() {
  const record = await dbGet('session', 'lastfm_session');
  return record ? record.key : null;
}

async function savePlay(play) {
  const id = `${play.played_at}_${play.track_id}`;

  await dbPut('history', {
    id,
    played_at: play.played_at,
    track_name: play.track_name,
    track_id: play.track_id,
    artist_name: play.artist_name,
    album_cover: play.album_cover,
    duration_ms: 0,
  });
}

async function getAllPlays() {
  return await dbGetAll('history');
}

async function getLastFetchTimestamp() {
  const plays = await getAllPlays();

  if (plays.length === 0) {
    return null;
  }

  const sorted = [...plays].sort((a, b) => new Date(b.played_at) - new Date(a.played_at));
  return sorted[0].played_at;
}
