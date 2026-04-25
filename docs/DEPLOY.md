# Deploy

## Piattaforma consigliata

Questa applicazione **non** e adatta a un hosting serverless puro come Vercel, perche scrive dati su filesystem locale:

- `data/users/accounts.json`
- `data/users/pending-approvals.json`
- `data/ticket/*.md`

Serve quindi un deploy con **disco persistente**, per esempio:

- VPS Linux con Node.js
- macchina Windows o Linux interna
- container Docker con volume montato

## Variabili ambiente

Copia `.env.example` in `.env.local` o `.env.production` e imposta almeno:

- `AUTH_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Avvio produzione

```bash
npm install
npm run build
npm run start
```

Di default Next.js usa la porta `3000`.

## Deploy rapido su VPS con Docker

File pronti nella repo:

- `Dockerfile`
- `docker-compose.yml`
- `.env.production.example`

Passi consigliati sulla VPS:

```bash
cp .env.production.example .env.production
docker compose build
docker compose up -d
```

Con questa configurazione:

- il sito risponde sulla porta `3000`
- la cartella `data/` resta persistente sul server
- i nuovi ticket e utenti restano salvati fuori dal layer effimero del container

## Hetzner VPS: sequenza minima

1. installare Docker e Docker Compose plugin
2. copiare la cartella del progetto sulla VPS
3. creare `.env.production`
4. avviare con `docker compose up -d`
5. aprire la porta `3000` nel firewall oppure mettere davanti un reverse proxy

## Reverse proxy

Mettere davanti un proxy come Nginx o Caddy per:

- HTTPS
- dominio pubblico
- gestione riavvii e logging

## Note operative

- fare backup periodico della cartella `data/`
- non pubblicare `.env.production`
- usare un process manager come `pm2` o un servizio `systemd`
