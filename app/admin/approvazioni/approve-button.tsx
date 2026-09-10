"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApproveButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await fetch("/api/admin/approve-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "approve" }),
    });
    router.refresh();
  }

  async function handleReject() {
    setLoading(true);
    await fetch("/api/admin/approve-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "reject" }),
    });
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
      <button
        onClick={handleApprove}
        className="primary-link button-reset"
        disabled={loading}
      >
        {loading ? "..." : "Approva"}
      </button>
      <button
        onClick={handleReject}
        className="nav-button"
        style={{ color: "var(--danger-text)", borderColor: "var(--danger-text)" }}
        disabled={loading}
      >
        {loading ? "..." : "Elimina"}
      </button>
    </div>
  );
}
