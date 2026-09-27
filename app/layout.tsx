import type { Metadata } from "next";
import "./globals.css";
import SupabaseProvider from "@/components/supabase-provider";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "SYSEM | Assistenza tecnica",
  description: "Portale assistenza tecnica SYSEM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body data-page="ticketing">
        <SupabaseProvider>
          <AppShell>{children}</AppShell>
        </SupabaseProvider>
      </body>
    </html>
  );
}
