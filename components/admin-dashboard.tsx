import Link from "next/link";
import { getDashboardData } from "@/lib/supabase-data";
import { revalidatePath } from "next/cache";

const priorityLabels = {
  critica: "Critica",
  alta: "Alta",
  media: "Media",
  bassa: "Bassa",
} as const;

const statusLabels = {
  aperto: "Aperto",
  in_lavorazione: "In lavorazione",
  chiuso: "Chiuso",
  rifiutato: "Rifiutato",
} as const;

async function updateTicketDates(formData: FormData) {
  "use server";
  const ticketId = String(formData.get("ticketId") || "");
  const createdAt = String(formData.get("created_at") || "");
  const updatedAt = String(formData.get("updated_at") || "");

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  await fetch(`${baseUrl}/api/ticket/${ticketId}/dates`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ created_at: createdAt, updated_at: updatedAt }),
  });

  revalidatePath("/admin");
}

export async function AdminDashboard() {
  const dashboard = await getDashboardData();

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Controllo assistenza tecnica</h1>
          <div className="hero-actions">
            <Link href="/ticket" className="primary-link">
              Ticket
            </Link>
            <Link href="/procedure" className="text-link">
              Procedures
            </Link>
            <Link href="/firmware-software" className="text-link">
              Firmware & Software
            </Link>
            <Link href="/admin/approvals" className="text-link">
              Approvazioni
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="button-link">
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="hero-panel">
          <span className="panel-label">SLA</span>
          <strong>{dashboard.slaAtRisk.length}</strong>
          <p>ticket in attenzione</p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Ticket aperti</span>
          <strong>{dashboard.openTickets.length}</strong>
        </article>
        <article className="stat-card">
          <span>Clienti attivi</span>
          <strong>{dashboard.clients.length}</strong>
        </article>
        <article className="stat-card">
          <span>Aggiornamenti</span>
          <strong>{dashboard.recentTickets.length}</strong>
        </article>
        <article className="stat-card">
          <span>Escalation</span>
          <strong>
            {
              dashboard.openTickets.filter((ticket) => ticket.status === "escalato")
                .length
            }
          </strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="surface">
          <div className="section-heading">
            <h2>Ticket aperti</h2>
          </div>

          <div className="priority-columns">
            {Object.entries(priorityLabels).map(([priority, label]) => {
              const items = dashboard.openTickets.filter(
                (ticket) => ticket.priority === priority
              );

              return (
                <div key={priority} className="priority-column">
                  <div className="priority-header">
                    <span>{priority}</span>
                    <strong>{label}</strong>
                  </div>
                  <ul className="ticket-list">
                    {items.length ? (
                      items.map((ticket) => (
<li key={ticket.id} className="ticket-item">
                          <form action={updateTicketDates} className="ticket-item">
                            <div>
                              <strong>
                                <Link href={`/ticket/${ticket.slug}`}>{ticket.display_code}</Link>
                              </strong>
                              <p>{ticket.display_title}</p>
                            </div>
                            <div className="ticket-meta">
                              <span>{ticket.client}</span>
                              <span>{statusLabels[ticket.status as keyof typeof statusLabels] || ticket.status}</span>
                            </div>
                            <div className="ticket-date-fields">
                              <label>
                                Creato
                                <input
                                  type="datetime-local"
                                  name="created_at"
                                  defaultValue={ticket.created_at ? ticket.created_at.slice(0, 16) : ""}
                                />
                              </label>
                              <label>
                                Aggiornato
                                <input
                                  type="datetime-local"
                                  name="updated_at"
                                  defaultValue={ticket.updated_at ? ticket.updated_at.slice(0, 16) : ""}
                                />
                              </label>
                              <input type="hidden" name="ticketId" value={ticket.id} />
                              <button type="submit" className="btn-download-secondary" style={{ fontSize: "0.65rem", padding: "3px 6px", marginTop: "4px" }}>
                                Salva date
                              </button>
                            </div>
                          </form>
                        </li>
                      ))
                    ) : (
                      <li className="empty-state">Nessun ticket</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </article>

        <article className="surface">
          <div className="section-heading">
            <h2>Follow-up</h2>
          </div>

          <ul className="stack-list">
            {dashboard.slaAtRisk.map((ticket) => (
              <li key={ticket.id} className="focus-item">
                <div>
                  <strong>
                    <Link href={`/ticket/${ticket.slug}`}>
                      {ticket.display_code} · {ticket.client}
                    </Link>
                  </strong>
                  <p>{ticket.display_title}</p>
                </div>
                <span>{ticket.sla_deadline || "SLA n/d"}</span>
              </li>
            ))}
            {!dashboard.slaAtRisk.length && (
              <li className="empty-state">Nessuna urgenza</li>
            )}
          </ul>
        </article>

        <article className="surface">
          <div className="section-heading">
            <h2>Clients</h2>
          </div>

          <ul className="stack-list">
            {dashboard.clients.map((client) => (
              <li key={client.client} className="client-item">
                <div>
                  <strong>{client.client}</strong>
                  <p>{client.main_contact || "Contatto n/d"}</p>
                </div>
                <span>{client.country || "Paese n/d"}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="surface">
          <div className="section-heading">
            <h2>Ultimi aggiornamenti</h2>
          </div>

          <ul className="stack-list">
            {dashboard.recentTickets.map((ticket) => (
              <li key={ticket.id} className="focus-item">
                <div>
                  <strong>
                    <Link href={`/ticket/${ticket.slug}`}>{ticket.display_code}</Link>
                  </strong>
                  <p>{ticket.display_title}</p>
                </div>
                <span>{ticket.updated_at}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="surface">
          <div className="section-heading">
            <h2>Risorse tecniche</h2>
          </div>

          <div className="quick-links">
            <Link href="/procedure" className="quick-link-card">
              <strong>Procedures</strong>
            </Link>
            <Link href="/firmware-software" className="quick-link-card">
              <strong>Firmware & Software</strong>
            </Link>
          </div>
        </article>
      </section>
    </main>
      <style>{`
        .ticket-date-fields {
          display: flex;
          gap: 6px;
          align-items: flex-end;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .ticket-date-fields label {
          display: flex;
          flex-direction: column;
          font-size: 0.6rem;
          color: var(--muted);
          gap: 2px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .ticket-date-fields input[type="datetime-local"] {
          width: 130px;
          padding: 3px 6px;
          border: 1px solid var(--line);
          border-radius: 4px;
          font-size: 0.7rem;
          background: var(--white);
          color: var(--text);
        }
        .ticket-date-fields input[type="datetime-local"]:focus {
          outline: 3px solid var(--accent-soft);
          border-color: var(--aqua);
        }
      `}</style>
    </main>
  );
}

