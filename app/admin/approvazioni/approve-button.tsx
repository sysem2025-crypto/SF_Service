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
      body: JSON.stringify({ userId }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={handleApprove}
      className="primary-link button-reset"
      disabled={loading}
    >
      {loading ? "Approvazione..." : "Approva"}
    </button>
  );
}
