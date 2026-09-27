import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="page-shell portal-home">
      <section className="portal-hero portal-hero-compact">
        <div>
          <p className="eyebrow">Service desk</p>
          <h1 className="portal-title">SYSEM</h1>
          <p className="portal-copy">
            assistenza tecnica, procedure operative e pacchetti software per apparati
            e applicativi SYSEM.
          </p>
        </div>
        <div className="portal-status-panel">
          <span>Account</span>
          <strong>{user?.email || "Accesso richiesto"}</strong>
          <small>{user ? "Sessione attiva" : "Entra dal sito SYSEM"}</small>
        </div>
      </section>

      <section className="portal-action-strip" aria-label="Azioni rapide">
        <Link href="/ticket/nuovo" className="btn-download">
          Nuovo ticket
        </Link>
        <Link href="/my-tickets" className="btn-download-secondary">
          I miei ticket
        </Link>
        <Link href="/procedure" className="btn-download-secondary">
          Procedure
        </Link>
        <Link href="/firmware-software" className="btn-download-secondary">
          Firmware e software
        </Link>
      </section>

      <section className="portal-grid">
        <Link href="/ticket/nuovo" className="portal-card">
          <span className="portal-kicker">Richiesta</span>
          <strong>Apri un intervento</strong>
          <p>Segnala anomalie, richieste tecniche o interventi su dispositivi e software.</p>
        </Link>

        <Link href="/my-tickets" className="portal-card">
          <span className="portal-kicker">Monitoraggio</span>
          <strong>{user ? "Segui i tuoi ticket" : "Accedi ai ticket"}</strong>
          <p>Controlla avanzamento, priorità e storico delle richieste già aperte.</p>
        </Link>

        <Link href="/procedure" className="portal-card">
          <span className="portal-kicker">Documentazione</span>
          <strong>Procedure tecniche</strong>
          <p>Consulta checklist, istruzioni operative e note di installazione.</p>
        </Link>

        <Link href="/firmware-software" className="portal-card">
          <span className="portal-kicker">Release</span>
          <strong>Firmware e software</strong>
          <p>Accedi a pacchetti, aggiornamenti e riferimenti di versione.</p>
        </Link>
      </section>

      <section className="surface portal-footer portal-admin-strip">
        <div>
          <span className="panel-label">Gestione</span>
          <h2>Area amministrazione</h2>
          <p>Approvazioni utenti, visione completa dei ticket e strumenti di presidio.</p>
        </div>
        <Link href="/admin" className="btn-download">
          Apri amministrazione
        </Link>
      </section>
    </main>
  );
}
