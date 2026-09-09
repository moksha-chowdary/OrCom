"use client";

import React, { useEffect, useState } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function BlurText({
  text,
  className = "",
  delay = 50,
}: BlurTextProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const words = text.split(" ");

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          className="inline-block mr-[0.25em] transition-all duration-700 ease-out"
          style={{
            filter: mounted ? "blur(0px)" : "blur(8px)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(6px)",
            transitionDelay: `${wordIndex * delay}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export { BlurText };

