import type { InvestigationSave, PersonalNote } from '@/types/save';
import { getSupabase, isSupabaseConfigured } from '@/services/supabase/client';
import { nowIso } from '@/utils/time';

export type SyncStatus = 'disabled' | 'offline' | 'synced' | 'error' | 'conflict';

export interface SyncResult {
  status: SyncStatus;
  message: string;
}

export type ConflictStrategy = 'newest_wins';

export const CONFLICT_STRATEGY: ConflictStrategy = 'newest_wins';

export function resolveConflict<T extends { updatedAt: string }>(local: T, remote: T): T {
  return new Date(remote.updatedAt) > new Date(local.updatedAt) ? remote : local;
}

export async function pushSave(userId: string, save: InvestigationSave): Promise<SyncResult> {
  const supabase = getSupabase();
  if (!isSupabaseConfigured || !supabase) {
    return { status: 'disabled', message: 'Synchronisation non configurée : mode local.' };
  }
  const { data, error } = await supabase
    .from('cloud_saves')
    .select('payload')
    .eq('user_id', userId)
    .eq('case_id', save.caseId)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message };
  if (data?.payload) {
    const remote = data.payload as InvestigationSave;
    if (CONFLICT_STRATEGY === 'newest_wins') {
      if (new Date(remote.updatedAt) > new Date(save.updatedAt)) {
        return { status: 'conflict', message: 'Sauvegarde distante plus récente conservée.' };
      }
    }
  }
  const { error: upsertError } = await supabase.from('cloud_saves').upsert({
    user_id: userId,
    case_id: save.caseId,
    payload: save,
    updated_at: nowIso(),
  });
  if (upsertError) return { status: 'error', message: upsertError.message };
  return { status: 'synced', message: 'Sauvegarde synchronisée.' };
}

export async function pullSave(userId: string, caseId: string): Promise<SyncResult & { save: InvestigationSave | null }> {
  const supabase = getSupabase();
  if (!isSupabaseConfigured || !supabase) {
    return { status: 'disabled', message: 'Synchronisation non configurée : mode local.', save: null };
  }
  const { data, error } = await supabase
    .from('cloud_saves')
    .select('payload')
    .eq('user_id', userId)
    .eq('case_id', caseId)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message, save: null };
  return { status: 'synced', message: 'Sauvegarde distante récupérée.', save: (data?.payload as InvestigationSave) ?? null };
}

export async function pushNotes(userId: string, notes: PersonalNote[]): Promise<SyncResult> {
  const supabase = getSupabase();
  if (!isSupabaseConfigured || !supabase) {
    return { status: 'disabled', message: 'Synchronisation non configurée : mode local.' };
  }
  const { error } = await supabase.from('cloud_saves').upsert({
    user_id: userId,
    case_id: '__notes__',
    payload: notes,
    updated_at: nowIso(),
  });
  if (error) return { status: 'error', message: error.message };
  return { status: 'synced', message: 'Notes synchronisées.' };
}

export async function signIn(email: string, password: string): Promise<SyncResult> {
  const supabase = getSupabase();
  if (!isSupabaseConfigured || !supabase) {
    return { status: 'disabled', message: 'Supabase non configuré.' };
  }
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: 'error', message: error.message };
  return { status: 'synced', message: 'Connecté.' };
}

export async function signUp(email: string, password: string): Promise<SyncResult> {
  const supabase = getSupabase();
  if (!isSupabaseConfigured || !supabase) {
    return { status: 'disabled', message: 'Supabase non configuré.' };
  }
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { status: 'error', message: error.message };
  return { status: 'synced', message: 'Compte créé. Vérifiez vos e-mails si une confirmation est requise.' };
}
