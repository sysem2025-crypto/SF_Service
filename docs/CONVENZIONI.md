# Convenzioni Repository

## Nomi File Ticket

Formato consigliato:

`YYYYMMDD_TXXX_CLIENTE_OGGETTO.md`

Esempio:

`20260414_T012_AIUT_ErroreModbus.md`

## Nomi File Cliente

Formato consigliato:

`CLIENTE.md`

Esempio:

`AIUT.md`

## Stati Ticket

Valori standard:

- `in_analisi`
- `risposta_inviata`
- `in_attesa_cliente`
- `escalato`
- `risolto`
- `chiuso`

## Priorita

Valori standard:

- `P1`
- `P2`
- `P3`
- `P4`

## Campi Obbligatori Ticket

- `id`
- `titolo`
- `cliente`
- `stato`
- `priorita`
- `responsabile`
- `data_apertura`
- `canale_ingresso`
- `prodotto`

## Campi Consigliati Ticket

- `serial_number`
- `impianto`
- `contatto_cliente`
- `email_cliente`
- `assegnato_a`
- `tags`
- `allegati`
- `scadenza_sla`
- `ultimo_aggiornamento`

## Canali Ingresso

- `email`
- `telefono`
- `meeting`
- `whatsapp`
- `interno`

## Regole Operative

- un ticket chiuso non va cancellato;
- ogni aggiornamento importante deve finire nella timeline del ticket;
- gli allegati devono stare in una cartella dedicata al ticket;
- evitare stati inventati fuori standard;
- evitare nomi file ambigui o generici.
