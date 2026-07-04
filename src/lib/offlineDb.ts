import { RobloxGame, ChangeLogEntry } from '../gamesData';

const DB_NAME = 'zerohub_offline_db';
const DB_VERSION = 1;

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Store list of all games/scripts
      if (!db.objectStoreNames.contains('games')) {
        db.createObjectStore('games', { keyPath: 'id' });
      }
      
      // Store general keys like favorites and list metadata
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }

      // Store list of changelogs
      if (!db.objectStoreNames.contains('changelogs')) {
        db.createObjectStore('changelogs', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ---- Games Store API ----

export async function saveCachedGames(games: RobloxGame[]): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('games', 'readwrite');
      const store = transaction.objectStore(transaction.objectStoreNames[0] || 'games');
      
      // Clear existing entries
      store.clear();
      
      let errorOccurred = false;
      games.forEach((game) => {
        const req = store.put(game);
        req.onerror = () => {
          errorOccurred = true;
        };
      });

      transaction.oncomplete = () => {
        if (errorOccurred) {
          reject(new Error('Failed to save some games in IndexedDB'));
        } else {
          resolve();
        }
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (err) {
    console.warn('saveCachedGames error:', err);
  }
}

export async function getCachedGames(): Promise<RobloxGame[]> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('games', 'readonly');
      const store = transaction.objectStore('games');
      const req = store.getAll();

      req.onsuccess = () => {
        resolve(req.result || []);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('getCachedGames error:', err);
    return [];
  }
}

// ---- Favorites Store API ----

export async function saveCachedFavorites(favorites: string[]): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('meta', 'readwrite');
      const store = transaction.objectStore('meta');
      const req = store.put(favorites, 'favorites');

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('saveCachedFavorites error:', err);
  }
}

export async function getCachedFavorites(): Promise<string[]> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('meta', 'readonly');
      const store = transaction.objectStore('meta');
      const req = store.get('favorites');

      req.onsuccess = () => {
        resolve(req.result || []);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('getCachedFavorites error:', err);
    return [];
  }
}

// ---- Changelogs Store API ----

export async function saveCachedChangelogs(changelogs: ChangeLogEntry[]): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('changelogs', 'readwrite');
      const store = transaction.objectStore('changelogs');
      
      store.clear();
      
      let errorOccurred = false;
      changelogs.forEach((log) => {
        const req = store.put(log);
        req.onerror = () => {
          errorOccurred = true;
        };
      });

      transaction.oncomplete = () => {
        if (errorOccurred) {
          reject(new Error('Failed to save some changelogs in IndexedDB'));
        } else {
          resolve();
        }
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  } catch (err) {
    console.warn('saveCachedChangelogs error:', err);
  }
}

export async function getCachedChangelogs(): Promise<ChangeLogEntry[]> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('changelogs', 'readonly');
      const store = transaction.objectStore('changelogs');
      const req = store.getAll();

      req.onsuccess = () => {
        resolve(req.result || []);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('getCachedChangelogs error:', err);
    return [];
  }
}

// ---- Performance Metrics Store API ----

export async function saveCachedPerformanceMetrics(metrics: Record<string, any>): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('meta', 'readwrite');
      const store = transaction.objectStore('meta');
      const req = store.put(metrics, 'performance_metrics');

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('saveCachedPerformanceMetrics error:', err);
  }
}

export async function getCachedPerformanceMetrics(): Promise<Record<string, any> | null> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('meta', 'readonly');
      const store = transaction.objectStore('meta');
      const req = store.get('performance_metrics');

      req.onsuccess = () => {
        resolve(req.result || null);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn('getCachedPerformanceMetrics error:', err);
    return null;
  }
}

