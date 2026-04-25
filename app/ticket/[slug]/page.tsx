import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getTicketBySlug, getTickets } from "@/lib/content";

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

export function generateStaticParams() {
  return getTickets().map((ticket) => ({
    slug: ticket.slug
  }));
}

export default async function TicketDetailPage({
  params
}: TicketDetailPageProps) {
  await requireAdmin();
  const { slug } = await params;
  const ticket = getTicketBySlug(slug);

  if (!ticket) {
    notFound();
  }

  const blocks = renderContent(ticket.content);

  return (
    <main className="page-shell">
      <section className="section-intro">
        <div>
          <p className="eyebrow">{ticket.id}</p>
          <h1 className="section-title">{ticket.titolo}</h1>
          <p className="hero-copy">
            {ticket.cliente} · {ticket.prodotto} · {ticket.responsabile}
          </p>
        </div>

        <Link href="/ticket" className="text-link">
          Lista ticket
        </Link>
      </section>

      <section className="content-grid detail-grid">
        <article className="surface">
          <div className="section-heading">
            <h2>Dati principali</h2>
          </div>

          <dl className="detail-list">
            <div>
              <dt>Stato</dt>
              <dd>{ticket.stato}</dd>
            </div>
            <div>
              <dt>Priorita</dt>
              <dd>{ticket.priorita}</dd>
            </div>
            <div>
              <dt>Cliente</dt>
              <dd>{ticket.cliente}</dd>
            </div>
            <div>
              <dt>Prodotto</dt>
              <dd>{ticket.prodotto}</dd>
            </div>
            <div>
              <dt>Impianto</dt>
              <dd>{ticket.impianto || "n/a"}</dd>
            </div>
            <div>
              <dt>Seriale</dt>
              <dd>{ticket.serial_number || "n/a"}</dd>
            </div>
            <div>
              <dt>Referente</dt>
              <dd>{ticket.contatto_cliente || "n/a"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{ticket.email_cliente || "n/a"}</dd>
            </div>
            <div>
              <dt>Aperto</dt>
              <dd>{ticket.data_apertura}</dd>
            </div>
            <div>
              <dt>Aggiornato</dt>
              <dd>{ticket.ultimo_aggiornamento}</dd>
            </div>
            <div>
              <dt>SLA</dt>
              <dd>{ticket.scadenza_sla || "n/d"}</dd>
            </div>
          </dl>
        </article>

        <article className="surface">
          <div className="section-heading">
            <h2>Contenuto</h2>
          </div>

          <div className="markdown-body">
            {blocks.map((block) =>
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
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
