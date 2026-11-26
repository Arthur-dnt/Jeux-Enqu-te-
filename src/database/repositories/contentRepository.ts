import type { CaseDef } from '@/types/case';
import { openDb } from '../db';

export async function seedCaseContent(c: CaseDef): Promise<void> {
  const db = openDb();
  const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM cases WHERE id = ?', [c.id]);
  if (existing) return;
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO cases (id, number, title, difficulty, type, estimated_minutes, summary, location_name, scene_count, suspect_count) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [c.id, c.number, c.title, c.difficulty, c.type, c.estimatedMinutes, c.summary, c.locationName, c.scenes.length, c.suspects.length]
    );
    for (let i = 0; i < c.scenes.length; i++) {
      const s = c.scenes[i];
      await db.runAsync('INSERT INTO case_scenes (id, case_id, name, position) VALUES (?,?,?,?)', [s.id, c.id, s.name, i]);
    }
    for (const e of c.evidence) {
      await db.runAsync('INSERT INTO evidence (id, case_id, scene_id, name, category) VALUES (?,?,?,?,?)', [e.id, c.id, e.sceneId, e.name, e.category]);
    }
    for (const s of c.suspects) {
      await db.runAsync('INSERT INTO suspects (id, case_id, name, occupation) VALUES (?,?,?,?)', [s.id, c.id, s.name, s.occupation]);
    }
  });
}
