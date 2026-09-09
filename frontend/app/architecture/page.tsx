"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Layers,
  Cpu,
  Orbit,
  Lock,
  ArrowRight,
  Radio,
  FileCode,
  Terminal,
  Zap,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Server
} from "lucide-react";
import { BorderGlow } from "@/components/ui/BorderGlow";

export default function ArchitecturePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border border-[#DEDCD5] bg-white rounded-xl p-6 sm:p-8 shadow-sm space-y-3">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#F7F6F2] border border-[#DEDCD5] text-xs font-mono text-[#171717] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#E9681B]" />
          <span>SYSTEM ARCHITECTURE & SECURITY BOUNDARY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight">
          Spacecraft as Infrastructure. Software as the Product.
        </h1>
        <p className="text-sm text-[#66635D] max-w-3xl leading-relaxed">
          OrCom abstracts heterogeneous satellite constellations into a familiar cloud programming model.
          Instead of downlinking raw multi-gigabyte sensory telemetry to overwhelmed ground stations, customer applications
          execute directly in orbit inside sandboxed runtime containers, transmitting only vector insights.
        </p>
      </div>

      {/* Architectural Diagram Representation */}
      <div className="border border-[#DEDCD5] bg-white rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#DEDCD5] pb-4">
          <span className="text-xs font-mono uppercase text-[#171717] font-bold">
            Platform Layered Abstraction Architecture
          </span>
          <span className="text-xs font-mono text-[#E9681B] font-semibold">
            Strict Seams • No Cross-Namespace Import Paths
          </span>
        </div>

        {/* 3 Tier Diagram */}
        <div className="space-y-4">
          {/* Layer 1: Developer Experience Layer */}
          <div className="p-5 rounded-lg bg-[#F7F6F2] border border-[#DEDCD5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#171717] font-mono text-xs font-bold">
                <Terminal className="w-4 h-4 text-[#E9681B]" />
                <span>1. DEVELOPER EXPERIENCE & COMPILATION LAYER</span>
              </div>
              <span className="text-[10px] font-mono text-[#66635D] uppercase">User Space Console</span>
            </div>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Web Application Console, Floating IDE Studio, Static Pattern Security Scan, AST Requirement Extraction.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2.5 py-0.5 rounded bg-white text-[#171717] border border-[#DEDCD5]">
                Next.js App Router
              </span>
              <span className="px-2.5 py-0.5 rounded bg-white text-[#171717] border border-[#DEDCD5]">
                Floating IDE (Monaco / Editor)
              </span>
              <span className="px-2.5 py-0.5 rounded bg-white text-[#171717] border border-[#DEDCD5]">
                Static Security AST Validator
              </span>
            </div>
          </div>

          <div className="text-center font-mono text-xs text-[#66635D]">
            ↓ FastAPI Injected Dependency Service (get_provider)
          </div>

          {/* Layer 2: Satellite Provider Interface Seam */}
          <BorderGlow active={true} color="#E9681B">
            <div className="p-5 rounded-lg bg-white border border-[#DEDCD5] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#171717] font-mono text-xs font-bold">
                  <Layers className="w-4 h-4 text-[#E9681B]" />
                  <span>2. PROVIDER ABSTRACTION SEAM (SatelliteProvider ABC)</span>
                </div>
                <span className="text-[10px] font-mono text-[#16A34A] font-bold uppercase bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#DCFCE7]">
                  Drop-In Seam
                </span>
              </div>
              <p className="text-xs text-[#66635D] leading-relaxed">
                Abstract Base Class contract decoupling frontend and platform business logic from underlying spacecraft hardware providers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5] text-xs font-mono">
                  <span className="text-[#171717] font-bold block">MockProvider (Active Prototype)</span>
                  <span className="text-[#66635D] text-[11px] block mt-1">
                    Deterministic orbital propagator, Keplerian math, local hardware spec simulation.
                  </span>
                </div>
                <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5] text-xs font-mono opacity-80">
                  <span className="text-[#66635D] font-bold block">DhruvaProvider / SatOps (Production Stub)</span>
                  <span className="text-[#66635D] text-[11px] block mt-1">
                    Drop-in subclass raising NotImplementedError to demonstrate zero-rewrite architecture.
                  </span>
                </div>
              </div>
            </div>
          </BorderGlow>

          <div className="text-center font-mono text-xs text-[#66635D]">
            ↓ Isolated Hardware Bus Boundary
          </div>

          {/* Layer 3: Spacecraft Isolation Boundary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Runtime */}
            <div className="p-5 rounded-lg bg-[#F7F6F2] border border-[#DEDCD5] space-y-2">
              <div className="flex items-center space-x-2 text-[#171717] font-mono text-xs font-bold">
                <Cpu className="w-4 h-4 text-[#E9681B]" />
                <span>app.runtime.* (User Payload Execution)</span>
              </div>
              <p className="text-xs text-[#66635D] leading-relaxed">
                Containerized Python / ONNX / TFLite workloads executing during acquisition passes.
                Strictly prohibited from touching flight bus controls.
              </p>
              <div className="text-[11px] font-mono text-[#16A34A] pt-1">
                ✓ Non-privileged user-space container
              </div>
            </div>

            {/* Flight Critical Bus */}
            <div className="p-5 rounded-lg bg-[#F7F6F2] border border-[#DEDCD5] space-y-2">
              <div className="flex items-center space-x-2 text-[#171717] font-mono text-xs font-bold">
                <Lock className="w-4 h-4 text-[#DC2626]" />
                <span>app.flight_critical.* (Spacecraft Bus)</span>
              </div>
              <p className="text-xs text-[#66635D] leading-relaxed">
                Attitude Determination and Control (ADCS), Reaction Wheels, Thermal, Power rails, Star Tracker.
                Isolated at code package and hardware bus level.
              </p>
              <div className="text-[11px] font-mono text-[#DC2626] pt-1">
                🔒 Zero import path from customer code
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The 99.9% Downlink Advantage Explained */}
      <div className="border border-[#DEDCD5] bg-white rounded-xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#E9681B] uppercase tracking-wider font-bold">
          <Zap className="w-4 h-4" />
          <span>The Orbital Edge Value Equation</span>
        </div>
        <h2 className="text-lg font-bold text-[#171717]">
          Why Downlinking Raw Imagery is the Space Industry's Biggest Bottleneck
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#66635D] leading-relaxed">
          <div className="p-5 rounded-lg bg-[#F7F6F2] border border-[#DEDCD5] space-y-2">
            <span className="font-mono text-[#DC2626] font-bold uppercase block text-xs">
              Traditional Ground Downlink Model
            </span>
            <p>
              A single multispectral camera pass captures 1.5 GB of raw radiometric pixels.
              With scarce ground station contact windows (10-15 mins per orbit) and limited downlink rates (50 Mbps),
              raw imagery sits in onboard flash for hours before ground analysis.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] space-y-2">
            <span className="font-mono text-[#16A34A] font-bold uppercase block text-xs">
              OrCom Orbital Edge AI Model
            </span>
            <p className="text-[#171717]">
              The AI model runs directly on the spacecraft's compute payload in 3.8 seconds as the sensor frames are buffered.
              Instead of downlinking 1,500 MB of clouds and empty terrain, OrCom transmits a 0.15 MB vector polygon with coordinates and confidence.
              Bandwidth is slashed by <strong className="text-[#16A34A]">99.99%</strong> and emergency alerts arrive in minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
