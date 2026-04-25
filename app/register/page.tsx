import Link from "next/link";

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const requested = params.requested === "1";

  return (
    <main className="page-shell auth-shell">
      <section className="surface auth-card">
        <div className="section-heading">
          <h2>Richiesta accesso</h2>
        </div>

        {requested && (
          <p className="auth-message success">
            Richiesta inviata.
          </p>
        )}
        {error && <p className="auth-message error">{error}</p>}

        <form action="/api/auth/register" method="post" className="auth-form">
          <label>
            <span>Nome e cognome</span>
            <input type="text" name="name" required />
          </label>
          <label>
            <span>Email</span>
            <input type="email" name="email" required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" required minLength={8} />
          </label>
          <button type="submit" className="primary-link button-reset">
            Invia
          </button>
        </form>

        <p className="auth-inline-links">
          Account esistente: <Link href="/login">accedi</Link>
        </p>
      </section>
    </main>
  );
}
