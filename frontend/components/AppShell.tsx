"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "./Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <>
      <Header />
      <main className={isLanding ? "flex-1 w-full" : "flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6"}>
        {children}
      </main>
      
      {/* Footer */}
      {isLanding ? (
        <footer className="border-t border-[#DEDCD5] bg-[#F7F6F2] py-12 text-xs text-[#66635D]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-[4px] bg-[#171717] flex items-center justify-center relative">
                <div className="w-2 h-2 rounded-full bg-[#E9681B]" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#171717] uppercase">OrCom</span>
              <span className="text-[#A5A198]">•</span>
              <span>Spacecraft as Infrastructure. Software as the Product.</span>
            </div>

            <div className="flex items-center space-x-6 font-mono text-[11px] text-[#66635D]">
              <Link href="/console" className="hover:text-[#171717] transition-colors">
                Console
              </Link>
              <Link href="/satellites" className="hover:text-[#171717] transition-colors">
                Constellation
              </Link>
              <Link href="/architecture" className="hover:text-[#171717] transition-colors">
                Architecture
              </Link>
              <span className="text-[#A5A198]">© {new Date().getFullYear()} OrCom</span>
            </div>
          </div>
        </footer>
      ) : (
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
      )}
    </>
  );
}
