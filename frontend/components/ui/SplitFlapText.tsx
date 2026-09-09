"use client";

import React, { useEffect, useState } from "react";

interface SplitFlapTextProps {
  text: string;
  className?: string;
  padLength?: number;
  size?: "sm" | "md" | "lg";
}

export default function SplitFlapText({
  text,
  className = "",
  padLength = 0,
  size = "md",
}: SplitFlapTextProps) {
  const [displayedText, setDisplayedText] = useState(text);
  const [prevText, setPrevText] = useState(text);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (text !== displayedText) {
      setPrevText(displayedText);
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayedText(text);
        setAnimating(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [text, displayedText]);

  const targetLength = Math.max(text.length, padLength);
  const chars = displayedText.toUpperCase().padEnd(targetLength, " ").split("");

  const sizeClasses = {
    sm: "w-4 h-6 text-xs",
    md: "w-5 h-7 text-xs font-semibold",
    lg: "w-6 h-9 text-sm font-bold",
  };

  return (
    <div className={`inline-flex items-center gap-[2px] select-none ${className}`}>
      {chars.map((char, index) => (
        <div
          key={index}
          className={`relative ${sizeClasses[size]} bg-[#1C1C1F] text-[#F7F6F2] font-mono rounded-[3px] overflow-hidden flex items-center justify-center shadow-xs border border-[#2B2B30]`}
        >
          {/* Subtle horizontal flap split line */}
          <div className="absolute inset-x-0 top-1/2 h-[0.5px] bg-[#0A0A0C] z-10" />
          
          <span className={`transition-transform duration-200 ${animating ? "scale-y-75 opacity-70" : "scale-y-100 opacity-100"}`}>
            {char === " " ? "\u00A0" : char}
          </span>
        </div>
      ))}
    </div>
  );
}

export { SplitFlapText };

