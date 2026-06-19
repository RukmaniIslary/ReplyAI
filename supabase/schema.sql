-- Enable pgvector
create extension if not exists vector;

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  plan text not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text,
  conversations_used int not null default 0,
  conversations_limit int not null default 0,
  trial_used boolean not null default false,
  card_fingerprint text unique,
  signup_ip text,
  created_at timestamptz not null default now()
);

-- Agents table
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  system_prompt text not null default 'You are a helpful customer support agent.',
  welcome_message text not null default 'Hi! How can I help you today?',
  widget_color text not null default '#a3e635',
  escalation_email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Sources table
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  type text not null check (type in ('url', 'pdf')),
  url text,
  filename text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'ready', 'error')),
  chunk_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Chunks table (vector embeddings)
create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  source_id uuid references public.sources(id) on delete cascade not null,
  content text not null,
  embedding vector(768), -- 768 for Gemini text-embedding-004
  created_at timestamptz not null default now()
);

-- Conversations table
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  session_id text not null,
  page_url text,
  status text not null default 'open' check (status in ('open', 'resolved', 'escalated')),
  created_at timestamptz not null default now()
);

-- Messages table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index on public.chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on public.conversations (agent_id, created_at desc);
create index on public.messages (conversation_id, created_at asc);
create index on public.agents (user_id);
create index on public.sources (agent_id);

-- Vector similarity search function
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

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS policies
alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.sources enable row level security;
alter table public.chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Profiles: users can only read/update their own
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Agents: owned by user
create policy "agents_select_own" on public.agents for select using (auth.uid() = user_id);
create policy "agents_insert_own" on public.agents for insert with check (auth.uid() = user_id);
create policy "agents_update_own" on public.agents for update using (auth.uid() = user_id);
create policy "agents_delete_own" on public.agents for delete using (auth.uid() = user_id);

-- Sources: owned via agent
create policy "sources_select_own" on public.sources for select using (
  exists (select 1 from public.agents where agents.id = sources.agent_id and agents.user_id = auth.uid())
);
create policy "sources_insert_own" on public.sources for insert with check (
  exists (select 1 from public.agents where agents.id = sources.agent_id and agents.user_id = auth.uid())
);

-- Chunks: owned via agent (also allow anon read for widget)
create policy "chunks_select_own" on public.chunks for select using (true);
create policy "chunks_insert_own" on public.chunks for insert with check (
  exists (select 1 from public.agents where agents.id = chunks.agent_id and agents.user_id = auth.uid())
);

-- Conversations: allow anon insert (widget), owner select
create policy "conversations_insert_anon" on public.conversations for insert with check (true);
create policy "conversations_select_own" on public.conversations for select using (
  exists (select 1 from public.agents where agents.id = conversations.agent_id and agents.user_id = auth.uid())
);

-- Messages: allow anon insert (widget), owner select
create policy "messages_insert_anon" on public.messages for insert with check (true);
create policy "messages_select_own" on public.messages for select using (
  exists (
    select 1 from public.conversations
    join public.agents on agents.id = conversations.agent_id
    where conversations.id = messages.conversation_id
    and agents.user_id = auth.uid()
  )
);
