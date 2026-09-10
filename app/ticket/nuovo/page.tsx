"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const priorityOptions = [
  { value: "critica", label: "Critica" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "bassa", label: "Bassa" },
];

export default function NewTicketPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const router = useRouter();
  const params = use(searchParams);
  const createdTicketId = typeof params.created === "string" ? params.created : "";

  const [client, setClient] = useState("");
  const [product, setProduct] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("media");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    console.log("[Ticket] getUser:", user ? user.email : "null", "cookies:", document.cookie.substring(0, 200));
    if (!user) {
      setError("Devi essere autenticato");
      setLoading(false);
      return;
    }

    const { error: insertError, data } = await supabase
      .from("tickets")
      .insert({
        title,
        client,
        description,
        priority,
        category: "",
        product,
        tags: [],
        status: "aperto",
        created_by_email: user.email,
        created_by_name: user.user_metadata?.full_name,
        assignee: "",
        channel: "web",
        contact_name: contactName,
        contact_email: contactEmail,
      })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/ticket/nuovo?created=${data.id}`);
    router.refresh();
  }

  return (
    <main className="page-shell auth-shell">
      <section className="surface auth-card ticket-form-card">
        <div className="section-heading">
          <h2>Nuovo ticket</h2>
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

        {error && <p className="auth-message error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Cliente</span>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          <label>
            <span>Prodotto o dispositivo</span>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          <label>
            <span>Titolo</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          <label>
            <span>Priorità</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={loading}
            >
              {priorityOptions.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Referente cliente</span>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          <label>
            <span>Email referente</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>
          <label>
            <span>Descrizione</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              required
              disabled={loading}
            />
          </label>
          <button type="submit" className="primary-link button-reset" disabled={loading}>
            {loading ? "Invio..." : "Invia ticket"}
          </button>
        </form>
      </section>
    </main>
  );
}