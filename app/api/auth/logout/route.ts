import { NextResponse } from "next/server";
import { isSecureCookieEnabled, sessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureCookieEnabled(),
    path: "/",
    expires: new Date(0)
  });

  return response;
}
