import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#F7F6F2] text-[#171717] antialiased selection:bg-[#E9681B] selection:text-white">
        <Header />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-[#DEDCD5] bg-[#F7F6F2] py-5 text-xs text-[#66635D]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#171717]">OrCom</span>
              <span>— Spacecraft as Infrastructure. Software as the Product.</span>
            </div>
            <div className="font-mono text-[11px] text-[#78746D]">
              SIMULATED ORBITAL INFRASTRUCTURE • MOCKPROVIDER V1.0
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
