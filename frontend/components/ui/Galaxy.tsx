"use client";

import React, { useEffect, useRef } from "react";

interface GalaxyProps {
  transparent?: boolean;
  density?: number;
  speed?: number;
  className?: string;
  mouseInteraction?: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  speedX: number;
  speedY: number;
  color: string;
}

export default function Galaxy({
  transparent = true,
  density = 45,
  speed = 0.3,
  className = "",
  mouseInteraction = true,
}: GalaxyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    const particles: Particle[] = [];
    const count = Math.floor((width * height) / (18000 / (density / 40)));

    const colors = [
      "rgba(23, 23, 23,",     // Charcoal
      "rgba(102, 99, 93,",    // Muted slate
      "rgba(233, 104, 27,",   // OrCom Orange accent
    ];

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        // Mostly charcoal/muted, very occasional subtle orange
        const isOrange = Math.random() < 0.08;
        const colorPrefix = isOrange ? colors[2] : Math.random() < 0.7 ? colors[0] : colors[1];
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.6 + 0.5,
          alpha: Math.random() * 0.18 + 0.04,
          targetAlpha: Math.random() * 0.22 + 0.05,
          speedX: (Math.random() - 0.5) * speed * 0.35,
          speedY: (Math.random() - 0.5) * speed * 0.35,
          color: colorPrefix,
        });
      }
    };

    initParticles();

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      if (!transparent) {
        ctx.fillStyle = "#F7F6F2";
        ctx.fillRect(0, 0, width, height);
      }

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap edges gently
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Subtle twinkling
        if (tick % 20 === 0 && Math.random() < 0.1) {
          p.targetAlpha = Math.random() * 0.22 + 0.04;
        }
        p.alpha += (p.targetAlpha - p.alpha) * 0.03;

        // Subtle mouse repulsion / gravitational influence
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && dist > 0) {
            p.x -= (dx / dist) * 0.4;
            p.y -= (dy / dist) * 0.4;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [transparent, density, speed, mouseInteraction]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-auto"
        style={{ display: "block" }}
      />
    </div>
  );
}

export { Galaxy };
