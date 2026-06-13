import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSessionToken, isSecureCookieEnabled, sessionCookieName } from "@/lib/auth";
import { getUserByEmail, createUser } from "@/lib/users";

const SYSEM_API = process.env.SYSEM_API_URL || "https://gianluca-ai-ten.vercel.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const redirectTo = searchParams.get("redirect") || "/ticket/nuovo";

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing", request.url), 303);
  }

  try {
    const res = await fetch(`${SYSEM_API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
    }

    const data = await res.json();
    if (!data.authenticated || !data.user?.email) {
      return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
    }

    const { email, name } = data.user;
    let user = getUserByEmail(email);

    if (!user) {
      user = createUser({
        name: name || email.split("@")[0],
        email,
        password: crypto.randomUUID() + crypto.randomUUID(),
        role: "user"
      });
    }

    const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);

    response.cookies.set(sessionCookieName, createSessionToken(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecureCookieEnabled(),
      path: "/"
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=session", request.url), 303);
  }
}
