"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/supabase-provider";
import { createClient } from "@/lib/supabase";
import type { Route } from "next";

const navItems: { href: Route; label: string }[] = [
  { href: "/my-tickets", label: "I miei ticket" },
  { href: "/ticket/nuovo", label: "Nuovo ticket" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const pathname = usePathname();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = "https://sysem.it";
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link href="/" className="app-logo" aria-label="SYSEM service portal">
          <img src="/sysem-logo.jpeg" alt="Logo SYSEM" />
          <span>
            <strong>SYSEM</strong>
            <small>Service Portal</small>
          </span>
        </Link>
        <nav className="app-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="nav-link nav-button">
            Esci
          </button>
        </nav>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <span>SF Service Portal &mdash; SYSEM</span>
        {session?.user?.email && <span>{session.user.email}</span>}
      </footer>
    </div>
  );
}
