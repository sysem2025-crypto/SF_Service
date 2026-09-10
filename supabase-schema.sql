-- Esegui questo in Supabase SQL Editor

-- Tabella profili (estende auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS
alter table public.profiles enable row level security;

-- Policy: utenti vedono solo il proprio profilo
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: utenti aggiornano solo il proprio profilo
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger per creare profilo automaticamente alla registrazione
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'user'
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tabella ticket (esistente, da migrare)
create table if not exists public.tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  status text default 'aperto' check (status in ('aperto', 'in_lavorazione', 'chiuso', 'rifiutato')),
  priority text default 'media' check (priority in ('bassa', 'media', 'alta', 'critica')),
  category text,
  client text,
  channel text,
  product text,
  sla_deadline timestamp with time zone,
  serial_number text,
  plant text,
  contact_name text,
  contact_email text,
  tags text[],
  attachments text[],
  created_by_name text,
  created_by_email text,
  assignee text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  closed_at timestamp with time zone
);

alter table public.tickets enable row level security;

create policy "Users can view own tickets"
  on public.tickets for select
  using (auth.uid() = user_id);

create policy "Users can insert own tickets"
  on public.tickets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tickets"
  on public.tickets for update
  using (auth.uid() = user_id);

-- Admin vede tutto
create policy "Admin full access tickets"
  on public.tickets for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Tabella clienti
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  client text not null unique,
  country text,
  main_contact text,
  main_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.clients enable row level security;

create policy "Authenticated users can view clients"
  on public.clients for select
  using (auth.role() = 'authenticated');

create policy "Admin can manage clients"
  on public.clients for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Tabella procedure/knowledge base
create table if not exists public.procedures (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  category text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.procedures enable row level security;

create policy "Authenticated users can view procedures"
  on public.procedures for select
  using (auth.role() = 'authenticated');

create policy "Admin can manage procedures"
  on public.procedures for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Tabella firmware/software
create table if not exists public.firmware (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  version text,
  category text,
  download_url text,
  release_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.firmware enable row level security;

create policy "Authenticated users can view firmware"
  on public.firmware for select
  using (auth.role() = 'authenticated');

create policy "Admin can manage firmware"
  on public.firmware for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Indici
create index if not exists idx_tickets_user_id on public.tickets(user_id);
create index if not exists idx_tickets_status on public.tickets(status);
create index if not exists idx_procedures_category on public.procedures(category);
create index if not exists idx_firmware_category on public.firmware(category);