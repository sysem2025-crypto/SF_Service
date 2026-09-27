-- Fix infinite recursion in profiles RLS policies
-- Esegui questo in Supabase SQL Editor

-- 1. Crea funzione is_admin() con security definer (bypassa RLS)
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_admin boolean;
begin
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) into is_admin;
  return is_admin;
end;
$$;

-- 2. Drop vecchie policy admin su profiles (quelle che causano ricorsione)
drop policy if exists "Admin can update any profile" on public.profiles;
drop policy if exists "Admin can view all profiles" on public.profiles;

-- 3. Ricrea policy admin su profiles usando is_admin()
create policy "Admin can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admin can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- 4. Aggiorna policy admin su tickets (usa is_admin() invece di self-query)
drop policy if exists "Admin full access tickets" on public.tickets;
create policy "Admin full access tickets"
  on public.tickets for all
  using (public.is_admin());

-- 5. Aggiorna policy admin su clients
drop policy if exists "Admin can manage clients" on public.clients;
create policy "Admin can manage clients"
  on public.clients for all
  using (public.is_admin());

-- 6. Aggiorna policy admin su procedures
drop policy if exists "Admin can manage procedures" on public.procedures;
create policy "Admin can manage procedures"
  on public.procedures for all
  using (public.is_admin());

-- 7. Aggiorna policy admin su firmware
drop policy if exists "Admin can manage firmware" on public.firmware;
create policy "Admin can manage firmware"
  on public.firmware for all
  using (public.is_admin());
