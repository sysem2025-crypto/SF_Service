import fs from "node:fs";
import path from "node:path";
import { getTickets } from "@/lib/content";

type TicketSubmissionInput = {
  cliente: string;
  titolo: string;
  prodotto: string;
  descrizione: string;
  priorita: string;
  contattoCliente: string;
  emailCliente: string;
  createdByName: string;
  createdByEmail: string;
};

function sanitizeSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

function getNextTicketId() {
  const tickets = getTickets();
  const lastNumber = tickets.reduce((max, ticket) => {
    const numericPart = Number.parseInt(ticket.id.replace(/\D/g, ""), 10);
    return Number.isNaN(numericPart) ? max : Math.max(max, numericPart);
  }, 0);

  return `T${String(lastNumber + 1).padStart(3, "0")}`;
}

export function createTicketFromSubmission(input: TicketSubmissionInput) {
  const now = new Date();
  const dateString = now.toISOString().slice(0, 10);
  const compactDate = dateString.replaceAll("-", "");
  const ticketId = getNextTicketId();
  const clientSegment = sanitizeSegment(input.cliente) || "CLIENTE";
  const titleSegment = sanitizeSegment(input.titolo) || "Ticket";
  const fileName = `${compactDate}_${ticketId}_${clientSegment}_${titleSegment}.md`;
  const folderPath = path.join(process.cwd(), "data", "ticket");
  const fullPath = path.join(folderPath, fileName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const source = `---
id: ${ticketId}
titolo: ${input.titolo}
cliente: ${input.cliente}
stato: in_analisi
priorita: ${input.priorita}
responsabile: Da assegnare
assegnato_a: []
data_apertura: ${dateString}
ultimo_aggiornamento: ${dateString}
canale_ingresso: portale
prodotto: ${input.prodotto}
serial_number: ""
impianto: ""
contatto_cliente: ${input.contattoCliente}
email_cliente: ${input.emailCliente}
scadenza_sla: ""
tags: [portale]
allegati: []
creato_da_nome: ${input.createdByName}
creato_da_email: ${input.createdByEmail}
---

# Ticket ${ticketId}

## Initial request

${input.descrizione}

## Initial diagnosis

To be completed by the support team.

## Actions requested from client

- To be defined

## Internal actions performed

- Ticket submitted from the portal

## Timeline

| Data | Tipo | Autore | Stato | Nota |
| :--- | :--- | :----- | :---- | :--- |
| ${dateString} | portal_submission | ${input.createdByName} | in_analisi | Ticket submitted by registered user |

## Outcome

To be completed at closure.
`;

  fs.writeFileSync(fullPath, source, "utf8");

  return {
    id: ticketId,
    fileName
  };
}
