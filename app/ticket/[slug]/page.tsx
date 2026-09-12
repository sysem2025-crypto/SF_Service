import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getTicketBySlug } from "@/lib/supabase-data";
import { createClient } from "@/lib/supabase-server";

type TicketDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function renderContent(content: string | undefined) {
  if (!content) {
    return [];
  }

  return content
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function formatDate(value: string | undefined) {
  if (!value) {
    return "n/d";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(date);
}

function formatDateInput(value: string | undefined) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function priorityClass(priority: string) {
  const normalized = priority.toLowerCase();

  if (normalized === "critica" || normalized === "alta") return "priority-p1";
  if (normalized === "media") return "priority-p2";
  if (normalized === "bassa") return "priority-p4";

  return `priority-${normalized}`;
}

function canManageTicket(
  user: { email: string; role: string; full_name: string | null },
  ticket: { assignee?: string }
) {
  if (user.role === "admin") return true;

  const assignee = String(ticket.assignee || "").trim().toLowerCase();
  if (!assignee) return false;

  return (
    assignee === user.email.toLowerCase() ||
    assignee === String(user.full_name || "").trim().toLowerCase()
  );
}

function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string | undefined;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "detail-field detail-field-wide" : "detail-field"}>
      <dt>{label}</dt>
      <dd>{value || "n/a"}</dd>
    </div>
  );
}

