-- ============================================================================
-- Kinsfolk Republic Trading Journal (v2) — optional cloud sync schema
-- Run ONCE in your Supabase project: SQL Editor > New query > paste > Run.
-- Safe to re-run.
--
-- This adds ONE table that mirrors the app's local journal (vision / journal /
-- playbook / wallet) as a single JSON blob per user, protected by Row-Level
-- Security so a user can only ever read or write their own data. The app stays
-- local-first; this is only used when a user opts in to "sign in to sync".
-- ============================================================================

create table if not exists public.journals (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.journals enable row level security;

drop policy if exists journals_select_own on public.journals;
drop policy if exists journals_insert_own on public.journals;
drop policy if exists journals_update_own on public.journals;
drop policy if exists journals_delete_own on public.journals;

create policy journals_select_own on public.journals for select using (auth.uid() = user_id);
create policy journals_insert_own on public.journals for insert with check (auth.uid() = user_id);
create policy journals_update_own on public.journals for update using (auth.uid() = user_id);
create policy journals_delete_own on public.journals for delete using (auth.uid() = user_id);

-- Optional: let a signed-in user delete their own auth account (cascades to journals).
create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
grant execute on function public.delete_current_user() to authenticated;
