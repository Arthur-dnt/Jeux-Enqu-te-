import { buildLocalLeaderboard, DEMO_LEADERBOARD_ENTRIES } from '@/features/leaderboard/leaderboardService';
import type { ScoreHistoryEntry } from '@/types/player';

function entry(partial: Partial<ScoreHistoryEntry>): ScoreHistoryEntry {
  return {
    id: partial.id ?? 's',
    caseId: partial.caseId ?? 'case001',
    caseNumber: partial.caseNumber ?? '001',
    caseTitle: partial.caseTitle ?? 'Le médaillon disparu',
    kind: partial.kind ?? 'standard',
    dayKey: partial.dayKey ?? null,
    score: partial.score ?? 0,
    breakdown: partial.breakdown ?? { culprit: 0, motive: 0, method: 0, evidence: 0, noHintBonus: 0, total: 0 },
    elapsedSeconds: partial.elapsedSeconds ?? 0,
    hintsUsed: partial.hintsUsed ?? 0,
    createdAt: partial.createdAt ?? '2025-01-01T00:00:00.000Z',
  };
}

const source = {
  pseudo: 'JoueurLocal',
  xp: 250,
  entries: [
    entry({ caseId: 'case001', score: 700, elapsedSeconds: 500, createdAt: '2025-01-01T10:00:00.000Z' }),
    entry({ caseId: 'case002', kind: 'daily', dayKey: '2025-01-02', score: 900, elapsedSeconds: 300, createdAt: '2025-01-02T10:00:00.000Z' }),
    entry({ caseId: 'case002', score: 900, elapsedSeconds: 260, createdAt: '2025-01-03T10:00:00.000Z' }),
    entry({ caseId: 'case003', score: 400, elapsedSeconds: 120, createdAt: '2025-01-03T11:00:00.000Z' }),
  ],
};

describe('classement local', () => {
  it('classe par score décroissant', () => {
    const { rows } = buildLocalLeaderboard('global', source, () => true);
    const scores = rows.map((r) => r.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    expect(rows[0].position).toBe(1);
    expect(rows[rows.length - 1].position).toBe(rows.length);
  });

  it('départage à score égal par temps plus court', () => {
    const { rows } = buildLocalLeaderboard('global', source, () => true);
    const best = rows.find((r) => r.isLocalPlayer && r.score === 900);
    expect(best?.elapsedSeconds).toBe(260);
  });

  it('ne conserve que le meilleur score du joueur par dossier', () => {
    const { rows } = buildLocalLeaderboard('global', source, () => true);
    const playerRows = rows.filter((r) => r.isLocalPlayer);
    const caseIds = playerRows.map((r) => r.score);
    expect(playerRows).toHaveLength(3);
    expect(caseIds).toContain(900);
    expect(caseIds).toContain(700);
    expect(caseIds).toContain(400);
  });

  it('filtre les entrées selon la portée (quotidien)', () => {
    const { rows } = buildLocalLeaderboard(
      'daily',
      source,
      (e) => e.kind === 'daily' && e.dayKey === '2025-01-02'
    );
    const playerRows = rows.filter((r) => r.isLocalPlayer);
    expect(playerRows).toHaveLength(1);
    expect(playerRows[0].score).toBe(900);
  });

  it('identifie explicitement le classement local comme démonstration', () => {
    const { isDemo } = buildLocalLeaderboard('global', source, () => true);
    expect(isDemo).toBe(true);
    expect(DEMO_LEADERBOARD_ENTRIES.length).toBeGreaterThan(0);
  });

  it('marque la ligne du joueur local', () => {
    const { rows } = buildLocalLeaderboard('global', source, () => true);
    expect(rows.some((r) => r.isLocalPlayer && r.pseudo === 'JoueurLocal')).toBe(true);
    expect(rows.every((r) => r.isLocalPlayer || !r.pseudo.includes('JoueurLocal'))).toBe(true);
  });

  it('retourne un tableau vide côté joueur si aucune entrée ne correspond', () => {
    const { rows } = buildLocalLeaderboard('daily', source, () => false);
    expect(rows.every((r) => !r.isLocalPlayer)).toBe(true);
  });
});
