-- ============================================
-- RAYSEF — Complete Database Schema
-- Run this entire block in Supabase SQL Editor
-- ============================================

-- Enable pgvector extension
create extension if not exists vector;

-- ============================================
-- TABLES
-- ============================================

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  plan text not null default 'free',
  paddle_customer_id text unique,
  paddle_subscription_id text unique,
  subscription_status text,
  conversations_used int not null default 0,
  conversations_limit int not null default 0,
  trial_used boolean not null default false,
  signup_ip text,
  created_at timestamptz not null default now()
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  system_prompt text not null default 'You are a helpful customer support agent. Answer questions based on the provided knowledge base. If you cannot find the answer, politely say so and offer to escalate.',
  welcome_message text not null default 'Hi! How can I help you today?',
  widget_color text not null default '#a3e635',
  escalation_email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  type text not null check (type in ('url', 'pdf')),
  url text,
  filename text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'ready', 'error')),
  chunk_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.chunks (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  source_id uuid references public.sources(id) on delete cascade not null,
  content text not null,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  session_id text not null,
  page_url text,
  status text not null default 'open' check (status in ('open', 'resolved', 'escalated')),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index if not exists chunks_embedding_idx on public.chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists conversations_agent_idx on public.conversations (agent_id, created_at desc);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at asc);
create index if not exists agents_user_idx on public.agents (user_id);
create index if not exists sources_agent_idx on public.sources (agent_id);

-- ============================================
-- VECTOR SEARCH FUNCTION
-- ============================================

create or replace function match_chunks(
  query_embedding vector(768),
  match_agent_id uuid,
  match_count int default 5
) returns table (id uuid, content text, similarity float)
language sql stable as $$
  select id, content,
    1 - (embedding <=> query_embedding) as similarity
  from public.chunks
  where agent_id = match_agent_id
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.sources enable row level security;
alter table public.chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "agents_select_own" on public.agents;
drop policy if exists "agents_insert_own" on public.agents;
drop policy if exists "agents_update_own" on public.agents;
drop policy if exists "agents_delete_own" on public.agents;
drop policy if exists "sources_select_own" on public.sources;
drop policy if exists "sources_insert_own" on public.sources;
drop policy if exists "chunks_select_own" on public.chunks;
drop policy if exists "chunks_insert_own" on public.chunks;
drop policy if exists "conversations_insert_anon" on public.conversations;
drop policy if exists "conversations_select_own" on public.conversations;
drop policy if exists "messages_insert_anon" on public.messages;
drop policy if exists "messages_select_own" on public.messages;

-- Profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Agents
create policy "agents_select_own" on public.agents for select using (auth.uid() = user_id);
create policy "agents_insert_own" on public.agents for insert with check (auth.uid() = user_id);
create policy "agents_update_own" on public.agents for update using (auth.uid() = user_id);
create policy "agents_delete_own" on public.agents for delete using (auth.uid() = user_id);

-- Sources
create policy "sources_select_own" on public.sources for select using (
  exists (select 1 from public.agents where agents.id = sources.agent_id and agents.user_id = auth.uid())
);
create policy "sources_insert_own" on public.sources for insert with check (
  exists (select 1 from public.agents where agents.id = sources.agent_id and agents.user_id = auth.uid())
);
create policy "sources_delete_own" on public.sources for delete using (
  exists (select 1 from public.agents where agents.id = sources.agent_id and agents.user_id = auth.uid())
);

-- Chunks: public read (widget needs it), authenticated insert
create policy "chunks_select_all" on public.chunks for select using (true);
create policy "chunks_insert_own" on public.chunks for insert with check (
  exists (select 1 from public.agents where agents.id = chunks.agent_id and agents.user_id = auth.uid())
);
create policy "chunks_delete_own" on public.chunks for delete using (
  exists (select 1 from public.agents where agents.id = chunks.agent_id and agents.user_id = auth.uid())
);

-- Conversations: anyone can insert (widget), owner can read
create policy "conversations_insert_anon" on public.conversations for insert with check (true);
create policy "conversations_select_own" on public.conversations for select using (
  exists (select 1 from public.agents where agents.id = conversations.agent_id and agents.user_id = auth.uid())
);

-- Messages: anyone can insert (widget), owner can read
create policy "messages_insert_anon" on public.messages for insert with check (true);
create policy "messages_select_own" on public.messages for select using (
  exists (
    select 1 from public.conversations
    join public.agents on agents.id = conversations.agent_id
    where conversations.id = messages.conversation_id
    and agents.user_id = auth.uid()
  )
);

-- ============================================
-- BACKFILL: create profile for existing users
-- (run this if you already have users signed up)
-- ============================================
insert into public.profiles (id, email, full_name)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'full_name', '')
from auth.users au
where not exists (
  select 1 from public.profiles p where p.id = au.id
)
on conflict (id) do nothing;
