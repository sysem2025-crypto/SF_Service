"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/supabase-provider";
import { createClient } from "@/lib/supabase";
import type { Route } from "next";

const navItems: { href: Route; label: string }[] = [
  { href: "/my-tickets", label: "I miei ticket" },
  { href: "/ticket/nuovo", label: "Nuovo ticket" },
  { href: "/admin", label: "Admin" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const pathname = usePathname();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = "https://sysem.it";
  }

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  return (
    <div className="site">
      <header className="site-header">
        <div className="site-header__left">
          <Link href="/" className="app-logo" aria-label="SYSEM service portal">
            <img src="/sysem-logo.jpeg" alt="Logo SYSEM" />
            <span>
              <strong>SYSEM</strong>
              <small>Assistenza tecnica</small>
            </span>
          </Link>
          <span className="app-header__menu">Service desk</span>
          <button className="nav-toggle" id="menu-toggle" onClick={toggleMenu} aria-label="Apri menu">
            <span></span><span></span><span></span>
          </button>
        </div>
        <nav className={`app-nav${menuOpen ? " open" : ""}`} id="overlay-menu">
          {session ? (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${pathname === item.href ? " active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="nav-link nav-button">
                Esci
              </button>
            </>
          ) : (
            <a href="https://www.sysem.it/ticketing.html" className="nav-link" onClick={() => setMenuOpen(false)}>
              Accedi da SYSEM
            </a>
          )}
        </nav>
      </header>

      <main className="site-body">
        <div className="content-frame">
          {children}
        </div>
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>SYSEM</span>
          {session?.user?.email && <span>{session.user.email}</span>}
        </div>
      </footer>
    </div>
  );
}
