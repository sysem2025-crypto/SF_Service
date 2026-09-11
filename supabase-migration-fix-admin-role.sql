-- Fix: recreate is_admin() for profiles policies
-- The function was dropped in fix-rls2 but profiles policies still reference it

-- 1. Recreate is_admin() as security definer (avoids infinite recursion on profiles)
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  result boolean;
begin
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) into result;
  return result;
end;
$$;

-- 2. Drop broken profiles policies and recreate them
drop policy if exists "Admin can view all profiles" on public.profiles;
drop policy if exists "Admin can update any profile" on public.profiles;

create policy "Admin can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admin can update any profile"
  on public.profiles for update
  using (public.is_admin());
