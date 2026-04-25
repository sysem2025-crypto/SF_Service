import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProcedureDocuments } from "@/lib/content";

export default async function ProcedurePage() {
  await requireUser();
  const procedures = getProcedureDocuments();

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
                <span className="document-type">{item.tipo_documento}</span>
                <span>{item.data_aggiornamento}</span>
              </div>
              <h3>{item.titolo}</h3>
              <p>{item.riassunto}</p>
              <dl className="document-details">
                <div>
                  <dt>Prodotto</dt>
                  <dd>{item.prodotto}</dd>
                </div>
                <div>
                  <dt>Versione</dt>
                  <dd>{item.versione}</dd>
                </div>
                <div>
                  <dt>Ambito</dt>
                  <dd>{item.ambito}</dd>
                </div>
                <div>
                  <dt>Lingua</dt>
                  <dd>{item.lingua || "n/a"}</dd>
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
