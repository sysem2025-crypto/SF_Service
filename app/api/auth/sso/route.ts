import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirect = url.searchParams.get("redirect") || "/ticket/nuovo";

  if (!token) {
    return NextResponse.redirect(
      new URL(`/login?error=no-token&redirect=${encodeURIComponent(redirect)}`, request.url),
      303
    );
  }

  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user || !user.email) {
    return NextResponse.redirect(
      new URL(`/login?error=invalid-token&redirect=${encodeURIComponent(redirect)}`, request.url),
      303
    );
  }

  const response = NextResponse.redirect(new URL(redirect, request.url), 303);

  response.cookies.set("sso_access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  response.cookies.set("sso_user_email", user.email, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
