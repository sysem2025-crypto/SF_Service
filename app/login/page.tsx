import Link from "next/link";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  "invalid-credentials": "Email o password non validi.",
  "login-required": "Accesso richiesto.",
  "admin-required": "Area riservata."
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const registered = params.registered === "1";

  return (
    <main className="page-shell auth-shell">
      <section className="surface auth-card">
        <div className="section-heading">
          <h2>Accesso</h2>
        </div>

        {registered && <p className="auth-message success">Registrazione approvata.</p>}
        {error && <p className="auth-message error">{errorMessages[error] || "Accesso non riuscito."}</p>}

        <form action="/api/auth/login" method="post" className="auth-form">
          <label>
            <span>Email</span>
            <input type="email" name="email" required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" required minLength={8} />
          </label>
          <button type="submit" className="primary-link button-reset">
            Entra
          </button>
        </form>

        <p className="auth-inline-links">
          Nuovo account: <Link href="/register">richiedi accesso</Link>
        </p>
      </section>
    </main>
  );
}
