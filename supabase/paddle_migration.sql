-- Run this in Supabase SQL Editor to add Paddle columns
-- (replaces Stripe columns)

alter table public.profiles
  add column if not exists paddle_customer_id text unique,
  add column if not exists paddle_subscription_id text unique;

-- Optional: drop old Stripe columns if you had them
-- alter table public.profiles drop column if exists stripe_customer_id;
-- alter table public.profiles drop column if exists stripe_subscription_id;
