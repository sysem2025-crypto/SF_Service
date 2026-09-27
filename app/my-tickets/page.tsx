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

export default async function MyTicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const userEmail = user.email?.toLowerCase() || "";
  const tickets = (await getTickets()).filter((ticket) => {
    const createdByEmail = ticket.created_by_email?.toLowerCase() || "";
    const isUserTicket = createdByEmail === userEmail;
    const isLocalTicket = ticket.channel === "locale";
    const isOpen = ticket.status !== "chiuso";

    return isOpen && (isUserTicket || isLocalTicket);
  });

  return (
    <main className="page-shell">
      <div className="content-frame">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Ticket</p>
            <h1 className="page-title">I miei ticket</h1>
          </div>
        </div>

        <div className="page-body">
          <section className="surface">
            <div className="section-heading">
              <h2>Ticket aperti e sincronizzati</h2>
              <div className="section-heading-row">
                <p>{tickets.length} record</p>
                <Link href="/ticket/nuovo" className="btn-download">
                  + Nuovo ticket
                </Link>
              </div>
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
                          <Link href={`/ticket/${ticket.slug}`} className="btn-download">
                            {ticket.display_code}
                          </Link>
                        </td>
                        <td>{ticket.client}</td>
                        <td>{ticket.display_title}</td>
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
                <Link href="/ticket/nuovo" className="btn-download">
                  Nuovo ticket
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
