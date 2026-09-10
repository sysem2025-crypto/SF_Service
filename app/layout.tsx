import type { Metadata } from "next";
import "./globals.css";
import SupabaseProvider from "@/components/supabase-provider";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "SF Service Portal",
  description: "Portale assistenza tecnica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <SupabaseProvider>
          <AppShell>{children}</AppShell>
        </SupabaseProvider>
      </body>
    </html>
  );
}