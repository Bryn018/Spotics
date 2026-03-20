-- Wrap reports cache for daily/weekly/yearly experiences
create type if not exists public.wrap_timeframe as enum ('daily', 'weekly', 'yearly');

create table if not exists public.wrap_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  timeframe public.wrap_timeframe not null,
  period_start date not null,
  period_end date not null,
  payload jsonb not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, timeframe)
);

create trigger wrap_reports_updated_at
  before update on public.wrap_reports
  for each row execute procedure public.trigger_set_timestamp();

alter table public.wrap_reports enable row level security;

create policy "Users can view their wrap reports" on public.wrap_reports
  for select using (auth.uid() = user_id);
