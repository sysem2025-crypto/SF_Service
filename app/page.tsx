import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="page-shell">
      <section className="portal-hero">
        <div>
          <p className="eyebrow">Supporto tecnico</p>
          <h1 className="portal-title">Assistenza tecnica</h1>
          <p className="portal-copy">
            Apri nuove richieste, segui lo stato dei ticket e recupera procedure,
            firmware e documentazione operativa in un unico spazio SYSEM.
          </p>
        </div>
        <div className="portal-hero-actions">
          <Link href="/ticket/nuovo" className="primary-link">
            Apri ticket SYSEM
          </Link>
          <Link href="/my-tickets" className="secondary-link">
            Consulta ticket
          </Link>
        </div>
      </section>

      <section className="portal-grid">
        <Link href="/ticket/nuovo" className="portal-card">
          <span className="portal-kicker">01</span>
          <strong>Nuovo ticket</strong>
          <p>Segnala anomalie, richieste tecniche o interventi su dispositivi e software.</p>
        </Link>

        <Link href="/my-tickets" className="portal-card">
          <span className="portal-kicker">02</span>
          <strong>{user ? "I miei ticket" : "Accesso ticket"}</strong>
          <p>Controlla avanzamento, priorità e storico delle richieste già aperte.</p>
        </Link>

        <Link href="/procedure" className="portal-card">
          <span className="portal-kicker">03</span>
          <strong>Procedure</strong>
          <p>Consulta checklist, istruzioni operative e note di installazione.</p>
        </Link>

        <Link href="/firmware-software" className="portal-card">
          <span className="portal-kicker">04</span>
          <strong>Firmware & Software</strong>
          <p>Accedi a pacchetti, aggiornamenti e riferimenti di versione.</p>
        </Link>
      </section>

      <section className="surface portal-footer">
        <div className="section-heading">
          <h2>Area amministrazione</h2>
        </div>

        <Link href="/admin" className="text-link">
          Apri
        </Link>
      </section>
    </main>
  );
}
