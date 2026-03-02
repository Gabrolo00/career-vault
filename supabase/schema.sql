-- ============================================================
-- CareerVault — Supabase Database Schema
-- ============================================================

-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  headline text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- experiences
-- ============================================================
create type public.experience_type as enum (
  'work',
  'education',
  'project',
  'certification',
  'volunteer'
);

create table public.experiences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type public.experience_type not null default 'work',
  title text not null,
  organization text,
  location text,
  start_date date,
  end_date date,
  is_current boolean default false,
  description text,
  tags text[] default '{}',
  skills text[] default '{}',
  metadata jsonb default '{}',
  embedding vector(1536),  -- OpenAI ada-002 embeddings
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.experiences enable row level security;

create policy "Users can view own experiences"
  on public.experiences for select
  using (auth.uid() = user_id);

create policy "Users can insert own experiences"
  on public.experiences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own experiences"
  on public.experiences for update
  using (auth.uid() = user_id);

create policy "Users can delete own experiences"
  on public.experiences for delete
  using (auth.uid() = user_id);

-- Index for fast user lookups
create index experiences_user_id_idx on public.experiences(user_id);
create index experiences_type_idx on public.experiences(type);

-- ============================================================
-- generated_documents
-- ============================================================
create type public.document_type as enum ('cv', 'cover_letter');
create type public.document_status as enum ('pending', 'processing', 'completed', 'failed');

create table public.generated_documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  doc_type public.document_type not null,
  jd_text text not null,
  jd_snippet text generated always as (left(jd_text, 200)) stored,
  webhook_request_id text,
  pdf_url text,
  status public.document_status default 'pending',
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.generated_documents enable row level security;

create policy "Users can view own documents"
  on public.generated_documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.generated_documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.generated_documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.generated_documents for delete
  using (auth.uid() = user_id);

create index generated_documents_user_id_idx on public.generated_documents(user_id);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_experiences
  before update on public.experiences
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_generated_documents
  before update on public.generated_documents
  for each row execute procedure public.set_updated_at();
