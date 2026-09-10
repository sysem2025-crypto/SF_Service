import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || password.length < 8) {
    return NextResponse.redirect(
      new URL("/register?error=Dati%20non%20validi.", request.url),
      303
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/login?registered=1`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/register?error=${encodeURIComponent(error.message)}`, request.url),
      303
    );
  }

  return NextResponse.redirect(new URL("/register?requested=1", request.url), 303);
}