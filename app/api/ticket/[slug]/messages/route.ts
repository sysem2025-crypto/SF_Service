import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";

type MessageRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: MessageRouteProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { slug } = await params;
  const { page = 1, per_page = 50 } = Object.fromEntries(
    new URLSearchParams(request.url.split("?")[1] || "").entries()
  ) as { page?: string; per_page?: string };

  const start = (Number(page) - 1) * Number(per_page);

  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", slug)
    .order("created_at", { ascending: true })
    .range(start, start + Number(per_page) - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { count } = await supabase
    .from("ticket_messages")
    .select("*", { count: "exact", head: true })
    .eq("ticket_id", slug);

  return NextResponse.json({
    messages: data || [],
    total: count || 0,
    page: Number(page),
    per_page: Number(per_page),
  });
}

export async function POST(request: Request, { params }: MessageRouteProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json();
  const { content, content_type = "text", internal = false, attachments = [] } = body;

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Contenuto vuoto" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("ticket_messages")
    .insert({
      ticket_id: slug,
      sender_id: user.id,
      sender_name: profile?.full_name || user.user_metadata?.full_name || user.email || "",
      sender_email: user.email || "",
      sender_role: profile?.role || "user",
      content: content.trim(),
      content_type,
      internal,
      attachments,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data }, { status: 201 });
}
