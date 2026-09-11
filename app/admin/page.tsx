"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function AdminPage() {
  const [msg, setMsg] = useState("loading...");
  const [tickets, setTickets] = useState<unknown[]>([]);

  useEffect(() => {
    console.log("[Admin] mounted");
    const supabase = createClient();

    supabase.auth.getUser().then(({ data, error }) => {
      console.log("[Admin] getUser:", data?.user?.id, error?.message);
      if (!data?.user) {
        setMsg("Non autenticato");
        return;
      }

      supabase.from("tickets").select("*").order("updated_at", { ascending: false }).then(({ data: t, error: e }) => {
        console.log("[Admin] tickets:", t?.length, e?.message);
        if (e) {
          setMsg("Errore tickets: " + e.message);
        } else {
          setTickets(t || []);
          setMsg("OK - " + (t?.length || 0) + " tickets");
        }
      });
    });
  }, []);

  return (
    <main className="page-shell">
      <p>{msg}</p>
      {tickets.length === 0 && <p>Nessun ticket</p>}
      <ul>
        {(tickets as {id: string; title: string}[]).map(t => (
          <li key={t.id}>{t.id} - {t.title}</li>
        ))}
      </ul>
      <form action="/api/auth/logout" method="post">
        <button type="submit">Logout</button>
      </form>
    </main>
  );
}
