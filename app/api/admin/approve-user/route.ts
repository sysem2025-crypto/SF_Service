import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json();
  const userId = body.userId;
  const action = body.action || "approve";

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = await createClient();

  if (action === "reject") {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("[Reject] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("[Approve] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
