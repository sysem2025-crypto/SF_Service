import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const refreshToken = url.searchParams.get("refresh_token") || "";
  const redirect = url.searchParams.get("redirect") || "/ticket";

  if (!token) {
    return NextResponse.redirect(
      new URL(`/login?error=no-token&redirect=${encodeURIComponent(redirect)}`, request.url),
      303
    );
  }

  try {
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
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    if (refreshToken) {
      response.cookies.set("sso_refresh_token", refreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    response.cookies.set("sso_user_email", user.email, {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error("[SSO] Error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=session-error&redirect=${encodeURIComponent(redirect)}`, request.url),
      303
    );
  }
}
