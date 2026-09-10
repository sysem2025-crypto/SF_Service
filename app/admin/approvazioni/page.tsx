import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import ApproveButton from "./approve-button";

export default async function AdminApprovalsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: pendingUsers } = await supabase
    .from("profiles")
    .select("id, full_name, role, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const users = pendingUsers || [];

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
          <p>{users.length} richieste</p>
        </div>

        <div className="approval-list">
          {users.map((u) => (
            <article key={u.id} className="document-card">
              <strong>{u.full_name || "Senza nome"}</strong>
              <p>ID: {u.id}</p>
              <p>Ruolo: {u.role}</p>
              <p>Registrato: {u.created_at?.slice(0, 10)}</p>
              <ApproveButton userId={u.id} />
            </article>
          ))}
          {!users.length && (
            <p className="empty-state">Nessuna richiesta in attesa.</p>
          )}
        </div>
      </section>
    </main>
  );
}
