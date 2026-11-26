import type { ScoreHistoryEntry } from '@/types/player';

export interface LeaderboardRow {
  position: number;
  pseudo: string;
  avatar: string;
  level: number;
  score: number;
  isLocalPlayer: boolean;
  elapsedSeconds?: number;
}

export interface LocalLeaderboardSource {
  pseudo: string;
  xp: number;
  entries: ScoreHistoryEntry[];
}

export interface DemoEntry {
  pseudo: string;
  avatar: string;
  level: number;
  score: number;
  elapsedSeconds: number;
}

export const DEMO_LEADERBOARD_ENTRIES: DemoEntry[] = [
  { pseudo: 'Corda', avatar: '🕵️', level: 4, score: 940, elapsedSeconds: 312 },
  { pseudo: 'Nyx', avatar: '🦉', level: 3, score: 905, elapsedSeconds: 402 },
  { pseudo: 'Marlowe', avatar: '🎩', level: 3, score: 870, elapsedSeconds: 288 },
  { pseudo: 'Vesper', avatar: '🌙', level: 2, score: 820, elapsedSeconds: 517 },
  { pseudo: 'Kessler', avatar: '🧩', level: 2, score: 780, elapsedSeconds: 610 },
];

function toRow(
  pseudo: string,
  avatar: string,
  level: number,
  score: number,
  elapsedSeconds: number,
  isLocalPlayer: boolean
): Omit<LeaderboardRow, 'position'> {
  return { pseudo, avatar, level, score, isLocalPlayer, elapsedSeconds };
}

export function buildLocalLeaderboard(
  scope: 'daily' | 'weekly' | 'global',
  source: LocalLeaderboardSource,
  filter: (e: ScoreHistoryEntry) => boolean
): { rows: LeaderboardRow[]; isDemo: boolean } {
  const rows: Omit<LeaderboardRow, 'position'>[] = DEMO_LEADERBOARD_ENTRIES.filter((d) => {
    if (scope === 'daily') return d.score >= 800;
    if (scope === 'weekly') return d.score >= 750;
    return true;
  }).map((d) => toRow(d.pseudo, d.avatar, d.level, d.score, d.elapsedSeconds, false));

  const relevant = source.entries.filter(filter);
  const bestByCase = new Map<string, ScoreHistoryEntry>();
  for (const e of relevant) {
    const prev = bestByCase.get(e.caseId);
    if (!prev || e.score > prev.score || (e.score === prev.score && e.elapsedSeconds < prev.elapsedSeconds)) {
      bestByCase.set(e.caseId, e);
    }
  }
  const playerRows = [...bestByCase.values()].map((e) =>
    toRow(source.pseudo, '🧿', Math.max(1, Math.floor(source.xp / 100) + 1), e.score, e.elapsedSeconds, true)
  );

  const all = [...playerRows, ...rows].sort(
    (a, b) => b.score - a.score || (a.elapsedSeconds ?? 0) - (b.elapsedSeconds ?? 0)
  );
  return {
    rows: all.map((r, i) => ({ ...r, position: i + 1 })),
    isDemo: true,
  };
}
