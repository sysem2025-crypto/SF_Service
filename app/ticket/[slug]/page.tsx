import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { slug } = await params;
  const ticket = await getTicketBySlug(slug);

  if (!ticket) {
    notFound();
  }

  const blocks = renderContent(ticket.content);

  return (
    <main className="page-shell">
      <section className="section-intro">
        <div>
          <p className="eyebrow">{ticket.id}</p>
          <h1 className="section-title">{ticket.title}</h1>
          <p className="hero-copy">
            {ticket.client} · {ticket.product} · {ticket.assignee}
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
              <dd>{ticket.status}</dd>
            </div>
            <div>
              <dt>Priorità</dt>
              <dd>{ticket.priority}</dd>
            </div>
            <div>
              <dt>Cliente</dt>
              <dd>{ticket.client}</dd>
            </div>
            <div>
              <dt>Prodotto</dt>
              <dd>{ticket.product}</dd>
            </div>
            <div>
              <dt>Impianto</dt>
              <dd>{ticket.plant || "n/a"}</dd>
            </div>
            <div>
              <dt>Seriale</dt>
              <dd>{ticket.serial_number || "n/a"}</dd>
            </div>
            <div>
              <dt>Referente</dt>
              <dd>{ticket.contact_name || "n/a"}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{ticket.contact_email || "n/a"}</dd>
            </div>
            <div>
              <dt>Aperto</dt>
              <dd>{ticket.created_at}</dd>
            </div>
            <div>
              <dt>Aggiornato</dt>
              <dd>{ticket.updated_at}</dd>
            </div>
            <div>
              <dt>SLA</dt>
              <dd>{ticket.sla_deadline || "n/d"}</dd>
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