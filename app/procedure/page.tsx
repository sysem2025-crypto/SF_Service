import Link from "next/link";
import { getProcedureDocuments } from "@/lib/supabase-data";
import { createClient } from "@/lib/supabase-server";

export default async function ProcedurePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const procedures = await getProcedureDocuments();

  return (
    <main className="page-shell">
      <section className="section-intro">
        <div>
          <p className="eyebrow">Procedures</p>
          <h1 className="section-title">Procedure tecniche</h1>
        </div>

        <Link href="/" className="text-link">
          Portal
        </Link>
      </section>

      <section className="surface">
        <div className="section-heading">
          <h2>Catalogo</h2>
          <p>{procedures.length} documenti</p>
        </div>

        <div className="document-grid">
          {procedures.map((item) => (
            <article key={item.slug} className="document-card">
              <div className="document-meta">
                <span className="document-type">{item.doc_type}</span>
                <span>{item.updated_at}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <dl className="document-details">
                <div>
                  <dt>Prodotto</dt>
                  <dd>{item.product}</dd>
                </div>
                <div>
                  <dt>Versione</dt>
                  <dd>{item.version}</dd>
                </div>
                <div>
                  <dt>Ambito</dt>
                  <dd>{item.scope}</dd>
                </div>
                <div>
                  <dt>Lingua</dt>
                  <dd>{item.language || "n/a"}</dd>
                </div>
              </dl>
              <div className="tag-row">
                {(item.tags || []).map((tag) => (
                  <span key={tag} className="filter-chip">
                    {tag}
                  </span>
                ))}
              </div>
              <a href={item.download_url || "#"} className="primary-link">
                Scarica
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}