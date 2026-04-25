import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SF Service Portal",
  description: "Portale assistenza tecnica"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
