import { getSupabase, isSupabaseConfigured } from '@/services/supabase/client';
import type { LeaderboardRow } from './leaderboardService';

export interface OnlineLeaderboardResult {
  available: boolean;
  message: string;
  rows: LeaderboardRow[];
}

export async function fetchOnlineLeaderboard(scope: 'daily' | 'weekly' | 'global', periodKey: string | null): Promise<OnlineLeaderboardResult> {
  const supabase = getSupabase();
  if (!isSupabaseConfigured || !supabase) {
    return { available: false, message: 'Classement en ligne indisponible : Supabase non configuré.', rows: [] };
  }
  let query = supabase
    .from('leaderboard_entries')
    .select('pseudo, avatar, level, score, elapsed_seconds')
    .order('score', { ascending: false })
    .order('elapsed_seconds', { ascending: true })
    .limit(50);
  if (periodKey) query = query.eq('period_key', periodKey);
  const { data, error } = await query;
  if (error) {
    return { available: false, message: 'Classement en ligne temporairement indisponible.', rows: [] };
  }
  const rows: LeaderboardRow[] = (data ?? []).map((r, i) => ({
    position: i + 1,
    pseudo: String(r.pseudo ?? '—'),
    avatar: String(r.avatar ?? '🧿'),
    level: Number(r.level ?? 1),
    score: Number(r.score ?? 0),
    isLocalPlayer: false,
    elapsedSeconds: r.elapsed_seconds === null ? undefined : Number(r.elapsed_seconds),
  }));
  return { available: true, message: 'Classement en ligne.', rows };
}

export async function submitScoreToLeaderboard(params: {
  userId: string;
  pseudo: string;
  avatar: string;
  level: number;
  score: number;
  elapsedSeconds: number;
  periodKey: string | null;
  caseId: string;
  kind: 'daily' | 'weekly' | 'global';
}): Promise<{ available: boolean; message: string }> {
  const supabase = getSupabase();
  if (!isSupabaseConfigured || !supabase) {
    return { available: false, message: 'Envoi impossible : classement en ligne non configuré.' };
  }
  const { error } = await supabase.rpc('submit_score', {
    p_case_id: params.caseId,
    p_kind: params.kind,
    p_period_key: params.periodKey,
    p_pseudo: params.pseudo,
    p_avatar: params.avatar,
    p_level: params.level,
    p_score: params.score,
    p_elapsed_seconds: params.elapsedSeconds,
    p_hints_used: 0,
  });
  if (error) return { available: false, message: 'Envoi impossible : ' + error.message };
  return { available: true, message: 'Score transmis au classement en ligne.' };
}
