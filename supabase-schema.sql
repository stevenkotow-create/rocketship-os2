-- RocketShip OS · Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- It creates the tables, security rules, and the trigger that gives every new
-- account a profile row automatically.

-- 1. Tables ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  is_admin boolean not null default false,
  updated_at timestamptz default now()
);

create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.user_state enable row level security;

-- 2. Admin helper (runs as owner, so it can read profiles without recursion) --
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 3. Row Level Security ------------------------------------------------------
-- profiles: you can read your own row; admins can read everyone's.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert
  with check (id = auth.uid());

-- user_state: you can read/write your own row; admins can read/write anyone's.
drop policy if exists "user_state_select" on public.user_state;
create policy "user_state_select" on public.user_state for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_state_insert" on public.user_state;
create policy "user_state_insert" on public.user_state for insert
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_state_update" on public.user_state;
create policy "user_state_update" on public.user_state for update
  using (user_id = auth.uid() or public.is_admin());

-- 4. Auto-create a profile row on signup -------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. After you sign in once, make yourself the admin -------------------------
-- Replace the email below with your own, then run just this line:
-- update public.profiles set is_admin = true where email = 'you@email.com';
