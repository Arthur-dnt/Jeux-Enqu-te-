-- DOSSIER 9 — Schéma Supabase initial
-- À exécuter dans l'éditeur SQL de Supabase (ou via `supabase db push`).
-- Le jeu fonctionne intégralement sans ce schéma (mode 100 % local).

-- ============================================================================
-- profiles
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudo text not null default 'Enquêteur anonyme' check (char_length(pseudo) between 2 and 24),
  avatar text not null default '🕵️',
  xp integer not null default 0 check (xp >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_xp_idx on public.profiles (xp desc);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (true);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, pseudo)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'pseudo', 'Enquêteur anonyme'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- user_progress — progression par affaire (miroir de la sauvegarde locale)
-- ============================================================================
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id text not null,
  status text not null default 'active' check (status in ('active', 'solved')),
  discovered_evidence_ids text[] not null default '{}',
  hints_used integer not null default 0 check (hints_used >= 0),
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, case_id)
);

create index if not exists user_progress_user_idx on public.user_progress (user_id);

alter table public.user_progress enable row level security;

create policy "user_progress_select_own" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "user_progress_insert_own" on public.user_progress
  for insert with check (auth.uid() = user_id);

create policy "user_progress_update_own" on public.user_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_progress_delete_own" on public.user_progress
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- leaderboard_entries — scores soumis (soumission via RPC sécurisée)
-- ============================================================================
create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id text not null,
  kind text not null check (kind in ('daily', 'weekly', 'global')),
  period_key text,                       -- 'YYYY-MM-DD' (daily) ou 'YYYY-Sww' (weekly), null pour global
  pseudo text not null,
  avatar text not null default '🕵️',
  level integer not null default 1 check (level between 1 and 99),
  score integer not null check (score between 0 and 1000),
  elapsed_seconds integer not null check (elapsed_seconds >= 0),
  hints_used integer not null default 0 check (hints_used >= 0),
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_scope_idx
  on public.leaderboard_entries (kind, period_key, score desc, elapsed_seconds asc);

alter table public.leaderboard_entries enable row level security;

create policy "leaderboard_select_all" on public.leaderboard_entries
  for select using (true);

-- Insertion directe interdite aux clients : passer par submit_score()
create policy "leaderboard_no_direct_insert" on public.leaderboard_entries
  for insert with check (false);

-- Soumission côté serveur : bornes de validation ; pour une validation
-- cryptographique complète, brancher une Edge Function.
create or replace function public.submit_score(
  p_case_id text,
  p_kind text,
  p_period_key text,
  p_pseudo text,
  p_avatar text,
  p_level integer,
  p_score integer,
  p_elapsed_seconds integer,
  p_hints_used integer
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;
  if p_score < 0 or p_score > 1000 then
    raise exception 'Score invalide';
  end if;
  if p_elapsed_seconds < 0 or p_hints_used < 0 then
    raise exception 'Valeurs invalides';
  end if;
  if p_kind = 'daily' and p_period_key is null then
    raise exception 'period_key requise pour le classement quotidien';
  end if;
  insert into public.leaderboard_entries (
    user_id, case_id, kind, period_key, pseudo, avatar, level, score, elapsed_seconds, hints_used
  ) values (
    auth.uid(), p_case_id, p_kind, p_period_key, p_pseudo, p_avatar, p_level, p_score, p_elapsed_seconds, p_hints_used
  );
end;
$$;

-- ============================================================================
-- daily_challenges — définition (éventuellement surchargée) de l'enquête du jour
-- ============================================================================
create table if not exists public.daily_challenges (
  day_key text primary key,              -- 'YYYY-MM-DD'
  case_id text not null,
  created_at timestamptz not null default now()
);

alter table public.daily_challenges enable row level security;

create policy "daily_select_all" on public.daily_challenges
  for select using (true);

-- Écriture réservée au service_role (aucune policy d'insertion pour les clients).

-- ============================================================================
-- cloud_saves — sauvegardes cloud par affaire + pseudo-dossier '__notes__'
-- ============================================================================
create table if not exists public.cloud_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  unique (user_id, case_id)
);

create index if not exists cloud_saves_user_idx on public.cloud_saves (user_id);
create index if not exists cloud_saves_payload_idx on public.cloud_saves using gin (payload);

alter table public.cloud_saves enable row level security;

create policy "cloud_saves_select_own" on public.cloud_saves
  for select using (auth.uid() = user_id);

create policy "cloud_saves_insert_own" on public.cloud_saves
  for insert with check (auth.uid() = user_id);

create policy "cloud_saves_update_own" on public.cloud_saves
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cloud_saves_delete_own" on public.cloud_saves
  for delete using (auth.uid() = user_id);
