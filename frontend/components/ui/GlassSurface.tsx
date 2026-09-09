"use client";

import React, { ReactNode, useState } from "react";

interface GlassSurfaceProps {
  children: ReactNode;
  className?: string;
  intensity?: "subtle" | "medium" | "deep";
  borderGlow?: boolean;
}

export default function GlassSurface({
  children,
  className = "",
  intensity = "medium",
  borderGlow = true,
}: GlassSurfaceProps) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const backdropClass = {
    subtle: "bg-white/60 backdrop-blur-md",
    medium: "bg-white/80 backdrop-blur-xl",
    deep: "bg-white/92 backdrop-blur-2xl",
  }[intensity];

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${backdropClass} ${className}`}
      style={{
        boxShadow: isHovered
          ? "0 20px 40px -15px rgba(23, 23, 23, 0.08), 0 0 0 1px rgba(233, 104, 27, 0.25)"
          : "0 10px 30px -10px rgba(23, 23, 23, 0.05), 0 0 0 1px rgba(222, 220, 213, 0.9)",
      }}
    >
      {/* Subtle specular reflection layer tracking cursor */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
        style={{
          background: isHovered
            ? `radial-gradient(circle 280px at ${mousePos.x}% ${mousePos.y}%, rgba(233, 104, 27, 0.08), transparent 70%)`
            : "none",
        }}
      />

      {/* Hairline glass refraction rim */}
      <div className="absolute inset-0 rounded-2xl border border-white/80 pointer-events-none" />

      {/* Internal Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export { GlassSurface };
