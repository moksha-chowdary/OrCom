"use client";

import React from "react";
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
  ExternalLink
} from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-xs font-mono text-cyan-300">
          <Shield className="w-3.5 h-3.5" />
          <span>SYSTEM ARCHITECTURE & SECURITY BOUNDARY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
          "Spacecraft is Infrastructure, Software is the Product"
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
          OrCom abstracts heterogeneous satellite constellations into an accessible cloud programming model.
          Instead of downlinking raw multi-gigabyte sensory telemetry to overwhelmed ground stations, customer applications
          execute directly in orbit inside sandboxed runtime containers, transmitting only vector insights.
        </p>
      </div>

      {/* Architectural Diagram Representation */}
      <div className="bg-[#0b0f17] border border-[#1e2838] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1b2536] pb-4">
          <span className="text-xs font-mono uppercase text-slate-400">
            Platform Layered Abstraction Architecture
          </span>
          <span className="text-xs font-mono text-cyan-400">
            Strict Seams • No Cross-Namespace Import Paths
          </span>
        </div>

        {/* 3 Tier Diagram */}
        <div className="space-y-4">
          {/* Layer 1: Developer Experience Layer */}
          <div className="p-4 rounded-xl bg-[#0f1522] border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
                <Terminal className="w-4 h-4" />
                <span>1. DEVELOPER EXPERIENCE & COMPILATION LAYER</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">User Space</span>
            </div>
            <p className="text-xs text-slate-300">
              Web Application Console, Floating IDE Studio, Static Pattern Security Scan, AST Requirement Extraction.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-[#162133] text-cyan-300 border border-cyan-800/40">
                Next.js App Router
              </span>
              <span className="px-2 py-0.5 rounded bg-[#162133] text-cyan-300 border border-cyan-800/40">
                Floating IDE
              </span>
              <span className="px-2 py-0.5 rounded bg-[#162133] text-cyan-300 border border-cyan-800/40">
                Static Validator
              </span>
            </div>
          </div>

          <div className="text-center font-mono text-xs text-slate-500">▼ FastAPI Injected Service Dependency (get_provider)</div>

          {/* Layer 2: Satellite Provider Interface Seam */}
          <div className="p-4 rounded-xl bg-[#0f1522] border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-300 font-mono text-xs font-bold">
                <Layers className="w-4 h-4" />
                <span>2. PROVIDER ABSTRACTION SEAM (SatelliteProvider ABC)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Drop-In Seam</span>
            </div>
            <p className="text-xs text-slate-300">
              Contract decoupling frontend and platform business logic from underlying spacecraft hardware providers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded bg-[#131b2c] border border-cyan-800/40 text-xs font-mono">
                <span className="text-cyan-400 font-bold block">MockProvider (Active)</span>
                <span className="text-slate-400 text-[11px]">
                  Deterministic orbital propagator, Keplerian math, local hardware spec simulation.
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#131b2c] border border-slate-700 text-xs font-mono">
                <span className="text-amber-400 font-bold block">DhruvaProvider (Stub)</span>
                <span className="text-slate-400 text-[11px]">
                  Drop-in subclass raising NotImplementedError to demonstrate zero-rewrite seam.
                </span>
              </div>
            </div>
          </div>

          <div className="text-center font-mono text-xs text-slate-500">▼ Isolated Execution Boundary</div>

          {/* Layer 3: Spacecraft Isolation Boundary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Runtime */}
            <div className="p-4 rounded-xl bg-[#0e161c] border border-cyan-600/40 space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
                <Cpu className="w-4 h-4" />
                <span>app.runtime.* (Customer Execution)</span>
              </div>
              <p className="text-xs text-slate-300">
                Containerized Python / ONNX / TFLite workloads executing during acquisition passes.
                Strictly prohibited from touching flight controls.
              </p>
              <div className="text-[11px] font-mono text-emerald-400 pt-1">
                ✓ Non-privileged user-space container
              </div>
            </div>

            {/* Flight Critical Bus */}
            <div className="p-4 rounded-xl bg-[#140f16] border border-rose-600/40 space-y-2">
              <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold">
                <Lock className="w-4 h-4" />
                <span>app.flight_critical.* (Spacecraft Bus)</span>
              </div>
              <p className="text-xs text-slate-300">
                Attitude Determination and Control (ADCS), Reaction Wheels, Thermal, Power rails, Star Tracker.
                Isolated at code package level.
              </p>
              <div className="text-[11px] font-mono text-rose-300 pt-1">
                🔒 Zero import path from customer code
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The 99.9% Downlink Advantage Explained */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>The Orbital Edge Value Equation</span>
        </div>
        <h2 className="text-lg font-bold text-white">
          Why Downlinking Raw Imagery is the Space Industry's Biggest Bottleneck
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-[#121824] border border-[#1e2838] space-y-2">
            <span className="font-mono text-rose-400 font-bold uppercase block">
              Traditional Ground Downlink Model
            </span>
            <p>
              A single multispectral camera pass captures 1.5 GB of raw radiometric pixels.
              With scarce ground station contact windows (10-15 mins per orbit) and limited downlink rates (50 Mbps),
              raw imagery sits in onboard flash for hours before ground analysis.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-emerald-900/50 space-y-2">
            <span className="font-mono text-emerald-400 font-bold uppercase block">
              OrCom Orbital Edge AI Model
            </span>
            <p>
              The AI model runs directly on the spacecraft's compute payload in 3.8 seconds as the sensor frames are buffered.
              Instead of downlinking 1,500 MB of clouds and empty forest, OrCom transmits a 0.15 MB vector polygon with coordinates and confidence.
              Bandwidth is slashed by <strong className="text-emerald-400">99.99%</strong> and emergency alerts arrive in minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
