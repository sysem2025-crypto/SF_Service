"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Ticket = {
  id: string;
  title: string;
  client: string;
  status: string;
  priority: string;
  updated_at: string;
  slug?: string;
};

type Client = {
  client: string;
  main_contact?: string;
  country?: string;
};

const priorityLabels: Record<string, string> = {
  critica: "Critica",
  alta: "Alta",
  media: "Media",
  bassa: "Bassa",
};

const statusLabels: Record<string, string> = {
  aperto: "Aperto",
  in_lavorazione: "In lavorazione",
  chiuso: "Chiuso",
  rifiutato: "Rifiutato",
  escalato: "Escalato",
};

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const [ticketsRes, clientsRes] = await Promise.all([
          supabase.from("tickets").select("*").order("updated_at", { ascending: false }),
          supabase.from("clients").select("*").order("client", { ascending: true }),
        ]);

        if (ticketsRes.error) {
          console.error("[Admin] tickets error:", ticketsRes.error);
          setError(`Tickets: ${ticketsRes.error.message}`);
        } else {
          setTickets(ticketsRes.data || []);
        }

        if (clientsRes.error) {
          console.error("[Admin] clients error:", clientsRes.error);
        } else {
          setClients(clientsRes.data || []);
        }
      } catch (e: unknown) {
        console.error("[Admin] fetch error:", e);
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) return <main className="page-shell"><p>Caricamento...</p></main>;
  if (error) return <main className="page-shell"><p>Errore: {error}</p></main>;

  const openTickets = tickets.filter((t) => t.status !== "chiuso");
  const recentTickets = tickets.slice(0, 5);
  const slaAtRisk = openTickets.filter((t) => t.priority === "critica" || t.priority === "alta");

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Controllo assistenza tecnica</h1>
          <div className="hero-actions">
            <Link href="/ticket" className="primary-link">Ticket</Link>
            <Link href="/procedure" className="text-link">Procedures</Link>
            <Link href="/firmware-software" className="text-link">Firmware & Software</Link>
            <Link href="/admin/approvals" className="text-link">Approvazioni</Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="button-link">Logout</button>
            </form>
          </div>
        </div>
        <div className="hero-panel">
          <span className="panel-label">SLA</span>
          <strong>{slaAtRisk.length}</strong>
          <p>ticket in attenzione</p>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Ticket aperti</span>
          <strong>{openTickets.length}</strong>
        </article>
        <article className="stat-card">
          <span>Clienti attivi</span>
          <strong>{clients.length}</strong>
        </article>
        <article className="stat-card">
          <span>Aggiornamenti</span>
          <strong>{recentTickets.length}</strong>
        </article>
        <article className="stat-card">
          <span>Escalation</span>
          <strong>{openTickets.filter((t) => t.status === "escalato").length}</strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="surface">
          <div className="section-heading"><h2>Ticket aperti</h2></div>
          <div className="priority-columns">
            {Object.entries(priorityLabels).map(([priority, label]) => {
              const items = openTickets.filter((t) => t.priority === priority);
              return (
                <div key={priority} className="priority-column">
                  <div className="priority-header">
                    <span>{priority}</span>
                    <strong>{label}</strong>
                  </div>
                  <ul className="ticket-list">
                    {items.length ? items.map((t) => (
                      <li key={t.id} className="ticket-item">
                        <div>
                          <strong><Link href={`/ticket/${t.slug || t.id}`}>{t.id}</Link></strong>
                          <p>{t.title}</p>
                        </div>
                        <div className="ticket-meta">
                          <span>{t.client}</span>
                          <span>{statusLabels[t.status] || t.status}</span>
                        </div>
                      </li>
                    )) : <li className="empty-state">Nessun ticket</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </article>

        <article className="surface">
          <div className="section-heading"><h2>Follow-up</h2></div>
          <ul className="stack-list">
            {slaAtRisk.map((t) => (
              <li key={t.id} className="focus-item">
                <div>
                  <strong><Link href={`/ticket/${t.slug || t.id}`}>{t.id} · {t.client}</Link></strong>
                  <p>{t.title}</p>
                </div>
              </li>
            ))}
            {!slaAtRisk.length && <li className="empty-state">Nessuna urgenza</li>}
          </ul>
        </article>

        <article className="surface">
          <div className="section-heading"><h2>Clients</h2></div>
          <ul className="stack-list">
            {clients.map((c) => (
              <li key={c.client} className="client-item">
                <div>
                  <strong>{c.client}</strong>
                  <p>{c.main_contact || "Contatto n/d"}</p>
                </div>
                <span>{c.country || "Paese n/d"}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="surface">
          <div className="section-heading"><h2>Ultimi aggiornamenti</h2></div>
          <ul className="stack-list">
            {recentTickets.map((t) => (
              <li key={t.id} className="focus-item">
                <div>
                  <strong><Link href={`/ticket/${t.slug || t.id}`}>{t.id}</Link></strong>
                  <p>{t.title}</p>
                </div>
                <span>{t.updated_at}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="surface">
          <div className="section-heading"><h2>Risorse tecniche</h2></div>
          <div className="quick-links">
            <Link href="/procedure" className="quick-link-card"><strong>Procedures</strong></Link>
            <Link href="/firmware-software" className="quick-link-card"><strong>Firmware & Software</strong></Link>
          </div>
        </article>
      </section>
    </main>
  );
}
