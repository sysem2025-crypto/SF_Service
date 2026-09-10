import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const admin = await requireAdmin();

  const body = await request.json();
  const userId = body.userId;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[Approve] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
