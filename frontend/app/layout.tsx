import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "OrCom — Orbital Computing Platform",
  description: "Developer platform for running software on spacecraft. Spacecraft is infrastructure, software is the product.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#F7F6F2] text-[#171717] antialiased selection:bg-[#E9681B] selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
