-- Sync locale -> web: campi stabili per collegare i Markdown locali ai record Supabase.
alter table public.tickets
  add column if not exists local_ticket_id text,
  add column if not exists local_code text,
  add column if not exists local_path text,
  add column if not exists source_updated_at timestamp with time zone,
  add column if not exists source text default 'web';

drop index if exists public.idx_tickets_local_ticket_id;

create unique index if not exists idx_tickets_local_ticket_id
  on public.tickets(local_ticket_id);

create index if not exists idx_tickets_source
  on public.tickets(source);
