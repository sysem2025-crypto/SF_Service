# Web Assistenza Tecnica

Repository base per una piattaforma web di assistenza tecnica senza database, progettata per lavorare su file `Markdown`, allegati su filesystem e convenzioni Git compatibili con `GitHub` e future migrazioni a `Gitea`.

## Obiettivo

Questa base serve a:

- gestire ticket, clienti e documentazione tecnica senza database;
- mantenere i dati leggibili anche fuori dalla web app;
- pubblicare il progetto su GitHub senza lock-in;
- preparare una futura migrazione a Gitea o server interno.

## Struttura

```text
07_Web_Assistenza_GitHub/
|-- app/
|-- data/
|   |-- allegati/
|   |-- clienti/
|   `-- ticket/
|-- docs/
|-- scripts/
`-- templates/
```

## Regole di base

- ogni ticket e un file Markdown autonomo;
- i metadati stanno nello YAML front matter;
- gli allegati restano su filesystem;
- il nome file identifica in modo chiaro data, ticket, cliente e oggetto;
- la web app legge i file e costruisce dashboard, filtri e timeline.

## File chiave

- `docs/ARCHITETTURA.md`: visione tecnica della soluzione senza database;
- `docs/CONVENZIONI.md`: convenzioni nomi file, stati, priorita e campi;
- `templates/ticket-template.md`: modello ticket standard;
- `templates/cliente-template.md`: modello anagrafica cliente.

## Prossimi passi

1. popolare `data/clienti` con i clienti attuali;
2. standardizzare i ticket esistenti secondo il template;
3. scaffoldare la web app in `app/`;
4. aggiungere script di indicizzazione e ricerca in `scripts/`.
