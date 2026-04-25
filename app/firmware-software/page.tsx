import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getFirmwareSoftwareDocuments } from "@/lib/content";

export default async function FirmwareSoftwarePage() {
  await requireUser();
  const items = getFirmwareSoftwareDocuments();

  return (
    <main className="page-shell">
      <section className="section-intro">
        <div>
          <p className="eyebrow">Firmware & Software</p>
          <h1 className="section-title">Pacchetti tecnici</h1>
        </div>

        <Link href="/" className="text-link">
          Portal
        </Link>
      </section>

      <section className="surface">
        <div className="section-heading">
          <h2>Catalogo</h2>
          <p>{items.length} pacchetti</p>
        </div>

        <div className="document-grid">
          {items.map((item) => (
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
                  <dt>Compatibilita</dt>
                  <dd>{(item.compatibilita || []).join(", ") || "n/a"}</dd>
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
                Apri
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
