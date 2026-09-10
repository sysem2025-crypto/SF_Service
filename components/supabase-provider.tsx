"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const SessionContext = createContext<Session | null>(null);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export function useSession() {
  return useContext(SessionContext);
}

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        return;
      }
      const accessToken = getCookie("sso_access_token");
      const refreshToken = getCookie("sso_refresh_token");
      if (accessToken) {
        const { data } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });
        setSession(data.session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
