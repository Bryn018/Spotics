-- Create extension for UUIDs
create extension if not exists "uuid-ossp";

-- Helper function for updated_at columns
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Users table stores Spotics accounts (mapped to Supabase auth user_id or Spotify id)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  avatar_url text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.trigger_set_timestamp();

-- Spotify profile + tokens per user
create table if not exists public.spotify_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  spotify_user_id text not null unique,
  access_token text not null,
  refresh_token text not null,
  scope text[],
  token_expires_at timestamptz not null,
  product text,
  followers integer,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger spotify_profiles_updated_at
  before update on public.spotify_profiles
  for each row execute procedure public.trigger_set_timestamp();

-- Cached listening summaries (per timeframe)
create type public.time_range as enum ('short_term', 'medium_term', 'long_term');

create table if not exists public.listening_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  timeframe public.time_range not null,
  total_minutes integer,
  total_tracks integer,
  total_artists integer,
  payload jsonb,
  fetched_at timestamptz not null default now(),
  unique(user_id, timeframe)
);

-- Recent activity log
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  activity_type text not null,
  title text not null,
  subtitle text,
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_spotify_profiles_user_id on public.spotify_profiles(user_id);
create index if not exists idx_listening_summaries_user_timeframe on public.listening_summaries(user_id, timeframe);
create index if not exists idx_activities_user_occurred_at on public.activities(user_id, occurred_at desc);

-- Row Level Security
alter table public.users enable row level security;
alter table public.spotify_profiles enable row level security;
alter table public.listening_summaries enable row level security;
alter table public.activities enable row level security;

create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can view their summaries" on public.listening_summaries
  for select using (auth.uid() = user_id);
create policy "Users can view their activities" on public.activities
  for select using (auth.uid() = user_id);
