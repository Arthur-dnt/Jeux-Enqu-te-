import type { PlayerProfile } from '@/types/player';
import { openDb } from '../db';

interface Row {
  id: string;
  pseudo: string;
  xp: number;
  created_at: string;
  updated_at: string;
}

function toProfile(r: Row): PlayerProfile {
  return { id: r.id, pseudo: r.pseudo, xp: r.xp, createdAt: r.created_at, updatedAt: r.updated_at };
}

export async function loadProfile(): Promise<PlayerProfile | null> {
  const row = await openDb().getFirstAsync<Row>('SELECT * FROM player_profile LIMIT 1');
  return row ? toProfile(row) : null;
}

export async function upsertProfile(p: PlayerProfile): Promise<void> {
  await openDb().runAsync(
    `INSERT INTO player_profile (id, pseudo, xp, created_at, updated_at) VALUES (?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET pseudo = excluded.pseudo, xp = excluded.xp, updated_at = excluded.updated_at`,
    [p.id, p.pseudo, p.xp, p.createdAt, p.updatedAt]
  );
}
