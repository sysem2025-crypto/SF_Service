export default function PendingApprovalPage() {
  return (
    <main className="page-shell auth-shell">
      <section className="surface auth-card">
        <div className="section-heading">
          <h2>Account in attesa</h2>
        </div>
        <p className="auth-message">
          Il tuo account è in attesa di approvazione da parte di un amministratore.
          Riceverai accesso non appena verrai approvato.
        </p>
      </section>
    </main>
  );
}
