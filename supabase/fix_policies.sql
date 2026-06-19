-- Run this in Supabase SQL Editor to fix policy conflicts
-- Safe to run multiple times

-- Drop ALL existing policies
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "agents_select_own" on public.agents;
drop policy if exists "agents_insert_own" on public.agents;
drop policy if exists "agents_update_own" on public.agents;
drop policy if exists "agents_delete_own" on public.agents;
drop policy if exists "sources_select_own" on public.sources;
drop policy if exists "sources_insert_own" on public.sources;
drop policy if exists "sources_delete_own" on public.sources;
drop policy if exists "chunks_select_own" on public.chunks;
drop policy if exists "chunks_select_all" on public.chunks;
drop policy if exists "chunks_insert_own" on public.chunks;
drop policy if exists "chunks_delete_own" on public.chunks;
drop policy if exists "conversations_insert_anon" on public.conversations;
drop policy if exists "conversations_select_own" on public.conversations;
drop policy if exists "messages_insert_anon" on public.messages;
drop policy if exists "messages_select_own" on public.messages;

-- Recreate all policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "agents_select_own" on public.agents for select using (auth.uid() = user_id);
create policy "agents_insert_own" on public.agents for insert with check (auth.uid() = user_id);
create policy "agents_update_own" on public.agents for update using (auth.uid() = user_id);
create policy "agents_delete_own" on public.agents for delete using (auth.uid() = user_id);

create policy "sources_select_own" on public.sources for select using (
  exists (select 1 from public.agents where agents.id = sources.agent_id and agents.user_id = auth.uid())
);
create policy "sources_insert_own" on public.sources for insert with check (
  exists (select 1 from public.agents where agents.id = sources.agent_id and agents.user_id = auth.uid())
);
create policy "sources_delete_own" on public.sources for delete using (
  exists (select 1 from public.agents where agents.id = sources.agent_id and agents.user_id = auth.uid())
);

create policy "chunks_select_all" on public.chunks for select using (true);
create policy "chunks_insert_own" on public.chunks for insert with check (
  exists (select 1 from public.agents where agents.id = chunks.agent_id and agents.user_id = auth.uid())
);
create policy "chunks_delete_own" on public.chunks for delete using (
  exists (select 1 from public.agents where agents.id = chunks.agent_id and agents.user_id = auth.uid())
);

create policy "conversations_insert_anon" on public.conversations for insert with check (true);
create policy "conversations_select_own" on public.conversations for select using (
  exists (select 1 from public.agents where agents.id = conversations.agent_id and agents.user_id = auth.uid())
);

create policy "messages_insert_anon" on public.messages for insert with check (true);
create policy "messages_select_own" on public.messages for select using (
  exists (
    select 1 from public.conversations
    join public.agents on agents.id = conversations.agent_id
    where conversations.id = messages.conversation_id
    and agents.user_id = auth.uid()
  )
);

-- Backfill existing users into profiles
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
