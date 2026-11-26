import type { ScoreBreakdown, ScoreHistoryEntry } from '@/types/player';
import { openDb } from '../db';

interface Row {
  id: string;
  case_id: string;
  case_number: string;
  case_title: string;
  kind: string;
  day_key: string | null;
  score: number;
  breakdown: string;
  elapsed_seconds: number;
  hints_used: number;
  created_at: string;
}

function toEntry(r: Row): ScoreHistoryEntry {
  return {
    id: r.id,
    caseId: r.case_id,
    caseNumber: r.case_number,
    caseTitle: r.case_title,
    kind: r.kind as ScoreHistoryEntry['kind'],
    dayKey: r.day_key,
    score: r.score,
    breakdown: JSON.parse(r.breakdown) as ScoreBreakdown,
    elapsedSeconds: r.elapsed_seconds,
    hintsUsed: r.hints_used,
    createdAt: r.created_at,
  };
}

export async function addScoreEntry(e: ScoreHistoryEntry): Promise<void> {
  await openDb().runAsync(
    `INSERT INTO score_history (id, case_id, case_number, case_title, kind, day_key, score, breakdown, elapsed_seconds, hints_used, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [e.id, e.caseId, e.caseNumber, e.caseTitle, e.kind, e.dayKey, e.score, JSON.stringify(e.breakdown), e.elapsedSeconds, e.hintsUsed, e.createdAt]
  );
}

export async function listScoreEntries(): Promise<ScoreHistoryEntry[]> {
  const rows = await openDb().getAllAsync<Row>('SELECT * FROM score_history ORDER BY created_at DESC');
  return rows.map(toEntry);
}

export async function listScoresForCase(caseId: string): Promise<ScoreHistoryEntry[]> {
  const rows = await openDb().getAllAsync<Row>('SELECT * FROM score_history WHERE case_id = ? ORDER BY created_at DESC', [caseId]);
  return rows.map(toEntry);
}
