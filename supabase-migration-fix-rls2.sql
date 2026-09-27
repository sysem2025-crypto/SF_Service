-- Fix: drop is_admin() function and use inline subqueries for non-profiles tables
-- The security definer function was causing 500 errors on tickets/clients/etc.

-- 1. Drop admin policies that use is_admin()
drop policy if exists "Admin full access tickets" on public.tickets;
drop policy if exists "Admin can manage clients" on public.clients;
drop policy if exists "Admin can manage procedures" on public.procedures;
drop policy if exists "Admin can manage firmware" on public.firmware;

-- 2. Recreate with inline subquery (no security definer needed for non-profiles tables)
create policy "Admin full access tickets"
  on public.tickets for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin can manage clients"
  on public.clients for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin can manage procedures"
  on public.procedures for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin can manage firmware"
  on public.firmware for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 3. Drop is_admin() function (no longer needed)
drop function if exists public.is_admin();
