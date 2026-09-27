import { createClient } from "@supabase/supabase-js";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(projectRoot, ".env");

loadEnv(envPath);

const dryRun = process.argv.includes("--dry-run");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const assistanceRoot = process.env.LOCAL_TICKET_ROOT || "F:\\Life_OS\\01_Lavoro\\06_Service\\03_Assistenza";

if (!dryRun && (!supabaseUrl || !serviceRoleKey)) {
  fail("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono obbligatori in .env.");
}

if (!existsSync(assistanceRoot)) {
  fail(`Cartella ticket locali non trovata: ${assistanceRoot}`);
}

const supabase = dryRun
  ? null
  : createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

const ticketFilePattern = /^(?<date>\d{8})_(?<code>T\d{3})_(?<customer>.+?)_(?<issue>.+)\.md$/i;
const ticketFolderPattern = /^(?<date>\d{8})_(?<code>T\d{3})$/i;
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "node_modules",
  "__pycache__",
  "00_Documenti",
  "07_Web_Assistenza_GitHub",
]);
const ignoredRootFiles = new Set([
  "00_DashBoard Service.md",
  "01_Procedure_Standard.md",
  "02_Glossario_EVC.md",
  "03_Interfaccia_Web_Assistenza_Tecnica.md",
  "Assistenza Tecnica.md",
  "[DATA]_[IDX]_[CUSTOMER]_[ISSUE].md",
]);

const tickets = collectTickets(assistanceRoot);

if (!tickets.length) {
  console.log("Nessun ticket locale trovato.");
  process.exit(0);
}

if (dryRun) {
  console.log(`Dry run completato: ${tickets.length} ticket locali pronti per la sync.`);
  console.table(tickets.slice(0, 10).map((ticket) => ({
    code: ticket.local_code,
    client: ticket.client,
    status: ticket.status,
    priority: ticket.priority,
    path: ticket.local_ticket_id,
  })));
  process.exit(0);
}

const ownerId = await resolveOwnerId();
const { error } = await supabase
  .from("tickets")
  .upsert(tickets.map((ticket) => ({ ...ticket, user_id: ownerId })), {
    onConflict: "local_ticket_id",
  });

if (error) {
  fail(`Sync fallita: ${error.message}`);
}

console.log(`Sync completata: ${tickets.length} ticket locali pubblicati su Supabase.`);

async function resolveOwnerId() {
  if (process.env.SYNC_USER_ID) return process.env.SYNC_USER_ID;

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();

  if (error) fail(`Impossibile leggere il profilo admin: ${error.message}`);
  if (!data?.id) return resolveOwnerIdFromAuth();

  return data.id;
}

async function resolveOwnerIdFromAuth() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) fail(`Impossibile leggere gli utenti Auth: ${error.message}`);

  const users = data?.users || [];
  const sysemUser = users.find((user) => user.email?.toLowerCase().endsWith("@sysem.it"));
  const fallbackUser = sysemUser || users[0];

  if (!fallbackUser?.id) fail("Nessun utente Auth trovato. Imposta SYNC_USER_ID in .env.");

  console.log(`Uso ${fallbackUser.email || fallbackUser.id} come proprietario tecnico dei ticket sincronizzati.`);
  return fallbackUser.id;
}

function collectTickets(root) {
  const files = walkMarkdown(root);
  return files
    .filter((filePath) => isTicketMarkdown(filePath, root))
    .map((filePath) => ticketFromMarkdown(filePath, root));
}

function walkMarkdown(root) {
  const entries = [];

  for (const itemName of readdirSync(root)) {
    if (itemName.startsWith(".") || ignoredDirectories.has(itemName)) continue;

    const itemPath = path.join(root, itemName);
    const itemStat = statSync(itemPath);

    if (itemStat.isDirectory()) {
      entries.push(...walkMarkdown(itemPath));
      continue;
    }

    if (itemStat.isFile() && itemName.toLowerCase().endsWith(".md")) {
      entries.push(itemPath);
    }
  }

  return entries;
}

