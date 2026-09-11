import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const refreshToken = url.searchParams.get("refresh_token") || "";
  const redirect = url.searchParams.get("redirect") || "/";

  if (!token) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login?error=no-token" },
    });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login?error=invalid-token" },
      });
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
document.cookie = "sso_access_token=${token.replace(/'/g, "\\'")}; path=/; max-age=86400; SameSite=Lax";
document.cookie = "sso_refresh_token=${refreshToken.replace(/'/g, "\\'")}; path=/; max-age=86400; SameSite=Lax";
document.cookie = "sso_user_email=${user.email.replace(/'/g, "\\'")}; path=/; max-age=86400; SameSite=Lax";
window.location.href = ${JSON.stringify(redirect)};
</script></body></html>`;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("[SSO] Error:", err);
    return new Response(null, {
      status: 302,
      headers: { Location: "/login?error=session-error" },
    });
  }
}
