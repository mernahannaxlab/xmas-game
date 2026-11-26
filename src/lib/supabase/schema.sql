-- ============================================================
-- Christmas Fatouta — Supabase schema (challenges only)
-- Run in the Supabase SQL editor.
-- ============================================================

create extension if not exists "uuid-ossp";

create table if not exists challenges (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text not null,
  instructions text not null,
  hints        text[] not null default '{}',
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists challenges_updated_at on challenges;
create trigger challenges_updated_at
  before update on challenges
  for each row execute function update_updated_at();

alter table challenges enable row level security;

drop policy if exists "public_read_challenges" on challenges;
drop policy if exists "admin_insert_challenges" on challenges;
drop policy if exists "admin_update_challenges" on challenges;
drop policy if exists "admin_delete_challenges" on challenges;
drop policy if exists "admin_read_all_challenges" on challenges;

create policy "public_read_challenges"
  on challenges for select using (published = true);

create policy "admin_insert_challenges"
  on challenges for insert with check (true);

create policy "admin_update_challenges"
  on challenges for update using (true) with check (true);

create policy "admin_delete_challenges"
  on challenges for delete using (true);

create policy "admin_read_all_challenges"
  on challenges for select using (true);
