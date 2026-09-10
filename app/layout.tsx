import type { Metadata } from "next";
import "./globals.css";
import SupabaseProvider from "@/components/supabase-provider";

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
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}