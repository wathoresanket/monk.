// Monk. Local Database using IndexedDB

import { Moment, AppSettings, DEFAULT_APP_SETTINGS, PatternInsight } from '@/types/monk';

const DB_NAME = 'monk-db';
const DB_VERSION = 2;


// Store names
const MOMENTS_STORE = 'moments';
const SETTINGS_STORE = 'settings';
const INSIGHTS_STORE = 'insights';
const ASSETS_STORE = 'assets';


let db: IDBDatabase | null = null;

export async function initDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Moments store
      if (!database.objectStoreNames.contains(MOMENTS_STORE)) {
        const momentsStore = database.createObjectStore(MOMENTS_STORE, { keyPath: 'id' });
        momentsStore.createIndex('date', 'date', { unique: false });
        momentsStore.createIndex('type', 'type', { unique: false });
        momentsStore.createIndex('completed', 'completed', { unique: false });
      }

      // Settings store
      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
      }

      // Insights store
      if (!database.objectStoreNames.contains(INSIGHTS_STORE)) {
        const insightsStore = database.createObjectStore(INSIGHTS_STORE, { keyPath: 'id', autoIncrement: true });
        insightsStore.createIndex('type', 'type', { unique: false });
        insightsStore.createIndex('generatedAt', 'generatedAt', { unique: false });
      }

      // Assets store (for custom audio)
      if (!database.objectStoreNames.contains(ASSETS_STORE)) {
        database.createObjectStore(ASSETS_STORE); // Key-value store, no keyPath needed if using out-of-line keys
      }
    };
  });
}

// Moments CRUD
export async function saveMoment(moment: Moment): Promise<void> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MOMENTS_STORE], 'readwrite');
    const store = transaction.objectStore(MOMENTS_STORE);
    const request = store.put(moment);

    request.onerror = () => reject(new Error('Failed to save moment'));
    request.onsuccess = () => resolve();
  });
}

export async function getMoment(id: string): Promise<Moment | undefined> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MOMENTS_STORE], 'readonly');
    const store = transaction.objectStore(MOMENTS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(new Error('Failed to get moment'));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getAllMoments(): Promise<Moment[]> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MOMENTS_STORE], 'readonly');
    const store = transaction.objectStore(MOMENTS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get moments'));
    request.onsuccess = () => resolve(request.result || []);
  });
}

export async function getMomentsByDateRange(startDate: string, endDate: string): Promise<Moment[]> {
  const moments = await getAllMoments();
  return moments.filter((m) => m.date >= startDate && m.date <= endDate);
}

export async function deleteMoment(id: string): Promise<void> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MOMENTS_STORE], 'readwrite');
    const store = transaction.objectStore(MOMENTS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(new Error('Failed to delete moment'));
    request.onsuccess = () => resolve();
  });
}

export async function clearAllMoments(): Promise<void> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([MOMENTS_STORE], 'readwrite');
    const store = transaction.objectStore(MOMENTS_STORE);
    const request = store.clear();

    request.onerror = () => reject(new Error('Failed to clear moments'));
    request.onsuccess = () => resolve();
  });
}

// Settings CRUD
export async function saveSettings(settings: AppSettings): Promise<void> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SETTINGS_STORE], 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.put({ id: 'app-settings', ...settings });

    request.onerror = () => reject(new Error('Failed to save settings'));
    request.onsuccess = () => resolve();
  });
}

export async function getSettings(): Promise<AppSettings> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([SETTINGS_STORE], 'readonly');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.get('app-settings');

    request.onerror = () => reject(new Error('Failed to get settings'));
    request.onsuccess = () => {
      if (request.result) {
        const { id, ...settings } = request.result;
        resolve(settings as AppSettings);
      } else {
        resolve(DEFAULT_APP_SETTINGS);
      }
    };
  });
}

