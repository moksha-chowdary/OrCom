"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollExpandProps {
  initialContent?: ReactNode;
  expandedContent?: ReactNode;
  className?: string;
  minWidthPercent?: number; // e.g. 70% width initial
  maxWidthPercent?: number; // 100% full bleed
}

export default function ScrollExpand({
  initialContent,
  expandedContent,
  className = "",
  minWidthPercent = 75,
  maxWidthPercent = 100,
}: ScrollExpandProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start expansion when element is 20% into viewport, complete when centered
      const start = windowHeight * 0.85;
      const end = windowHeight * 0.2;

      if (rect.top > start) {
        setProgress(0);
      } else if (rect.top < end) {
        setProgress(1);
      } else {
        const currentProgress = (start - rect.top) / (start - end);
        setProgress(Math.min(Math.max(currentProgress, 0), 1));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentWidth = minWidthPercent + (maxWidthPercent - minWidthPercent) * progress;
  const currentRadius = 16 * (1 - progress); // smoothly drops border radius as it hits full bleed

  return (
    <div ref={containerRef} className={`relative w-full py-12 flex flex-col items-center overflow-hidden ${className}`}>
      {/* Expanding visual frame */}
      <div
        className="transition-all duration-150 ease-out mx-auto overflow-hidden shadow-md border border-[#DEDCD5]"
        style={{
          width: `${currentWidth}%`,
          borderRadius: `${currentRadius}px`,
          backgroundColor: "#FFFFFF",
        }}
      >
        <div className="relative w-full">
          {progress < 0.6 ? initialContent : expandedContent}
        </div>
      </div>
    </div>
  );
}

export { ScrollExpand };
