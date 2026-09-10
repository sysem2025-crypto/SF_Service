import Link from "next/link";
import { getTickets } from "@/lib/supabase-data";
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

export default async function TicketPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const tickets = await getTickets();

  return (
    <main className="page-shell">
      <section className="section-intro">
        <div>
          <p className="eyebrow">Ticket</p>
          <h1 className="section-title">Lista ticket</h1>
        </div>

        <Link href="/admin" className="text-link">
          Dashboard
        </Link>
      </section>

      <section className="surface filters-surface">
        <div className="section-heading">
          <h2>Filtri</h2>
        </div>

        <div className="filter-row">
          <span className="filter-chip">Critica-Alta</span>
          <span className="filter-chip">In attesa cliente</span>
          <span className="filter-chip">Modbus</span>
          <span className="filter-chip">Cliente</span>
          <span className="filter-chip">Responsabile</span>
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <h2>Tutti i ticket</h2>
          <p>{tickets.length} record</p>
        </div>

        <div className="table-shell">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Titolo</th>
                <th>Priorità</th>
                <th>Stato</th>
                <th>Responsabile</th>
                <th>Aggiornato</th>
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
                  <td>{ticket.assignee}</td>
                  <td>{ticket.updated_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}