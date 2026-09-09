"use client";

import React, { ReactNode } from "react";

interface BorderGlowProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
  glowColor?: string;
  color?: string;
}

export default function BorderGlow({
  children,
  active = false,
  className = "",
  glowColor = "#E9681B",
  color,
}: BorderGlowProps) {
  const finalColor = color || glowColor;

  return (
    <div
      className={`relative rounded-[10px] transition-all duration-200 ${
        active
          ? "border border-[#E9681B] shadow-[0_0_0_1px_#E9681B,0_2px_12px_rgba(233,104,27,0.12)]"
          : "border border-[#DEDCD5] hover:border-[#C5C2B8]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export { BorderGlow };

