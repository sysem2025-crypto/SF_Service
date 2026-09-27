import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

type MessageRouteProps = {
  params: Promise<{ slug: string; messageId: string }>;
};

export async function GET(request: Request, { params }: MessageRouteProps) {
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { messageId } = await params;
  const db = createAdminClient();
  const { data, error } = await db
    .from("ticket_messages")
    .select("*")
    .eq("id", messageId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Messaggio non trovato" }, { status: 404 });
  }

  return NextResponse.json({ message: data });
}

export async function DELETE(request: Request, { params }: MessageRouteProps) {
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { messageId } = await params;
  const db = createAdminClient();

  const { data, error } = await db
    .from("ticket_messages")
    .select("sender_id")
    .eq("id", messageId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Messaggio non trovato" }, { status: 404 });
  }

  if (data.sender_id !== user.id) {
    const { data: profile } = await auth
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }
  }

  const { error: deleteError } = await db
    .from("ticket_messages")
    .delete()
    .eq("id", messageId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
