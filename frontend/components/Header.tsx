"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import {
  Orbit,
  Terminal,
  Activity,
  Satellite as SatelliteIcon,
  Shield,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";
import FloatingIDE from "./FloatingIDE";

export default function Header() {
  const pathname = usePathname();
  const [isIDEOpen, setIsIDEOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Missions", href: "/missions" },
    { label: "Constellation Fleet", href: "/satellites" },
    { label: "Architecture", href: "/architecture" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#1e2838] bg-[#07090e]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-6">
            <a href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Orbit className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg tracking-tight text-white font-mono">
                    OrCom
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                    MVP v1.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 -mt-1 hidden sm:inline">
                  Orbital Edge Compute Platform
                </span>
              </div>
            </a>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? "text-cyan-300 bg-[#141b29] border border-[#222e42]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#0f1420]"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Provider Seam Indicator */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#0e131d] border border-[#1e2838] text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Provider:</span>
              <span className="text-cyan-400 font-semibold">MockProvider</span>
              <span className="text-slate-600">|</span>
              <span className="text-[10px] text-slate-400">Seam Verified</span>
            </div>

            {/* Launch Floating IDE CTA Button */}
            <button
              onClick={() => setIsIDEOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
            >
              <Terminal className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Launch Floating IDE</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating IDE Modal Component */}
      <FloatingIDE isOpen={isIDEOpen} onClose={() => setIsIDEOpen(false)} />
    </>
  );
}
