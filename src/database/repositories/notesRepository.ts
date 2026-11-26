import type { PersonalNote } from '@/types/save';
import { openDb } from '../db';

interface Row {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

function toNote(r: Row): PersonalNote {
  return { id: r.id, title: r.title, body: r.body, createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function listNotes(): Promise<PersonalNote[]> {
  const rows = await openDb().getAllAsync<Row>('SELECT * FROM player_notes ORDER BY updated_at DESC');
  return rows.map(toNote);
}

export async function upsertNote(n: PersonalNote): Promise<void> {
  await openDb().runAsync(
    `INSERT INTO player_notes (id, title, body, created_at, updated_at) VALUES (?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title = excluded.title, body = excluded.body, updated_at = excluded.updated_at`,
    [n.id, n.title, n.body, n.createdAt, n.updatedAt]
  );
}

export async function deleteNote(id: string): Promise<void> {
  await openDb().runAsync('DELETE FROM player_notes WHERE id = ?', [id]);
}