// Insights CRUD
export async function saveInsight(insight: Omit<PatternInsight, 'id'>): Promise<void> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([INSIGHTS_STORE], 'readwrite');
    const store = transaction.objectStore(INSIGHTS_STORE);
    const request = store.add(insight);

    request.onerror = () => reject(new Error('Failed to save insight'));
    request.onsuccess = () => resolve();
  });
}

export async function getLatestInsight(type: 'daily' | 'weekly'): Promise<PatternInsight | undefined> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([INSIGHTS_STORE], 'readonly');
    const store = transaction.objectStore(INSIGHTS_STORE);
    const index = store.index('type');
    const request = index.openCursor(IDBKeyRange.only(type), 'prev');

    request.onerror = () => reject(new Error('Failed to get insight'));
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        resolve(cursor.value);
      } else {
        resolve(undefined);
      }
    };
  });
}

// Export data
export async function exportMomentsToCSV(): Promise<string> {
  const moments = await getAllMoments();

  if (moments.length === 0) {
    return 'No moments recorded yet.';
  }

  const headers = ['Date', 'Time', 'Duration', 'Target', 'Type', 'Status', 'Feeling'];
  const rows = moments.map((m) => [
    m.date,
    new Date(m.startTime).toLocaleTimeString(),
    m.duration.toString(),
    (m.plannedDuration || m.duration).toString(), // Fallback for old records
    m.type,
    m.completed ? 'Done' : 'Incomplete',
    m.mood || '-',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return csv;
}

export async function exportMomentsToPDF(): Promise<Blob> {
  const moments = await getAllMoments();

  // Generate simple HTML for PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Monk. Focus Journal</title>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 40px; color: #3d3630; background: #f0e8dc; }
        h1 { font-size: 24px; font-weight: 500; margin-bottom: 8px; }
        .subtitle { color: #777; margin-bottom: 32px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid #d4cec4; }
        th { color: #666; font-weight: 500; }
        .moment-clear { color: #8b6f47; }
        .moment-neutral { color: #999; }
        .moment-scattered { color: #b8956e; }
      </style>
    </head>
    <body>
      <h1>Monk.</h1>
      <p class="subtitle">Personal Focus Journal</p>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Target</th>
            <th>Duration</th>
            <th>Type</th>
            <th>Feeling</th>
          </tr>
        </thead>
        <tbody>
          ${moments.map((m) => `
            <tr>
              <td>${m.date}</td>
              <td>${new Date(m.startTime).toLocaleTimeString()}</td>
              <td>${m.plannedDuration || m.duration} min</td>
              <td>${m.duration} min</td>
              <td>${m.type}</td>
              <td class="moment-${m.mood || 'neutral'}">${m.mood || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  return new Blob([html], { type: 'text/html' });
}

// Clear all data
export async function clearAllData(): Promise<void> {
  const database = await initDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([MOMENTS_STORE, SETTINGS_STORE, INSIGHTS_STORE], 'readwrite');

    transaction.objectStore(MOMENTS_STORE).clear();
    transaction.objectStore(SETTINGS_STORE).clear();
    transaction.objectStore(INSIGHTS_STORE).clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Failed to clear data'));
  });
}

// Custom Audio CRUD


export async function saveCustomAudio(blob: Blob): Promise<void> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ASSETS_STORE], 'readwrite');
    const store = transaction.objectStore(ASSETS_STORE);
    const request = store.put(blob, 'custom-audio'); // Fixed key for single custom audio file

    request.onerror = () => reject(new Error('Failed to save custom audio'));
    request.onsuccess = () => resolve();
  });
}

export async function getCustomAudio(): Promise<Blob | undefined> {
  const database = await initDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([ASSETS_STORE], 'readonly');
    const store = transaction.objectStore(ASSETS_STORE);
    const request = store.get('custom-audio');

    request.onerror = () => reject(new Error('Failed to get custom audio'));
    request.onsuccess = () => resolve(request.result);
  });
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
