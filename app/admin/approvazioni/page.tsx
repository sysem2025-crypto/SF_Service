import { requireAdmin } from "@/lib/auth";
import { getPendingApprovals } from "@/lib/approval";

export default async function AdminApprovalsPage() {
  await requireAdmin();
  const approvals = getPendingApprovals().filter((item) => item.status === "pending");

  return (
    <main className="page-shell">
      <section className="section-intro">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="section-title">Approvazioni</h1>
        </div>
      </section>

      <section className="surface">
        <div className="section-heading">
          <h2>Utenti in attesa</h2>
          <p>{approvals.length} richieste</p>
        </div>

        <div className="approval-list">
          {approvals.map((approval) => (
            <article key={approval.id} className="document-card">
              <strong>{approval.name}</strong>
              <p>{approval.email}</p>
              <p>{approval.createdAt.slice(0, 10)}</p>
              <form action="/api/admin/approve-user" method="post">
                <input type="hidden" name="approvalId" value={approval.id} />
                <button type="submit" className="primary-link button-reset">
                  Approva
                </button>
              </form>
            </article>
          ))}
          {!approvals.length && (
            <p className="empty-state">Nessuna richiesta.</p>
          )}
        </div>
      </section>
    </main>
  );
}
