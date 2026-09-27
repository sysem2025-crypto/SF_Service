import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await requireAdmin();
  const { slug } = await params;

  const { searchParams } = new URL(request.url);
  const createdAt = searchParams.get("created_at");
  const updatedAt = searchParams.get("updated_at");

  if (!createdAt && !updatedAt) {
    return NextResponse.json({ error: "Nessuna data da aggiornare" }, { status: 400 });
  }

  const supabase = await createClient();
  const updates: Record<string, string> = {};

  if (createdAt) {
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "created_at non valida" }, { status: 400 });
    }
    updates.created_at = d.toISOString();
  }

  if (updatedAt) {
    const d = new Date(updatedAt);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "updated_at non valida" }, { status: 400 });
    }
    updates.updated_at = d.toISOString();
  }

  const { error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("slug", params.slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
