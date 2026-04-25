import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="page-shell">
      <section className="portal-hero">
        <div>
          <p className="eyebrow">Service Portal</p>
          <h1 className="portal-title">Assistenza tecnica</h1>
        </div>
      </section>

      <section className="portal-grid">
        <Link href="/ticket/nuovo" className="portal-card">
          <span className="portal-kicker">01</span>
          <strong>Nuovo ticket</strong>
        </Link>

        <Link href="/my-tickets" className="portal-card">
          <span className="portal-kicker">02</span>
          <strong>{user ? "I miei ticket" : "Accesso ticket"}</strong>
        </Link>

        <Link href="/procedure" className="portal-card">
          <span className="portal-kicker">03</span>
          <strong>Procedure</strong>
        </Link>

        <Link href="/firmware-software" className="portal-card">
          <span className="portal-kicker">04</span>
          <strong>Firmware & Software</strong>
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
