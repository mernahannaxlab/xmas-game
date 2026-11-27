-- ============================================================
-- Christmas Fatouta — Supabase schema (challenges only)
-- Project: Xmas's Project
-- Ref: rbpuznmsktzxpjjvvxxs
--
-- Run ALL of this in the Supabase SQL Editor, then reload the
-- schema cache if needed (Settings → API → Reload).
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists public.challenges (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text not null,
  instructions text not null,
  hints        text[] not null default '{}',
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists challenges_updated_at on public.challenges;
create trigger challenges_updated_at
  before update on public.challenges
  for each row execute function public.update_updated_at();

-- Privileges are REQUIRED in addition to RLS policies.
-- Without these, PostgREST returns: permission denied for table challenges (42501)
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table public.challenges to anon, authenticated, service_role;

alter table public.challenges enable row level security;

drop policy if exists "public_read_challenges" on public.challenges;
drop policy if exists "admin_insert_challenges" on public.challenges;
drop policy if exists "admin_update_challenges" on public.challenges;
drop policy if exists "admin_delete_challenges" on public.challenges;
drop policy if exists "admin_read_all_challenges" on public.challenges;

-- Players: only published rows
create policy "public_read_challenges"
  on public.challenges for select
  to anon, authenticated
  using (published = true);

-- Admin UI uses the same anon/publishable key today; allow full CRUD.
-- Prefer SUPABASE_SECRET_KEY (sb_secret_…) on the server for admin writes.
create policy "admin_insert_challenges"
  on public.challenges for insert
  to anon, authenticated
  with check (true);

create policy "admin_update_challenges"
  on public.challenges for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "admin_delete_challenges"
  on public.challenges for delete
  to anon, authenticated
  using (true);

create policy "admin_read_all_challenges"
  on public.challenges for select
  to anon, authenticated
  using (true);

notify pgrst, 'reload schema';
