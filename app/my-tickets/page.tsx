import Link from "next/link";
import { getTicketsByCreatorEmail } from "@/lib/supabase-data";
import { createClient } from "@/lib/supabase-server";

const statusLabels: Record<string, string> = {
  in_analisi: "In analisi",
  risposta_inviata: "Risposta inviata",
  in_attesa_cliente: "In attesa cliente",
  escalato: "Escalato",
  risolto: "Risolto",
  chiuso: "Chiuso",
  aperto: "Aperto",
  in_lavorazione: "In lavorazione",
};

const priorityLabels: Record<string, string> = {
  critica: "Critica",
  alta: "Alta",
  media: "Media",
  bassa: "Bassa",
};

export default async function MyTicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const tickets = await getTicketsByCreatorEmail(user.email!, true);

  return (
    <main className="page-shell">
      <section className="section-intro">
        <div>
          <p className="eyebrow">My Tickets</p>
          <h1 className="section-title">I miei ticket</h1>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/ticket/nuovo" className="text-link" style={{ fontWeight: 600 }}>
            + Nuovo ticket
          </Link>
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <h2>Ticket aperti</h2>
          <p>{tickets.length} record</p>
        </div>

        {tickets.length ? (
          <div className="table-shell">
            <table className="ticket-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Titolo</th>
                  <th>Priorità</th>
                  <th>Stato</th>
                  <th>Aperto</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.slug}>
                    <td>
                      <Link href={`/ticket/${ticket.slug}`} className="text-link">
                        {ticket.id}
                      </Link>
                    </td>
                    <td>{ticket.client}</td>
                    <td>{ticket.title}</td>
                    <td>
                      <span className={`priority-badge priority-${ticket.priority.toLowerCase()}`}>
                        {priorityLabels[ticket.priority] || ticket.priority}
                      </span>
                    </td>
                    <td>{statusLabels[ticket.status] ?? ticket.status}</td>
                    <td>{ticket.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-panel">
            <p className="empty-state">
              Nessun ticket aperto.
            </p>
            <Link href="/ticket/nuovo" className="primary-link">
              Nuovo ticket
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}