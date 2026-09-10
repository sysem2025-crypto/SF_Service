-- Aggiungi colonna status ai profili
alter table public.profiles add column if not exists status text default 'approved' check (status in ('pending', 'approved', 'rejected'));

-- Aggiorna la funzione trigger per mettere 'pending' ai nuovi utenti (tranne @sysem.it)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role, status)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'user',
    case when new.email like '%@sysem.it' then 'approved' else 'pending' end
  );
  return new;
end $$;
