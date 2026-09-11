import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function normalizeRole(role: unknown) {
  return String(role || "").trim().toLowerCase();
}

function isConfiguredAdminEmail(email: unknown) {
  const configured = process.env.ADMIN_EMAILS || "gianluca.piga@sysem.it";
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return configured
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalizedEmail);
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value }) =>
            supabaseResponse.cookies.set(name, value)
          );
        },
      },
    }
  );

  let {
    data: { user },
  } = await supabase.auth.getUser();

  const ssoToken = request.cookies.get("sso_access_token")?.value;

  if (!user && ssoToken) {
    const ssoRefresh = request.cookies.get("sso_refresh_token")?.value || "";
    const { data: ssoData } = await supabase.auth.setSession({
      access_token: ssoToken,
      refresh_token: ssoRefresh,
    });
    if (ssoData?.session?.user) {
      user = ssoData.session.user;
    }
  }

  const path = request.nextUrl.pathname;

  const protectedPaths = ["/ticket", "/my-tickets", "/procedure", "/firmware-software", "/admin"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));
  const isAuthPage = path.startsWith("/login") || path.startsWith("/register");

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (isProtected && user && !isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (profile && profile.status === "pending") {
      return NextResponse.redirect(new URL("/pending-approval", request.url));
    }
  }

  if (isAuthPage && user && request.nextUrl.searchParams.get("error") !== "admin-required") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  if (path.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = normalizeRole(profile?.role || user.app_metadata?.role || user.user_metadata?.role);
    if (role !== "admin" && !isConfiguredAdminEmail(user.email)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "admin-required");
      redirectUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
