# Scripts

Questa cartella ospitera script di supporto, ad esempio:

- indicizzazione ticket;
- validazione YAML;
- migrazione ticket esistenti;
- generazione report.

## Sync ticket locali

1. Esegui in Supabase SQL Editor `supabase-migration-local-ticket-sync.sql`.
2. Verifica che `.env` contenga `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. Opzionale: imposta `LOCAL_TICKET_ROOT` se la cartella locale non e quella predefinita.
4. Esegui:

```powershell
npm run sync:local-tickets
```

Prima del primo invio puoi fare una verifica senza scrivere su Supabase:

```powershell
npm run sync:local-tickets -- --dry-run
```

Lo script fa solo sync locale -> web con upsert su `local_ticket_id`; non cancella record su Supabase.