function TicketInfo({
  ticket,
  contact,
  email,
}: {
  ticket: Awaited<ReturnType<typeof getTicketBySlug>> & {};
  contact: string;
  email: string;
}) {
  if (!ticket) return null;

  return (
    <dl className="detail-list">
      <Field label="Cliente" value={ticket.client} />
      <Field label="Prodotto" value={ticket.product} />
      <Field label="Impianto" value={ticket.plant} />
      <Field label="Seriale" value={ticket.serial_number} />
      <Field label="Referente" value={contact} />
      <Field label="Email" value={email} />
      <Field label="Aperto" value={formatDate(ticket.created_at)} />
      <Field label="Aggiornato" value={formatDate(ticket.updated_at)} />
      <Field label="Chiuso" value={ticket.closed_at ? formatDate(ticket.closed_at) : "Non chiuso"} />
      <Field label="SLA" value={formatDate(ticket.sla_deadline)} />
    </dl>
  );
}

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { slug } = await params;
  const ticket = await getTicketBySlug(slug);

  if (!ticket) {
    notFound();
  }

  const blocks = renderContent(ticket.content);
  const contact = ticket.contact_name || ticket.created_by_name || "n/a";
  const email = ticket.contact_email || ticket.created_by_email || "n/a";
  const manageable = canManageTicket(user, ticket);

  async function updateTicketAction(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();
    const currentTicket = await getTicketBySlug(slug);

    if (!currentUser || !currentTicket || !canManageTicket(currentUser, currentTicket)) {
      throw new Error("Operazione non autorizzata");
    }

    const supabase = await createClient();
    const slaValue = String(formData.get("sla_deadline") || "").trim();
    const nextStatus = String(formData.get("status") || currentTicket.status);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("tickets")
      .update({
        status: nextStatus,
        priority: String(formData.get("priority") || currentTicket.priority),
        assignee: String(formData.get("assignee") || "").trim(),
        client: String(formData.get("client") || "").trim(),
        product: String(formData.get("product") || "").trim(),
        plant: String(formData.get("plant") || "").trim(),
        serial_number: String(formData.get("serial_number") || "").trim(),
        contact_name: String(formData.get("contact_name") || "").trim(),
        contact_email: String(formData.get("contact_email") || "").trim(),
        sla_deadline: slaValue ? new Date(slaValue).toISOString() : null,
        description: String(formData.get("description") || "").trim(),
        closed_at:
          nextStatus === "chiuso" ? currentTicket.closed_at || now : null,
        updated_at: now,
      })
      .eq("id", slug);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/ticket/${slug}`);
    revalidatePath("/ticket");
    revalidatePath("/my-tickets");
  }

  async function closeTicketAction(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();
    const currentTicket = await getTicketBySlug(slug);

    if (!currentUser || !currentTicket || !canManageTicket(currentUser, currentTicket)) {
      throw new Error("Operazione non autorizzata");
    }

    const now = new Date().toISOString();
    const closeNote = String(formData.get("close_note") || "").trim();
    const currentContent = currentTicket.content || "";
    const description = closeNote
      ? `${currentContent}${currentContent ? "\n\n" : ""}# Chiusura\n${closeNote}`
      : currentContent;

    const supabase = await createClient();
    const { error } = await supabase
      .from("tickets")
      .update({
        status: "chiuso",
        closed_at: now,
        updated_at: now,
        description,
      })
      .eq("id", slug);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/ticket/${slug}`);
    revalidatePath("/ticket");
    revalidatePath("/my-tickets");
  }

  return (
    <main className="page-shell ticket-page-shell">
      <section className="ticket-detail-hero">
        <div className="ticket-detail-title-row">
          <div>
            <div className="ticket-detail-kicker">
              <span className="eyebrow">{ticket.id}</span>
              <span className={`priority-badge ${priorityClass(ticket.priority)}`}>
                {ticket.priority}
              </span>
              <span className="ticket-status-chip">{ticket.status}</span>
            </div>
            <h1 className="section-title">{ticket.title}</h1>
            <p className="hero-copy">
              {ticket.client || "Cliente non indicato"}
              {ticket.product ? ` · ${ticket.product}` : ""}
              {ticket.assignee ? ` · ${ticket.assignee}` : ""}
            </p>
          </div>

          <div className="ticket-detail-actions">
            <a href={`/api/ticket/${ticket.id}/pdf`} className="secondary-link">
              Scarica PDF
            </a>
            <Link href="/ticket" className="text-link">
              Lista ticket
            </Link>
          </div>
        </div>
      </section>

      <section className="ticket-workspace">
        <article className="surface ticket-content">
          <div className="section-heading">
            <h2>Contenuto</h2>
          </div>

          <div className="markdown-body">
            {blocks.length > 0 ? (
              blocks.map((block) =>
                block.startsWith("#") ? (
                  <h3 key={block}>{block.replace(/^#+\s*/, "")}</h3>
                ) : block.startsWith("- ") ? (
                  <ul key={block}>
                    {block.split(/\r?\n/).map((line) => (
                      <li key={line}>{line.replace(/^- /, "")}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={block}>{block}</p>
                )
              )
            ) : (
              <p className="empty-state">Nessuna descrizione inserita.</p>
            )}
          </div>
        </article>

        <aside className="ticket-side-column">
          <section className="surface ticket-summary">
            <div className="section-heading ticket-panel-heading">
              <h2>Dati ticket</h2>
            </div>
            <TicketInfo ticket={ticket} contact={contact} email={email} />
          </section>

          {manageable ? (
            <section className="surface ticket-operations">
              <div className="section-heading ticket-panel-heading">
                <h2>Gestione</h2>
              </div>

              <form action={updateTicketAction} className="ticket-edit-form">
                <label>
                  Stato
                  <select name="status" defaultValue={ticket.status}>
                    <option value="aperto">Aperto</option>
                    <option value="in_lavorazione">In lavorazione</option>
                    <option value="chiuso">Chiuso</option>
                    <option value="rifiutato">Rifiutato</option>
                  </select>
                </label>

                <label>
                  Priorità
                  <select name="priority" defaultValue={ticket.priority}>
                    <option value="bassa">Bassa</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Critica</option>
                  </select>
                </label>

                <label>
                  Assegnato a
                  <input name="assignee" defaultValue={ticket.assignee} />
                </label>

                <label>
                  SLA
                  <input
                    name="sla_deadline"
                    type="datetime-local"
                    defaultValue={formatDateInput(ticket.sla_deadline)}
                  />
                </label>

                <label>
                  Cliente
                  <input name="client" defaultValue={ticket.client} />
                </label>

                <label>
                  Prodotto
                  <input name="product" defaultValue={ticket.product} />
                </label>

                <label>
                  Impianto
                  <input name="plant" defaultValue={ticket.plant || ""} />
                </label>

                <label>
                  Seriale
                  <input name="serial_number" defaultValue={ticket.serial_number || ""} />
                </label>

                <label>
                  Referente
                  <input name="contact_name" defaultValue={ticket.contact_name || ""} />
                </label>

                <label>
                  Email referente
                  <input name="contact_email" type="email" defaultValue={ticket.contact_email || ""} />
                </label>

                <label className="ticket-edit-wide">
                  Contenuto
                  <textarea name="description" rows={5} defaultValue={ticket.content || ""} />
                </label>

                <div className="ticket-operation-actions">
                  <button type="submit" className="primary-link">
                    Salva
                  </button>
                </div>
              </form>

              <form action={closeTicketAction} className="ticket-close-form">
                <label>
                  Nota chiusura
                  <textarea
                    name="close_note"
                    rows={3}
                    placeholder="Esito intervento o note per lo storico."
                  />
                </label>
                <button type="submit" className="danger-link">
                  Chiudi ticket
                </button>
              </form>
            </section>
          ) : (
            <section className="surface ticket-operations ticket-operations-readonly">
              <div className="section-heading ticket-panel-heading">
                <h2>Chiusura</h2>
                <p>La chiusura può essere dichiarata dall'amministrazione o da chi ha in carico il ticket.</p>
              </div>
              <dl className="detail-list">
                <Field label="Chiuso" value={ticket.closed_at ? formatDate(ticket.closed_at) : "Non chiuso"} />
              </dl>
            </section>
          )}
        </aside>
      </section>
    </main>
  );
}
