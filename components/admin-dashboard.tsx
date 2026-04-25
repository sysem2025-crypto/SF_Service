import Link from "next/link";
import { getDashboardData } from "@/lib/content";

const priorityLabels = {
  P1: "Critica",
  P2: "Alta",
  P3: "Media",
  P4: "Bassa"
} as const;

export function AdminDashboard() {
  const dashboard = getDashboardData();

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
              dashboard.openTickets.filter((ticket) => ticket.stato === "escalato")
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
                (ticket) => ticket.priorita === priority
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
                          <div>
                            <strong>
                              <Link href={`/ticket/${ticket.slug}`}>{ticket.id}</Link>
                            </strong>
                            <p>{ticket.titolo}</p>
                          </div>
                          <div className="ticket-meta">
                            <span>{ticket.cliente}</span>
                            <span>{ticket.stato}</span>
                          </div>
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
                      {ticket.id} · {ticket.cliente}
                    </Link>
                  </strong>
                  <p>{ticket.titolo}</p>
                </div>
                <span>{ticket.scadenza_sla || "SLA n/d"}</span>
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
              <li key={client.cliente} className="client-item">
                <div>
                  <strong>{client.cliente}</strong>
                  <p>{client.referente_principale || "Contatto n/d"}</p>
                </div>
                <span>{client.paese || "Paese n/d"}</span>
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
                    <Link href={`/ticket/${ticket.slug}`}>{ticket.id}</Link>
                  </strong>
                  <p>{ticket.titolo}</p>
                </div>
                <span>{ticket.ultimo_aggiornamento}</span>
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
  );
}
