import { NextResponse } from "next/server";
import {
  createSessionToken,
  isSecureCookieEnabled,
  sessionCookieName
} from "@/lib/auth";
import { getUserByEmail, verifyPassword } from "@/lib/users";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const user = getUserByEmail(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.redirect(
      new URL("/login?error=invalid-credentials", request.url),
      303
    );
  }

  const response = NextResponse.redirect(
    new URL(user.role === "admin" ? "/admin" : "/ticket/nuovo", request.url),
    303
  );

  response.cookies.set(sessionCookieName, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookieEnabled(),
    path: "/"
  });

  return response;
}
