import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
}

function normalizeRole(role: unknown) {
  return String(role || "").trim().toLowerCase();
}

function metadataRole(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }) {
  return normalizeRole(user.app_metadata?.role || user.user_metadata?.role);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    role: normalizeRole(profile?.role) || metadataRole(user) || "user",
    full_name: profile?.full_name ?? null,
  };
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login?error=admin-required&redirect=/admin");
  }
  return user;
}
