"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  ArrowRight,
  Orbit,
  Layers,
  Activity
} from "lucide-react";
import FloatingIDE from "./FloatingIDE";

export default function Header() {
  const pathname = usePathname();
  const [isIDEOpen, setIsIDEOpen] = useState(false);

  const isLanding = pathname === "/";

  // Navigation items for the developer console / app
  const consoleNavItems = [
    { label: "Console", href: "/console" },
    { label: "Missions", href: "/missions" },
    { label: "Satellites", href: "/satellites" },
    { label: "Architecture", href: "/architecture" },
  ];

  // Navigation items for the public landing page (§25)
  const landingNavItems = [
    { label: "About", href: "#problem" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Technology", href: "#runtime" },
    { label: "Vision", href: "#vision" },
  ];

  if (isLanding) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-[#DEDCD5]/80 bg-[#F7F6F2]/90 backdrop-blur-md transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center space-x-2 text-[#171717] group">
            <div className="w-5 h-5 rounded-[4px] bg-[#171717] flex items-center justify-center relative shadow-xs">
              <div className="w-2 h-2 rounded-full bg-[#E9681B]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#171717] uppercase">
              OrCom
            </span>
          </Link>

          {/* Minimal Landing Nav Links (§25) */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-[#66635D]">
            {landingNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-[#171717] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Primary CTA button (§25) */}
          <Link
            href="/console"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#171717] hover:bg-[#2B2B2B] text-white text-xs font-medium transition-all shadow-xs group"
          >
            <span>START EXPLORING</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E9681B] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>
    );
  }

  // Developer Infrastructure Shell Header
  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#DEDCD5] bg-[#F7F6F2]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-[#171717] group">
              <div className="w-5 h-5 rounded-[4px] bg-[#171717] flex items-center justify-center relative">
                <div className="w-2 h-2 rounded-full bg-[#E9681B]" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#171717] uppercase">
                OrCom
              </span>
              <span className="text-[10px] font-mono text-[#66635D] tracking-wider uppercase border-l border-[#DEDCD5] pl-2 hidden sm:inline">
                Orbital Compute
              </span>
            </Link>

            {/* Navigation links - Linear style */}
            <nav className="hidden md:flex items-center space-x-1">
              {consoleNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/console" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-1 rounded-[5px] text-xs font-medium transition-colors ${
                      isActive
                        ? "text-[#171717] bg-[#EAE8E1] font-semibold"
                        : "text-[#66635D] hover:text-[#171717] hover:bg-[#EFECE6]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Infrastructure telemetry & IDE trigger */}
          <div className="flex items-center space-x-3">
            {/* System Provider Status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-[5px] bg-[#EFECE6] border border-[#DEDCD5] text-[11px] font-mono text-[#66635D]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E9681B]" />
              <span>MockProvider</span>
              <span className="text-[#A5A198]">•</span>
              <span className="text-[#171717]">Ready</span>
            </div>

            {/* Launch Floating IDE */}
            <button
              onClick={() => setIsIDEOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] bg-[#171717] hover:bg-[#2B2B2B] text-white text-xs font-medium transition-colors shadow-xs"
            >
              <Terminal className="w-3.5 h-3.5 text-[#E9681B]" />
              <span>Launch IDE</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating IDE Modal */}
      <FloatingIDE isOpen={isIDEOpen} onClose={() => setIsIDEOpen(false)} />
    </>
  );
}
