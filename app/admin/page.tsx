"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AdminPage() {
  const [msg, setMsg] = useState("mounted");

  useEffect(() => {
    console.log("[Admin] page mounted");
    const supabase = createClient();

    supabase.auth.getUser().then(({ data, error }) => {
      console.log("[Admin] user:", data?.user?.id ?? "null", "error:", error?.message ?? "none");
      if (!data?.user) {
        setMsg("NO USER - non autenticato");
        return;
      }

      supabase.from("tickets").select("*").then(({ data: t, error: e }) => {
        console.log("[Admin] tickets:", t?.length ?? "null", "error:", e?.message ?? "none");
        setMsg("OK user=" + data.user.email + " tickets=" + (t?.length ?? 0));
      });
    }).catch((e) => {
      console.error("[Admin] catch:", e);
      setMsg("CATCH: " + String(e));
    });
  }, []);

  return (
    <main style={{ padding: 40 }}>
      <h1>Admin Debug</h1>
      <p>{msg}</p>
      <p>Apri Console (F12) per i log completi.</p>
    </main>
  );
}
