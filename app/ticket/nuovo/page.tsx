import Link from "next/link";
import { requireUser } from "@/lib/auth";

type NewTicketPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewTicketPage({ searchParams }: NewTicketPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const createdTicketId = typeof params.created === "string" ? params.created : "";

  return (
    <main className="page-shell auth-shell">
      <section className="surface auth-card ticket-form-card">
        <div className="section-heading">
          <h2>Nuovo ticket</h2>
          <p>{user.name}</p>
        </div>

        {createdTicketId && (
          <div className="success-stack">
            <p className="auth-message success">
              Ticket {createdTicketId} creato.
            </p>
            <Link href="/my-tickets" className="text-link">
              I miei ticket
            </Link>
          </div>
        )}

        <form action="/api/ticket/submit" method="post" className="auth-form">
          <label>
            <span>Cliente</span>
            <input type="text" name="cliente" required />
          </label>
          <label>
            <span>Prodotto o dispositivo</span>
            <input type="text" name="prodotto" required />
          </label>
          <label>
            <span>Titolo</span>
            <input type="text" name="titolo" required />
          </label>
          <label>
            <span>Priorita</span>
            <select name="priorita" defaultValue="P3">
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
              <option value="P4">P4</option>
            </select>
          </label>
          <label>
            <span>Referente cliente</span>
            <input type="text" name="contattoCliente" required />
          </label>
          <label>
            <span>Email referente</span>
            <input type="email" name="emailCliente" required />
          </label>
          <label>
            <span>Descrizione</span>
            <textarea name="descrizione" rows={8} required />
          </label>
          <button type="submit" className="primary-link button-reset">
            Invia ticket
          </button>
        </form>
      </section>
    </main>
  );
}
