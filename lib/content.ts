import fs from "node:fs";
import path from "node:path";

type Primitive = string | string[];

type RecordValue = Record<string, Primitive>;

export type TicketRecord = {
  slug: string;
  id: string;
  titolo: string;
  cliente: string;
  stato: string;
  priorita: string;
  responsabile: string;
  data_apertura: string;
  ultimo_aggiornamento: string;
  canale_ingresso: string;
  prodotto: string;
  scadenza_sla?: string;
  serial_number?: string;
  impianto?: string;
  contatto_cliente?: string;
  email_cliente?: string;
  tags?: string[];
  allegati?: string[];
  creato_da_nome?: string;
  creato_da_email?: string;
  content?: string;
};

export type ClientRecord = {
  cliente: string;
  paese?: string;
  referente_principale?: string;
  email_principale?: string;
};

export type DocumentRecord = {
  slug: string;
  titolo: string;
  categoria: string;
  tipo_documento: string;
  versione: string;
  data_aggiornamento: string;
  prodotto: string;
  ambito: string;
  lingua?: string;
  download_url?: string;
  riassunto?: string;
  tags?: string[];
  compatibilita?: string[];
};

const basePath = path.join(process.cwd(), "data");

function parseValue(rawValue: string): Primitive {
  const value = rawValue.trim();

  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) {
      return [];
    }

    return inner
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  return value.replace(/^["']|["']$/g, "");
}

function parseFrontMatter(source: string): RecordValue {
  if (!source.startsWith("---")) {
    return {};
  }

  const parts = source.split("---");
  const frontMatter = parts[1] ?? "";
  const record: RecordValue = {};

  for (const line of frontMatter.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1);
    record[key] = parseValue(value);
  }

  return record;
}

function extractContent(source: string) {
  if (!source.startsWith("---")) {
    return source.trim();
  }

  const endMarkerIndex = source.indexOf("---", 3);
  if (endMarkerIndex === -1) {
    return "";
  }

  return source.slice(endMarkerIndex + 3).trim();
}

function readMarkdownCollection<T>(folderName: string): T[] {
  const folderPath = path.join(basePath, folderName);

  if (!fs.existsSync(folderPath)) {
    return [];
  }

  return fs
    .readdirSync(folderPath)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const fullPath = path.join(folderPath, fileName);
      const source = fs.readFileSync(fullPath, "utf8");
      const frontMatter = parseFrontMatter(source);
      const slug = fileName.replace(/\.md$/i, "");

      return {
        ...frontMatter,
        slug,
        content: extractContent(source)
      } as T;
    });
}

export function getTickets(): TicketRecord[] {
  return readMarkdownCollection<TicketRecord>("ticket").sort((left, right) =>
    right.ultimo_aggiornamento.localeCompare(left.ultimo_aggiornamento)
  );
}

export function getClients(): ClientRecord[] {
  return readMarkdownCollection<ClientRecord>("clienti").sort((left, right) =>
    left.cliente.localeCompare(right.cliente)
  );
}

export function getTicketBySlug(slug: string) {
  return getTickets().find((ticket) => ticket.slug === slug);
}

export function getTicketsByCreatorEmail(email: string, openOnly = false) {
  const normalizedEmail = email.trim().toLowerCase();

  return getTickets().filter((ticket) => {
    const matchesCreator =
      ticket.creato_da_email?.trim().toLowerCase() === normalizedEmail;
    const matchesStatus = openOnly ? ticket.stato !== "chiuso" : true;

    return matchesCreator && matchesStatus;
  });
}

export function getProcedureDocuments() {
  return readMarkdownCollection<DocumentRecord>("procedure").sort((left, right) =>
    right.data_aggiornamento.localeCompare(left.data_aggiornamento)
  );
}

export function getFirmwareSoftwareDocuments() {
  return readMarkdownCollection<DocumentRecord>("firmware-software").sort(
    (left, right) => right.data_aggiornamento.localeCompare(left.data_aggiornamento)
  );
}

export function getDashboardData() {
  const tickets = getTickets();
  const clients = getClients();
  const openTickets = tickets.filter((ticket) => ticket.stato !== "chiuso");
  const recentTickets = tickets.slice(0, 5);
  const slaAtRisk = openTickets.filter(
    (ticket) => ticket.priorita === "P1" || ticket.priorita === "P2"
  );

  return {
    tickets,
    clients,
    openTickets,
    recentTickets,
    slaAtRisk
  };
}
