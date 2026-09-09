"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Activity,
  Orbit,
  Layers,
  Shield,
  Radio,
  Sliders
} from "lucide-react";
import FloatingIDE from "./FloatingIDE";

export default function Header() {
  const pathname = usePathname();
  const [isIDEOpen, setIsIDEOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Missions", href: "/missions" },
    { label: "Satellites", href: "/satellites" },
    { label: "Architecture", href: "/architecture" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#DEDCD5] bg-[#F7F6F2]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center space-x-8">
            <a href="/" className="flex items-center space-x-2 text-[#171717] group">
              {/* Minimal geometric OrCom mark */}
              <div className="w-5 h-5 rounded-[4px] bg-[#171717] flex items-center justify-center relative">
                <div className="w-2 h-2 rounded-full bg-[#E9681B]" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#171717] uppercase">
                OrCom
              </span>
              <span className="text-[10px] font-mono text-[#66635D] tracking-wider uppercase border-l border-[#DEDCD5] pl-2 hidden sm:inline">
                Orbital Compute
              </span>
            </a>

            {/* Navigation links - Linear style */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-1 rounded-[5px] text-xs font-medium transition-colors ${
                      isActive
                        ? "text-[#171717] bg-[#EAE8E1] font-semibold"
                        : "text-[#66635D] hover:text-[#171717] hover:bg-[#EFECE6]"
                    }`}
                  >
                    {item.label}
                  </a>
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
