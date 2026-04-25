import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getTicketsByCreatorEmail } from "@/lib/content";

const statusLabels: Record<string, string> = {
  in_analisi: "In analisi",
  risposta_inviata: "Risposta inviata",
  in_attesa_cliente: "In attesa cliente",
  escalato: "Escalato",
  risolto: "Risolto",
  chiuso: "Chiuso"
};

export default async function MyTicketsPage() {
  const user = await requireUser();
  const tickets = getTicketsByCreatorEmail(user.email, true);

  return (
    <main className="page-shell">
      <section className="section-intro">
        <div>
          <p className="eyebrow">My Tickets</p>
          <h1 className="section-title">I miei ticket</h1>
        </div>

        <Link href="/" className="text-link">
          Portal
        </Link>
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
                  <th>Priorita</th>
                  <th>Stato</th>
                  <th>Aperto</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.slug}>
                    <td>{ticket.id}</td>
                    <td>{ticket.cliente}</td>
                    <td>{ticket.titolo}</td>
                    <td>
                      <span className={`priority-badge priority-${ticket.priorita.toLowerCase()}`}>
                        {ticket.priorita}
                      </span>
                    </td>
                    <td>{statusLabels[ticket.stato] ?? ticket.stato}</td>
                    <td>{ticket.data_apertura}</td>
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
