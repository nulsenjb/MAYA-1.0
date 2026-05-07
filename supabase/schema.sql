create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists intake_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  age_range text,
  complexion_depth text,
  undertone text,
  overtone text,
  contrast_level text,
  eye_color text,
  hair_color text,
  goals jsonb default '[]'::jsonb,
  frustrations jsonb default '[]'::jsonb,
  preferred_finish text,
  preferred_style jsonb default '[]'::jsonb,
  jewelry_preference text,
  wardrobe_colors text,
  notes text,
  ai_summary text,
  makeup_experience text,
  makeup_issues text[],
  goal_notes text,
  products_list text,
  struggle_categories text[],
  desired_feeling text[],
  target_situations text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- For existing databases, run the following ALTER TABLE statements
-- in the Supabase SQL editor to add the new columns:
--
-- alter table intake_profiles add column if not exists ai_summary text;
-- alter table intake_profiles add column if not exists makeup_experience text;
-- alter table intake_profiles add column if not exists makeup_issues text[];
-- alter table intake_profiles add column if not exists goal_notes text;
-- alter table intake_profiles add column if not exists products_list text;
-- alter table intake_profiles add column if not exists struggle_categories text[];
-- alter table intake_profiles add column if not exists desired_feeling text[];
-- alter table intake_profiles add column if not exists target_situations text;

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  brand text,
  product text not null,
  shade text,
  finish text,
  notes text,
  favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists dossiers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default 'My Beauty Dossier',
  archetype text,
  content jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists refinement_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_date date,
  title text,
  note text,
  outcome text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
alter table intake_profiles enable row level security;
alter table inventory_items enable row level security;
alter table dossiers enable row level security;
alter table refinement_notes enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "intake_all_own" on intake_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "inventory_all_own" on inventory_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dossiers_all_own" on dossiers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_all_own" on refinement_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);