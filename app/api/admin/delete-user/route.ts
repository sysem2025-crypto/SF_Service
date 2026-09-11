import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const adminEmail = request.headers.get("x-admin-email");

  if (!adminEmail || !adminEmail.endsWith("@sysem.it")) {
    return NextResponse.json({ error: "non authorized" }, { status: 403 });
  }

  const body = await request.json();
  const userId = body.userId;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await adminClient.from("profiles").delete().eq("id", userId);

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error("[DeleteUser] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
