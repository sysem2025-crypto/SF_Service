"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "";
  const requested = searchParams.get("requested") === "1";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push("/register?requested=1");
    router.refresh();
  }

  return (
    <main className="page-shell auth-shell">
      <section className="surface auth-card">
        <div className="section-heading">
          <h2>Richiesta accesso</h2>
        </div>

        {requested && (
          <p className="auth-message success">
            Registrazione inviata. Controlla la tua email per confermare l'account.
          </p>
        )}
        {(error || formError) && <p className="auth-message error">{formError || error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Nome e cognome</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </label>
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
          <button type="submit" className="primary-link button-reset" disabled={loading}>
            {loading ? "Invio..." : "Invia"}
          </button>
        </form>

        <p className="auth-inline-links">
          Account esistente: <Link href="/login">accedi</Link>
        </p>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
