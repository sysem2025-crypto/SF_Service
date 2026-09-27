"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const errorMessages: Record<string, string> = {
  "invalid-credentials": "Email o password non validi.",
  "login-required": "Accesso richiesto.",
  "admin-required": "Area riservata.",
  "email-not-confirmed": "Conferma la tua email prima di accedere.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/ticket/nuovo";
  const error = searchParams.get("error") || "";
  const registered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setFormError((error.code && errorMessages[error.code]) || error.message);
      return;
    }

    window.location.href = redirectTo;
    router.refresh();
  }

  return (
    <main className="page-shell auth-shell">
      <div className="content-frame">
        <div className="page-heading">
          <h1 className="page-title">Accesso</h1>
          <p className="page-subtitle">Per usare lo stesso account, entra prima dall'area riservata SYSEM.</p>
        </div>

        <div className="page-body">
          <section className="surface auth-card">
            {registered && <p className="auth-message success">Registrazione completata. Ora puoi accedere.</p>}
            {(error || formError) && <p className="auth-message error">{formError || errorMessages[error] || "Accesso non riuscito."}</p>}

            <form onSubmit={handleSubmit} className="auth-form">
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                />
              </label>
              <button type="submit" className="btn-download" disabled={loading}>
                {loading ? "Accesso..." : "Entra"}
              </button>
            </form>

            <p className="auth-inline-links">
              <a href="https://www.sysem.it/ticketing.html">Accedi dal sito SYSEM</a>
            </p>

            <p className="auth-inline-links">
              Nuovo account: <Link href="/register">richiedi accesso</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
