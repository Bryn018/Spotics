create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('spotify', 'lastfm', 'hybrid')),
  provider_user_id text not null,
  display_name text,
  username text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_user_id)
);

create table if not exists public.artist_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  range_key text not null check (range_key in ('7d', '30d', 'all')),
  artist_name text not null,
  plays integer not null default 0,
  genres text[] not null default '{}',
  image_url text,
  captured_at timestamptz not null default now()
);

create table if not exists public.track_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  range_key text not null check (range_key in ('7d', '30d', 'all')),
  track_name text not null,
  artist_names text[] not null default '{}',
  album_name text,
  plays integer not null default 0,
  duration_ms integer,
  external_url text,
  captured_at timestamptz not null default now()
);

create table if not exists public.album_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  range_key text not null check (range_key in ('7d', '30d', 'all')),
  album_name text not null,
  artist_names text[] not null default '{}',
  plays integer not null default 0,
  image_url text,
  external_url text,
  captured_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  source text not null check (source in ('spotify', 'lastfm')),
  event_type text not null,
  track_name text,
  artist_names text[] not null default '{}',
  album_name text,
  occurred_at timestamptz not null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_artist_snapshots_user_range on public.artist_snapshots(user_profile_id, range_key, captured_at desc);
create index if not exists idx_track_snapshots_user_range on public.track_snapshots(user_profile_id, range_key, captured_at desc);
create index if not exists idx_album_snapshots_user_range on public.album_snapshots(user_profile_id, range_key, captured_at desc);
create index if not exists idx_activity_events_user_occurred on public.activity_events(user_profile_id, occurred_at desc);

alter table public.user_profiles enable row level security;
alter table public.artist_snapshots enable row level security;
alter table public.track_snapshots enable row level security;
alter table public.album_snapshots enable row level security;
alter table public.activity_events enable row level security;

create policy if not exists "service-role-manages-user-profiles" on public.user_profiles
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service-role-manages-artist-snapshots" on public.artist_snapshots
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service-role-manages-track-snapshots" on public.track_snapshots
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service-role-manages-album-snapshots" on public.album_snapshots
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy if not exists "service-role-manages-activity-events" on public.activity_events
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
