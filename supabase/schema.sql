-- ─────────────────────────────────────────────────────────────
-- GrowthPilot AI — Supabase schema
--
-- Optional. The app runs entirely on client-side storage without a
-- database. Apply this (SQL editor or `supabase db push`) only when
-- you want cloud persistence + auth. RLS scopes every row to its
-- owner via Supabase Auth (auth.uid()).
-- ─────────────────────────────────────────────────────────────

-- Users are managed by Supabase Auth (auth.users). This mirror table
-- holds profile fields the app cares about.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  prompt text,
  goal text,
  budget bigint,
  city text,
  audience text,
  plan jsonb not null,               -- full CampaignPlan
  created_at timestamptz not null default now()
);

create table if not exists public.creatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,
  type text not null,                -- poster | banner | screenshot | video
  name text,
  url text,                          -- Supabase Storage path
  analysis jsonb,                    -- CreativeAnalysis
  created_at timestamptz not null default now()
);

create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  prompt text,
  response text,
  created_at timestamptz not null default now()
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete cascade,
  type text not null,                -- pdf | pptx | md | zip
  download_url text,
  created_at timestamptz not null default now()
);

-- Indexes for the common "my recent items" queries.
create index if not exists campaigns_user_created_idx on public.campaigns (user_id, created_at desc);
create index if not exists creatives_user_created_idx on public.creatives (user_id, created_at desc);
create index if not exists history_user_created_idx on public.history (user_id, created_at desc);

-- Row Level Security: each user sees only their own rows.
alter table public.profiles  enable row level security;
alter table public.campaigns enable row level security;
alter table public.creatives enable row level security;
alter table public.history   enable row level security;
alter table public.exports   enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['profiles','campaigns','creatives','history','exports'] loop
    execute format(
      'drop policy if exists "own rows" on public.%I;', t
    );
    if t = 'profiles' then
      execute 'create policy "own rows" on public.profiles
        using (auth.uid() = id) with check (auth.uid() = id);';
    else
      execute format(
        'create policy "own rows" on public.%I
           using (auth.uid() = user_id) with check (auth.uid() = user_id);', t
      );
    end if;
  end loop;
end $$;

-- Storage bucket for uploaded creatives.
insert into storage.buckets (id, name, public)
values ('creatives', 'creatives', true)
on conflict (id) do nothing;
