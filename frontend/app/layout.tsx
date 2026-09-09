import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "OrCom — Orbital Edge Compute Platform",
  description: "Developer platform proving orbital software lifecycle: Upload → Validate → Simulate → Schedule → Deploy → Result",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-[#1e2838] bg-[#07090e] py-6 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-cyan-400 font-semibold">OrCom Platform</span>
              <span>— Spacecraft as Infrastructure, Software as the Product</span>
            </div>
            <div className="font-mono text-slate-400">
              Iteration 1 Priority Prototype • All flight data simulated via MockProvider
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
