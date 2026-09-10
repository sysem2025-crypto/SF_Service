import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirect") || "/ticket/nuovo");

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=invalid-credentials&redirect=${encodeURIComponent(redirectTo)}`, request.url),
      303
    );
  }

  return NextResponse.redirect(new URL(redirectTo, request.url), 303);
}