function isTicketMarkdown(filePath, root) {
  const fileName = path.basename(filePath);
  if (path.dirname(filePath) === root && ignoredRootFiles.has(fileName)) return false;
  if (ticketFilePattern.test(fileName)) return true;

  const head = readFileSync(filePath, "utf8").slice(0, 500);
  return head.includes("Stato:") && (head.includes("Ticket") || head.includes("Apertura"));
}

function ticketFromMarkdown(filePath, root) {
  const content = readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath);
  const relativePath = path.relative(root, filePath).replaceAll(path.sep, "/");
  const fileMatch = ticketFilePattern.exec(fileName);
  const folderMatch = ticketFolderPattern.exec(path.basename(path.dirname(filePath)));
  const stat = statSync(filePath);

  const code = (fileMatch?.groups?.code || folderMatch?.groups?.code || path.parse(fileName).name.slice(0, 16)).toUpperCase();
  const customer = fileMatch?.groups?.customer?.replaceAll("_", " ") || cleanClientFolderName(path.basename(findClientDirectory(filePath, root)));
  const issue = fileMatch?.groups?.issue?.replaceAll("_", " ") || path.parse(fileName).name.replaceAll("_", " ");
  const createdAt = parseTicketDate(fileMatch?.groups?.date || folderMatch?.groups?.date) || stat.birthtime.toISOString();
  const status = mapStatus(extractField(content, "Stato") || "In Analisi");

  return {
    local_ticket_id: relativePath,
    local_code: code,
    local_path: filePath,
    source: "local_markdown",
    source_updated_at: stat.mtime.toISOString(),
    title: extractTitle(content, issue),
    description: content,
    status,
    priority: mapPriority(extractField(content, "Priorità")),
    client: customer || "Senza cliente",
    channel: "locale",
    product: extractField(content, "Prodotto"),
    serial_number: extractField(content, "Seriale"),
    plant: extractField(content, "Impianto"),
    contact_name: extractField(content, "Referente"),
    contact_email: extractField(content, "Email"),
    assignee: extractField(content, "Responsabile"),
    created_by_name: "Sync locale",
    created_by_email: process.env.SYNC_CREATED_BY_EMAIL || "sync-locale@sysem.it",
    created_at: createdAt,
    updated_at: stat.mtime.toISOString(),
    closed_at: status === "chiuso" ? stat.mtime.toISOString() : null,
    tags: [code, "locale"].filter(Boolean),
  };
}

function findClientDirectory(filePath, root) {
  let current = path.dirname(filePath);
  while (current && current !== root) {
    const parent = path.dirname(current);
    if (parent === root) return current;
    current = parent;
  }
  return "";
}

function cleanClientFolderName(folderName) {
  return folderName.replace(/^\d+_/, "").replaceAll("_", " ").trim();
}

function extractField(content, fieldName) {
  const match = content.match(new RegExp(`^${escapeRegExp(fieldName)}:\\s*(?:\\*\\*)?(.+?)(?:\\*\\*)?\\s*$`, "im"));
  return match ? match[1].trim().replace(/^\[/, "").replace(/\]$/, "") : "";
}

function extractTitle(content, fallback) {
  const line = content.split(/\r?\n/).find((item) => item.trim().startsWith("#"));
  return line ? line.replace(/^#+\s*/, "").replace("📑", "").trim() : fallback;
}

function mapStatus(rawStatus) {
  const status = rawStatus.toLowerCase();
  if (status.includes("chius") || status.includes("risolt") || status.includes("closed") || status.includes("done")) {
    return "chiuso";
  }
  if (status.includes("rifiut")) return "rifiutato";
  if (status.includes("lavor") || status.includes("analisi") || status.includes("attesa") || status.includes("inviata")) {
    return "in_lavorazione";
  }
  return "aperto";
}

function mapPriority(rawPriority) {
  const priority = rawPriority.toUpperCase();
  if (priority === "P1") return "critica";
  if (priority === "P2") return "alta";
  if (priority === "P4") return "bassa";
  return "media";
}

function parseTicketDate(value) {
  if (!/^\d{8}$/.test(value || "")) return "";
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00.000Z`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function loadEnv(filePath) {
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] ||= value;
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
