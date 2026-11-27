import { UploadedVoiceoverRecord } from '../types/optics';

const DB_NAME = 'OptikaLab3D_AudioDB';
const DB_VERSION = 1;
const STORE_AUDIO = 'voiceovers';
const STORE_SCRIPTS = 'custom_scripts';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB tidak tersedia di browser ini.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO, { keyPath: 'segmentId' });
      }
      if (!db.objectStoreNames.contains(STORE_SCRIPTS)) {
        db.createObjectStore(STORE_SCRIPTS, { keyPath: 'segmentId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVoiceoverFile(
  segmentId: string,
  file: File
): Promise<UploadedVoiceoverRecord> {
  const db = await openDB();
  const record: UploadedVoiceoverRecord = {
    segmentId,
    fileName: file.name,
    mimeType: file.type || 'audio/mpeg',
    sizeBytes: file.size,
    updatedAt: Date.now(),
    blob: file,
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite');
    tx.objectStore(STORE_AUDIO).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadAllVoiceovers(): Promise<
  Record<string, UploadedVoiceoverRecord>
> {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_AUDIO, 'readonly');
      const req = tx.objectStore(STORE_AUDIO).getAll();
      req.onsuccess = () => {
        const result: Record<string, UploadedVoiceoverRecord> = {};
        for (const item of req.result as UploadedVoiceoverRecord[]) {
          result[item.segmentId] = item;
        }
        resolve(result);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return {};
  }
}

export async function deleteVoiceoverFile(segmentId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite');
    tx.objectStore(STORE_AUDIO).delete(segmentId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveCustomScript(
  segmentId: string,
  scriptText: string
): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_SCRIPTS, 'readwrite');
      tx.objectStore(STORE_SCRIPTS).put({ segmentId, scriptText });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Non-fatal if IndexedDB blocked
  }
}

export async function loadAllCustomScripts(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SCRIPTS, 'readonly');
      const req = tx.objectStore(STORE_SCRIPTS).getAll();
      req.onsuccess = () => {
        const map: Record<string, string> = {};
        for (const row of req.result as Array<{
          segmentId: string;
          scriptText: string;
        }>) {
          map[row.segmentId] = row.scriptText;
        }
        resolve(map);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return {};
  }
}
