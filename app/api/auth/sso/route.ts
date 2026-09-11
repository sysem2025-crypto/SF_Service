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

    let { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      console.log("[SSO] getUser failed:", error?.message || "no user", "trying refresh_token...");
      if (refreshToken) {
        const { data: refreshData, error: refreshError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: refreshToken,
        });
        if (!refreshError && refreshData?.user?.email) {
          user = refreshData.user;
          const newToken = refreshData.session?.access_token || token;
          const newRefresh = refreshData.session?.refresh_token || refreshToken;
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
var t = ${JSON.stringify(newToken)};
var r = ${JSON.stringify(newRefresh)};
document.cookie = "sso_access_token=" + t + "; path=/; max-age=86400; SameSite=Lax";
document.cookie = "sso_refresh_token=" + r + "; path=/; max-age=86400; SameSite=Lax";
document.cookie = "sso_user_email=" + encodeURIComponent(${JSON.stringify(user.email)}) + "; path=/; max-age=86400; SameSite=Lax";
window.location.href = ${JSON.stringify(redirect)};
</script></body></html>`;
          return new Response(html, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
        console.log("[SSO] Refresh also failed:", refreshError?.message || "unknown");
      }
      return new Response(null, {
        status: 302,
        headers: { Location: "/login?error=invalid-token" },
      });
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
var p = new URLSearchParams(window.location.search);
var t = p.get("token");
var r = p.get("refresh_token");
var d = p.get("redirect") || "/";
document.cookie = "sso_access_token=" + t + "; path=/; max-age=86400; SameSite=Lax";
document.cookie = "sso_refresh_token=" + r + "; path=/; max-age=86400; SameSite=Lax";
document.cookie = "sso_user_email=" + encodeURIComponent("${user.email}") + "; path=/; max-age=86400; SameSite=Lax";
window.location.href = d;
</script></body></html>`;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("[SSO] Error:", err);
    return new Response(null, {
      status: 302,
      headers: { Location: "/login?error=session-error" },
    });
  }
}
