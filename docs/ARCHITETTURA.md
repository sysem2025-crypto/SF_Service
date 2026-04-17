# Architettura Senza Database

## Principio

La piattaforma usa il filesystem come fonte dati primaria.

- i ticket sono file Markdown;
- i clienti sono file Markdown;
- gli allegati sono file fisici in cartelle dedicate;
- la web app legge i metadati dei file e costruisce le viste operative.

## Componenti

### 1. Repository Git

Contiene:

- codice applicativo;
- dati strutturati in file;
- template standard;
- documentazione tecnica e operativa.

### 2. Layer Dati

Cartelle principali:

- `data/ticket`
- `data/clienti`
- `data/allegati`

Ogni file deve essere leggibile anche senza applicazione web.

### 3. Web App

Responsabilita:

- leggere i file dal repository;
- mostrare dashboard e liste;
- filtrare per cliente, stato, priorita e responsabile;
- aggiornare i file in modo controllato;
- allegare documenti e log.

### 4. Indicizzazione

Per evitare letture lente su molti file, e utile generare un indice locale.

Esempio:

- scansione cartelle `ticket` e `clienti`;
- estrazione dei campi YAML;
- produzione di un file indice JSON non autorevole ma veloce da consultare.

Il dato autorevole resta sempre il file Markdown originale.

## Vantaggi

- nessun database da installare;
- versionamento naturale tramite Git;
- dati trasparenti e portabili;
- facile backup;
- migrazione piu semplice verso Gitea o server interno.

## Limiti

- gestione concorrente piu delicata;
- validazione dati da curare bene;
- performance da monitorare se i ticket crescono molto;
- audit avanzato piu limitato rispetto a un database.

## Strategia Evolutiva

### Fase 1

- repository GitHub;
- file Markdown standardizzati;
- web app che legge i file;
- indice locale rigenerabile.

### Fase 2

- editing da interfaccia;
- ricerca full-text;
- dashboard SLA;
- importazione dei ticket storici.

### Fase 3

- eventuale migrazione a Gitea;
- eventuale adozione di un database solo se serve davvero.
