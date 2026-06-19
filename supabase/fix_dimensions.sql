-- Run this in Supabase SQL Editor to update embedding dimensions from 768 to 3072
-- gemini-embedding-001 outputs 3072 dimensions by default

-- Drop the old index first
drop index if exists chunks_embedding_idx;

-- Alter the column type (only works if table is empty or you recreate)
-- If you have existing chunks, drop and recreate the table:
truncate table public.chunks;

alter table public.chunks
  alter column embedding type vector(3072);

-- Recreate the index
create index chunks_embedding_idx on public.chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Update the match_chunks function
create or replace function match_chunks(
  query_embedding vector(3072),
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
