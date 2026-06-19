-- Run this in Supabase SQL Editor
-- Atomic conversation counter increment (prevents race conditions)
create or replace function increment_conversations(user_id uuid)
returns void language sql as $$
  update public.profiles
  set conversations_used = conversations_used + 1
  where id = user_id;
$$;
