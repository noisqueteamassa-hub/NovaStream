import * as SQLite from 'expo-sqlite';

let databasePromise;

async function database() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('novastream.db');
    const db = await databasePromise;
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS downloads (
        track_id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        encrypted_path TEXT NOT NULL,
        format TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS favorites (
        track_id TEXT PRIMARY KEY NOT NULL,
        track_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }
  return databasePromise;
}

export async function listDownloads() {
  const db = await database();
  return db.getAllAsync('SELECT * FROM downloads ORDER BY created_at DESC');
}

export async function saveDownloadRecord(track, encryptedPath, format) {
  const db = await database();
  await db.runAsync(
    'INSERT OR REPLACE INTO downloads (track_id, title, artist, encrypted_path, format, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    String(track.id), track.title, track.artist || '', encryptedPath, format, new Date().toISOString()
  );
}

export async function removeDownloadRecord(trackId) {
  const db = await database();
  await db.runAsync('DELETE FROM downloads WHERE track_id = ?', String(trackId));
}
