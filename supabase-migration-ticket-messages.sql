-- ============================================================
-- TABELLA ticket_messages
-- Storico messaggi per la risoluzione dei ticket
-- ============================================================

create table if not exists public.ticket_messages (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  sender_name text not null,
  sender_email text not null,
  sender_role text default 'user' check (sender_role in ('user', 'admin', 'agent')),
  content text not null,
  content_type text default 'text' check (content_type in ('text', 'markdown', 'image', 'file', 'system')),
  attachments text[] default '{}',
  internal boolean default false,
  read_by_sender boolean default true,
  read_by_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indici
create index if not exists idx_ticket_messages_ticket_id on public.ticket_messages(ticket_id);
create index if not exists idx_ticket_messages_created_at on public.ticket_messages(ticket_id, created_at);
create index if not exists idx_ticket_messages_sender_id on public.ticket_messages(sender_id);
create index if not exists idx_ticket_messages_internal on public.ticket_messages(internal) where internal = true;

-- RLS: abilitato
alter table public.ticket_messages enable row level security;

-- Policy: Visualizzare messaggi del proprio ticket
create policy "Users can view messages of own tickets"
  on public.ticket_messages for select
  using (
    ticket_id in (
      select id from public.tickets
      where created_by_email = auth.email()
       or id in (
        select id from public.tickets
        where assignee = (select email from auth.users where id = auth.uid())
       )
    )
    or exists (
      select 1 from public.tickets t
      where t.id = ticket_id
      and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );

-- Policy: Inserire messaggi nel proprio ticket
create policy "Users can insert messages in own tickets"
  on public.ticket_messages for insert
  with check (
    sender_id = auth.uid()
    and ticket_id in (
      select id from public.tickets
      where created_by_email = auth.email()
       or assignee = (select email from auth.users where id = auth.uid())
    )
  );

-- Policy: Aggiornare solo i propri messaggi
create policy "Users can update own messages"
  on public.ticket_messages for update
  using (sender_id = auth.uid());

-- Policy: Admin full access
create policy "Admin full access ticket messages"
  on public.ticket_messages for all
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Funzione helper: conteggio messaggi per ticket
create or replace function public.get_ticket_message_count(p_ticket_id uuid)
returns bigint
language sql
security definer
as $$
  select count(*)::bigint from public.ticket_messages where ticket_id = p_ticket_id;
$$;

-- Funzione helper: ultimo messaggio per ticket
create or replace function public.get_ticket_last_message(p_ticket_id uuid)
returns public.ticket_messages
language sql
security definer
as $$
  select * from public.ticket_messages
  where ticket_id = p_ticket_id
  order by created_at desc
  limit 1;
$$;

-- Trigger: aggiorna updated_at
create or replace function public.handle_ticket_messages_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists ticket_messages_updated on public.ticket_messages;
create trigger ticket_messages_updated
  before update on public.ticket_messages
  for each row
  execute function public.handle_ticket_messages_updated();

-- Commenti
comment on table public.ticket_messages is 'Storico messaggi della risoluzione ticket';
comment on column public.ticket_messages.sender_role is 'Ruolo del mittente: user, admin o agent';
comment on column public.ticket_messages.content_type is 'Tipo di contenuto: text, markdown, image, file, system';
comment on column public.ticket_messages.internal is 'Se true, visibile solo ad admin (nota interna)';
