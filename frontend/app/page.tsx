"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Terminal,
  Cpu,
  Orbit,
  Layers,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Compass,
  Radio,
  Clock,
  Server,
  Code,
  HardDrive,
  Activity,
  ChevronRight,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import Galaxy from "@/components/ui/Galaxy";
import ScrollExpand from "@/components/ui/ScrollExpand";
import GlassSurface from "@/components/ui/GlassSurface";
import BlurText from "@/components/ui/BlurText";
import SplitFlapText from "@/components/ui/SplitFlapText";
import BorderGlow from "@/components/ui/BorderGlow";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"write" | "validate" | "simulate" | "result">("simulate");

  return (
    <div className="relative w-full overflow-hidden bg-[#F7F6F2] text-[#171717] selection:bg-[#E9681B] selection:text-white">
      {/* =========================================================================
          SECTION 1: HERO (§6, §7, §8)
          ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-between pt-16 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Subtle Galaxy background layer (§7) */}
        <Galaxy transparent={true} density={35} speed={0.25} />

        <div className="relative z-10 space-y-8 max-w-3xl pt-8">
          {/* Subtle brand tag */}
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-[5px] bg-[#EFECE6] border border-[#DEDCD5] text-[11px] font-mono text-[#66635D] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E9681B]" />
            <span>Developer Platform for Orbital Computing</span>
          </div>

          {/* Primary headline (§6) */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#171717] leading-[0.95]">
            COMPUTE
            <br />
            BEYOND
            <br />
            <span className="text-[#E9681B]">EARTH.</span>
          </h1>

          {/* Short explanation (§6) */}
          <p className="text-base sm:text-lg text-[#66635D] leading-relaxed max-w-xl">
            OrCom is building the software layer that lets developers run workloads on spacecraft
            without becoming spacecraft operators.
          </p>

          {/* Actions (§6) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/console"
              className="px-5 py-3 rounded-[6px] bg-[#171717] hover:bg-[#252525] text-white text-xs font-semibold tracking-wide uppercase flex items-center space-x-2 shadow-sm group transition-all"
            >
              <span>START EXPLORING</span>
              <ArrowRight className="w-4 h-4 text-[#E9681B] group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#how-it-works"
              className="px-5 py-3 rounded-[6px] bg-white border border-[#DEDCD5] hover:border-[#C5C2B8] text-[#171717] text-xs font-semibold tracking-wide uppercase transition-colors"
            >
              SEE HOW IT WORKS
            </a>
          </div>
        </div>

        {/* Hero Orbital Visual System (§8) */}
        <div className="relative z-10 mt-12 pt-8 border-t border-[#DEDCD5]/70 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-[#66635D]">
          <div>
            <span className="text-[10px] text-[#A5A198] uppercase block">Constellation Orbit</span>
            <span className="text-[#171717] font-semibold text-sm">500 km LEO</span>
            <span className="text-[10px] text-[#66635D] block">Sun-Synchronous 97.4°</span>
          </div>

          <div>
            <span className="text-[10px] text-[#A5A198] uppercase block">Edge Compute Bus</span>
            <span className="text-[#171717] font-semibold text-sm">ARM Cortex-A72</span>
            <span className="text-[10px] text-[#66635D] block">Rad-Tolerant ECC RAM</span>
          </div>

          <div>
            <span className="text-[10px] text-[#A5A198] uppercase block">Bandwidth Advantage</span>
            <span className="text-[#E9681B] font-semibold text-sm">-99.9% Downlink</span>
            <span className="text-[10px] text-[#66635D] block">Vector vs Raw Raster</span>
          </div>

          <div>
            <span className="text-[10px] text-[#A5A198] uppercase block">Current Stage</span>
            <span className="text-[#171717] font-semibold text-sm">Software Prototype</span>
            <span className="text-[10px] text-[#66635D] block">Deterministic Simulator</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THE PROBLEM (§9)
          ========================================================================= */}
      <section id="problem" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#DEDCD5]">
        <div className="space-y-4 max-w-2xl mb-16">
          <div className="text-[11px] font-mono text-[#E9681B] uppercase tracking-wider font-semibold">
            01 / The Friction
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717] leading-snug">
            Today, running software in space means owning the complexity of space.
          </h2>
          <p className="text-sm text-[#66635D] leading-relaxed">
            A team that wants to run an anomaly detector or wildfire alert algorithm on orbital imagery
            is forced to become a space logistics company. The operational overhead dwarfs the software itself.
          </p>
        </div>

        {/* Stack of accumulated complexity vs developer workload */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* The traditional nightmare stack */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="text-xs font-mono text-[#66635D] uppercase tracking-wider mb-2">
              Traditional Approach: 18-36 Months & Millions in Capital
            </div>

            {[
              { title: "OPERATIONS", desc: "Ground stations, telemetry tracking passes, orbital de-confliction" },
              { title: "GROUND SYSTEMS", desc: "S-band dishes, tracking antennas, scheduled contact windows" },
              { title: "MISSION DESIGN", desc: "Orbital mechanics, Keplerian propagation, eclipse thermal cycles" },
              { title: "PAYLOAD INTEGRATION", desc: "Mechanical brackets, harness routing, thermal dissipation, vibration testing" },
              { title: "SPACECRAFT BUS", desc: "Attitude control, reaction wheels, solar arrays, battery regulation" },
              { title: "YOUR WORKLOAD", desc: "A 40-line Python model running inference over a target horizon", highlight: true },
            ].map((layer, idx) => (
              <div
                key={layer.title}
                className={`p-4 rounded-[8px] border transition-all ${
                  layer.highlight
                    ? "bg-white border-[#E9681B] shadow-sm ring-1 ring-[#E9681B]/20"
                    : "bg-white/60 border-[#DEDCD5]"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono font-bold ${layer.highlight ? "text-[#E9681B]" : "text-[#171717]"}`}>
                    {layer.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#A5A198]">Tier 0{6 - idx}</span>
                </div>
                <p className="text-xs text-[#66635D] mt-1">{layer.desc}</p>
              </div>
            ))}
          </div>

          {/* The Core Question Callout */}
          <div className="lg:col-span-5 bg-white border border-[#DEDCD5] rounded-2xl p-8 space-y-6 shadow-sm">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EFECE6] text-[#171717] font-semibold">
              The Fundamental Inefficiency
            </span>
            <h3 className="text-xl font-bold text-[#171717] tracking-tight">
              Why should the developer have to build all of that?
            </h3>
            <p className="text-xs text-[#66635D] leading-relaxed">
              A computer vision workload only needs 40 seconds of compute as the spacecraft crosses the target coordinates.
            </p>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Building, launching, and managing a dedicated satellite to run 40 seconds of compute is like building a power plant every time you want to plug in a laptop.
            </p>
            <div className="pt-4 border-t border-[#DEDCD5] text-xs font-mono text-[#E9681B] font-semibold">
              Software shouldn't require hardware ownership.
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: THE SHIFT (§10)
          ========================================================================= */}
      <section id="shift" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#DEDCD5]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="text-[11px] font-mono text-[#E9681B] uppercase tracking-wider font-semibold">
            02 / The Paradigm
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#171717]">
            What if spacecraft were infrastructure?
          </h2>
          <p className="text-sm text-[#66635D] leading-relaxed">
            Cloud computing abstracted away the physical data center.
            <br />
            OrCom's mission is to abstract away the spacecraft.
          </p>
        </div>

        {/* Side-by-Side Model Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Space Model */}
          <div className="p-7 rounded-xl bg-white border border-[#DEDCD5] space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#DEDCD5] pb-3">
              <span className="font-mono text-xs font-bold text-[#DC2626] uppercase">
                Traditional Aerospace Model
              </span>
              <span className="text-[10px] font-mono text-[#66635D]">Hardware Centric</span>
            </div>

            <div className="space-y-3 font-mono text-xs text-[#66635D]">
              <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5]">1. Procure Satellite Bus & Avionics</div>
              <div className="text-center text-[#A5A198]">↓</div>
              <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5]">2. Integrate Sensors & Payloads</div>
              <div className="text-center text-[#A5A198]">↓</div>
              <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5]">3. Thermal Vacuum & Vibration Testing</div>
              <div className="text-center text-[#A5A198]">↓</div>
              <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5]">4. Book Rocket Launch Manifest</div>
              <div className="text-center text-[#A5A198]">↓</div>
              <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5]">5. Ground Station Pass Scheduling</div>
              <div className="text-center text-[#A5A198]">↓</div>
              <div className="p-3 rounded bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] font-semibold">
                6. Execute Workload (Months later)
              </div>
            </div>
          </div>

          {/* The OrCom Model */}
          <BorderGlow active={true} color="#E9681B">
            <div className="p-7 rounded-xl bg-white border border-[#DEDCD5] space-y-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#DEDCD5] pb-3">
                  <span className="font-mono text-xs font-bold text-[#16A34A] uppercase">
                    The OrCom Cloud Model
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] font-semibold border border-[#DCFCE7]">
                    Software Centric
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs text-[#171717] mt-5">
                  <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5] font-semibold flex items-center justify-between">
                    <span>1. Write Code / Workload Specification</span>
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <div className="text-center text-[#E9681B]">↓</div>
                  <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5] font-semibold flex items-center justify-between">
                    <span>2. OrCom Validates & Matches Orbit</span>
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <div className="text-center text-[#E9681B]">↓</div>
                  <div className="p-3 rounded bg-[#F7F6F2] border border-[#DEDCD5] font-semibold flex items-center justify-between">
                    <span>3. Deterministic Simulation in Orbit</span>
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <div className="text-center text-[#E9681B]">↓</div>
                  <div className="p-3.5 rounded bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A] font-bold flex items-center justify-between">
                    <span>4. Receive Processed Vector Result</span>
                    <span className="text-[11px] font-mono">Seconds</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DEDCD5] text-xs text-[#66635D]">
                Spacecraft become shared edge compute nodes available through code.
              </div>
            </div>
          </BorderGlow>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: SCROLLEXPAND — FROM SOFTWARE TO ORBIT (§11)
          ========================================================================= */}
      <section className="py-16 w-full border-t border-[#DEDCD5] bg-[#EFECE6]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-2 mb-8">
          <span className="text-[11px] font-mono text-[#66635D] uppercase tracking-wider">
            Cinematic Transition
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            From Software to Orbit.
          </h2>
        </div>

        {/* ScrollExpand Central Visual */}
        <ScrollExpand
          initialContent={
            <div className="p-8 sm:p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#F7F6F2] border border-[#DEDCD5] flex items-center justify-center mx-auto text-[#E9681B]">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
                FROM SOFTWARE TO ORBIT.
              </h3>
              <p className="text-xs text-[#66635D] max-w-md mx-auto font-mono">
                Scroll to deploy code container into Keplerian ground trajectory →
              </p>
            </div>
          }
          expandedContent={
            <div className="p-8 sm:p-14 bg-[#171717] text-white space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D2D2D] pb-6">
                <div>
                  <div className="text-xs font-mono text-[#E9681B] uppercase tracking-wider">
                    Orbital Execution State
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                    YOUR SOFTWARE RUNNING IN ORBIT.
                  </h3>
                </div>
                <div className="font-mono text-xs text-[#A5A198] bg-[#222222] px-3 py-1.5 rounded border border-[#333333]">
                  500 KM LEO • PASS ACTIVE
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-mono text-xs">
                <div className="p-4 rounded bg-[#222222] border border-[#333333] space-y-1">
                  <span className="text-[#A5A198] text-[10px] uppercase">Node Ephemeris</span>
                  <div className="text-white font-semibold">15.82°N, 78.03°E</div>
                  <span className="text-[10px] text-[#16A34A]">Target Locked: Andhra Pradesh</span>
                </div>
                <div className="p-4 rounded bg-[#222222] border border-[#333333] space-y-1">
                  <span className="text-[#A5A198] text-[10px] uppercase">Telemetry Consumption</span>
                  <div className="text-[#E9681B] font-semibold">734 MB RAM • 14.7 Wh</div>
                  <span className="text-[10px] text-[#A5A198]">Pass Budget Within Envelope</span>
                </div>
                <div className="p-4 rounded bg-[#222222] border border-[#333333] space-y-1">
                  <span className="text-[#A5A198] text-[10px] uppercase">Downlink Compression</span>
                  <div className="text-[#16A34A] font-semibold">-99.99% Bandwidth Saved</div>
                  <span className="text-[10px] text-[#A5A198]">0.15 MB Vector vs 1.5 GB Raw</span>
                </div>
              </div>
            </div>
          }
        />
      </section>

      {/* =========================================================================
          SECTION 5: HOW ORCOM WORKS (§12)
          ========================================================================= */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#DEDCD5]">
        <div className="max-w-2xl space-y-3 mb-16">
          <div className="text-[11px] font-mono text-[#E9681B] uppercase tracking-wider font-semibold">
            03 / Pipeline Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
            You write the software. OrCom handles the orbit.
          </h2>
          <p className="text-sm text-[#66635D]">
            An eight-stage operational lifecycle linking developer code directly to satellite sensor passes.
          </p>
        </div>

        {/* 8-stage Grid Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: "01", name: "WRITE", desc: "Developer authors or uploads standard containerized Python workload with requirements." },
            { step: "02", name: "VALIDATE", desc: "Static AST scanner verifies security boundaries and extracts CPU, RAM, and sensor requirements." },
            { step: "03", name: "MATCH", desc: "Constellation engine determines compatible orbital nodes matching sensor and power budgets." },
            { step: "04", name: "SIMULATE", desc: "Deterministic simulator tests resource utilization, pass window, and execution latency." },
            { step: "05", name: "SCHEDULE", desc: "OrCom calculates ground horizon geometry and schedules optimal target acquisition pass." },
            { step: "06", name: "DEPLOY", desc: "Workload bundle is verified, packaged, and queued for spacecraft compute payload." },
            { step: "07", name: "EXECUTE", desc: "On-orbit processor runs container inference directly against live optical or SAR frames." },
            { step: "08", name: "RESULT", desc: "Processed vector metadata and detection alerts downlink directly to developer console." },
          ].map((s) => (
            <div
              key={s.step}
              className="p-5 bg-white border border-[#DEDCD5] rounded-xl space-y-2 shadow-xs hover:border-[#C5C2B8] transition-colors"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs text-[#E9681B] font-bold">{s.step}</span>
                <span className="text-[10px] text-[#A5A198] uppercase">Lifecycle</span>
              </div>
              <h3 className="text-sm font-bold text-[#171717]">{s.name}</h3>
              <p className="text-xs text-[#66635D] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-lg bg-[#EFECE6] border border-[#DEDCD5] flex items-center justify-between text-xs font-mono text-[#66635D]">
          <span>Current Prototype: Full deterministic pipeline operational via MockProvider</span>
          <Link href="/console" className="text-[#E9681B] hover:underline font-semibold flex items-center space-x-1">
            <span>Test the pipeline in Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: THE DEVELOPER EXPERIENCE (IDE IN ORBIT) (§13, §14)
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#DEDCD5]">
        <div className="max-w-2xl space-y-3 mb-14">
          <div className="text-[11px] font-mono text-[#E9681B] uppercase tracking-wider font-semibold">
            04 / Developer Experience
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
            Space should feel like a development environment.
          </h2>
          <p className="text-sm text-[#66635D]">
            Not a dashboard for looking at satellites. An integrated environment for deploying computation.
          </p>
        </div>

        {/* Floating IDE Representation */}
        <div className="border border-[#DEDCD5] bg-white rounded-2xl overflow-hidden shadow-lg">
          {/* Editor Chrome Topbar */}
          <div className="h-10 bg-[#FAF9F5] border-b border-[#DEDCD5] px-4 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] border border-[#D0D0D0]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] border border-[#D0D0D0]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5] border border-[#D0D0D0]" />
              </div>
              <span className="text-[#DEDCD5]">|</span>
              <span className="text-[#171717] font-semibold flex items-center space-x-1">
                <Code className="w-3.5 h-3.5 text-[#E9681B]" />
                <span>wildfire_thermal_detector/main.py</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#DCFCE7]">
                AST VALIDATED
              </span>
              <span className="text-[11px] text-[#66635D]">Python 3.10 • ONNX Runtime</span>
            </div>
          </div>

          {/* Editor Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 font-mono text-xs">
            {/* Code Gutter & Content */}
            <div className="lg:col-span-8 p-6 bg-[#FFFFFF] overflow-x-auto space-y-1 text-[#252525] border-b lg:border-b-0 lg:border-r border-[#DEDCD5]">
              <div className="text-[#A5A198]">// OrCom Orbital Workload Entrypoint</div>
              <div><span className="text-[#E9681B]">import</span> numpy <span className="text-[#E9681B]">as</span> np</div>
              <div><span className="text-[#E9681B]">from</span> orcom.runtime <span className="text-[#E9681B]">import</span> sensor_buffer, emit_result</div>
              <div className="text-[#A5A198]"></div>
              <div><span className="text-[#16A34A]">def</span> <span className="text-[#171717] font-bold">detect_thermal_anomaly</span>(frame, threshold=315.0):</div>
              <div className="pl-4 text-[#66635D]">"""Execute on-orbit infrared anomaly screening during target pass."""</div>
              <div className="pl-4">radiometric_kelvin = (frame.nir_band * 0.05) + 200.0</div>
              <div className="pl-4">hotspots = np.argwhere(radiometric_kelvin &gt; threshold)</div>
              <div className="pl-4"><span className="text-[#E9681B]">if</span> len(hotspots) &gt; 5:</div>
              <div className="pl-8">polygon = compute_bounding_geo(hotspots, frame.telemetry.subsat_coords)</div>
              <div className="pl-8"><span className="text-[#16A34A]">emit_result</span>(label=<span className="text-[#E9681B]">"WILDFIRE_CONFIRMED"</span>, confidence=0.964, geom=polygon)</div>
              <div className="pl-8"><span className="text-[#A5A198]"># Transmits 0.15 MB GeoJSON instead of 1500 MB raw imagery</span></div>
              <div className="pl-4"><span className="text-[#E9681B]">return</span> <span className="text-[#16A34A]">True</span></div>
            </div>

            {/* Application Requirements Envelope */}
            <div className="lg:col-span-4 p-6 bg-[#FAF9F5] space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-[#66635D] font-bold border-b border-[#DEDCD5] pb-2">
                APPLICATION RESOURCE SPEC
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#EFECE6]">
                  <span className="text-[#66635D]">Runtime Engine</span>
                  <span className="text-[#171717] font-semibold">Python 3.10 ONNX</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFECE6]">
                  <span className="text-[#66635D]">CPU Requirement</span>
                  <span className="text-[#171717] font-semibold">4 Cores (ARM64)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFECE6]">
                  <span className="text-[#66635D]">RAM Envelope</span>
                  <span className="text-[#171717] font-semibold">734 MB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFECE6]">
                  <span className="text-[#66635D]">Mounted Sensor</span>
                  <span className="text-[#171717] font-semibold">Multispectral NIR</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EFECE6]">
                  <span className="text-[#66635D]">Pass Energy Budget</span>
                  <span className="text-[#E9681B] font-bold">14.7 Wh</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#66635D]">Fleet Match</span>
                  <span className="text-[#16A34A] font-bold">OC-02 (Recommended)</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/console"
                  className="w-full py-2.5 bg-[#171717] hover:bg-[#252525] text-white rounded-[6px] text-xs font-semibold tracking-wide uppercase flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-[#E9681B]" />
                  <span>SIMULATE WORKLOAD</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: THE ORCOM RUNTIME & RESOURCE ABSTRACTION (§16, §17, §18)
          ========================================================================= */}
      <section id="runtime" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#DEDCD5]">
        <div className="max-w-2xl space-y-3 mb-16">
          <div className="text-[11px] font-mono text-[#E9681B] uppercase tracking-wider font-semibold">
            05 / Architectural Abstraction
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
            The spacecraft doesn't need to speak Python.
            <br />
            <span className="text-[#E9681B]">OrCom does.</span>
          </h2>
          <p className="text-sm text-[#66635D] leading-relaxed">
            Developers shouldn't have to learn proprietary flight avionics or RTOS dialects.
            OrCom isolates developer workloads inside sandboxed containers that map standard resource requests to heterogeneous spacecraft buses.
          </p>
        </div>

        {/* 3 Tier Architectural Stack */}
        <div className="space-y-4 font-mono text-xs">
          {/* Layer 1 */}
          <div className="p-5 rounded-xl bg-white border border-[#DEDCD5] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#171717]">LAYER 1: DEVELOPER WORKLOAD</span>
              <span className="text-[10px] text-[#A5A198]">USER SPACE</span>
            </div>
            <p className="text-xs text-[#66635D] font-sans">
              Containerized models, Python scripts, ONNX graphs, or compiled edge binaries declaring compute, memory, and sensor inputs.
            </p>
          </div>

          <div className="text-center text-xs text-[#66635D]">↓ OrCom Runtime Bridge (Abstract Base Contract)</div>

          {/* Layer 2 */}
          <BorderGlow active={true} color="#E9681B">
            <div className="p-5 rounded-xl bg-white border border-[#DEDCD5] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#171717] flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#E9681B]" />
                  <span>LAYER 2: ORCOM RUNTIME & SATELLITE PROVIDER SEAM</span>
                </span>
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#DCFCE7]">
                  HARDWARE AIRGAP
                </span>
              </div>
              <p className="text-xs text-[#66635D] font-sans">
                Translates abstract CPU/RAM/Sensor requirements into spacecraft telemetry allocations.
                Strictly isolates customer code packages (<code className="text-[#171717]">app.runtime.*</code>) from flight controls (<code className="text-[#DC2626]">app.flight_critical.*</code>).
              </p>
            </div>
          </BorderGlow>

          <div className="text-center text-xs text-[#66635D]">↓ Hardware Telemetry Bus Interface</div>

          {/* Layer 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white border border-[#DEDCD5] space-y-2 shadow-xs">
              <span className="font-bold text-[#171717] block">NATIVE EDGE COMPUTE PAYLOAD</span>
              <p className="text-xs text-[#66635D] font-sans">
                Radiation-tolerant System-on-Module, ECC memory, NVMe flash, optical DMA buffers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-[#DEDCD5] space-y-2 shadow-xs">
              <span className="font-bold text-[#DC2626] block">AIRGAPPED FLIGHT CRITICAL BUS</span>
              <p className="text-xs text-[#66635D] font-sans">
                Attitude control, reaction wheels, star trackers, and battery thermal regulation. Zero customer import path.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: WHY ON-ORBIT COMPUTE MATTERS (§20)
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#DEDCD5]">
        <div className="max-w-2xl space-y-3 mb-14">
          <div className="text-[11px] font-mono text-[#E9681B] uppercase tracking-wider font-semibold">
            06 / The Edge Advantage
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
            Process where the data is generated.
          </h2>
          <p className="text-sm text-[#66635D] leading-relaxed">
            Raw multispectral sensors generate gigabytes of pixels per second.
            Downlinking raw frames over scarce ground station contact windows creates hours of latency.
          </p>
        </div>

        {/* 99.9% Downlink Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-7 rounded-xl bg-white border border-[#DEDCD5] space-y-4 shadow-xs">
            <span className="font-mono text-xs font-bold text-[#DC2626] uppercase block">
              Traditional Raw Downlink
            </span>
            <div className="text-3xl font-bold text-[#171717] font-mono">
              1,500 <span className="text-sm text-[#66635D]">MB</span>
            </div>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Every pixel, cloud layer, and empty ocean tile is compressed and stored in onboard flash, waiting hours for a 10-minute ground station pass.
            </p>
            <div className="pt-2 font-mono text-xs text-[#DC2626]">
              Latency: 4 to 12 hours to ground analysis
            </div>
          </div>

          <BorderGlow active={true} color="#E9681B">
            <div className="p-7 rounded-xl bg-white border border-[#DEDCD5] space-y-4 shadow-xs">
              <span className="font-mono text-xs font-bold text-[#16A34A] uppercase block">
                OrCom On-Orbit Inference
              </span>
              <div className="text-3xl font-bold text-[#16A34A] font-mono">
                0.15 <span className="text-sm text-[#66635D]">MB</span>
              </div>
              <p className="text-xs text-[#171717] leading-relaxed">
                The model screens the scene on-orbit in 38 seconds, extracting detected bounding geometries, confidence scores, and thermal vector coordinates.
              </p>
              <div className="pt-2 font-mono text-xs text-[#16A34A] font-bold">
                Bandwidth Reduction: 99.99% • Alert Delivered in Minutes
              </div>
            </div>
          </BorderGlow>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: WHAT WE ARE BUILDING NOW & THE ROADMAP (§21, §22, §23)
          ========================================================================= */}
      <section id="vision" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#DEDCD5]">
        <div className="max-w-2xl space-y-3 mb-16">
          <div className="text-[11px] font-mono text-[#E9681B] uppercase tracking-wider font-semibold">
            07 / Roadmap & Transparency
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
            This is the beginning.
          </h2>
          <p className="text-sm text-[#66635D] leading-relaxed">
            The current OrCom platform is a functional software prototype using a deterministic simulated satellite environment (MockProvider). Here is our engineering trajectory.
          </p>
        </div>

        {/* Roadmap Stages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#DEDCD5] space-y-3 shadow-xs">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
              STAGE 1 • ACTIVE
            </span>
            <h3 className="text-sm font-bold text-[#171717]">Software Prototype</h3>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Floating IDE, static AST validation, deterministic Keplerian simulation, pass scheduling, and mission console.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#DEDCD5] space-y-3 shadow-xs">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFECE6] text-[#171717]">
              STAGE 2 • NEXT
            </span>
            <h3 className="text-sm font-bold text-[#171717]">Hardware-in-the-Loop</h3>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Integration with physical CubeSat flat-sats and real ARM64 rad-tolerant System-on-Modules under test chamber.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#DEDCD5] space-y-3 shadow-xs">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFECE6] text-[#171717]">
              STAGE 3
            </span>
            <h3 className="text-sm font-bold text-[#171717]">Provider Integration</h3>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Dhruva Space and commercial spacecraft operator provider adapter drop-in without modifying platform interface.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#DEDCD5] space-y-3 shadow-xs">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFECE6] text-[#171717]">
              STAGE 4
            </span>
            <h3 className="text-sm font-bold text-[#171717]">Orbital Compute Cloud</h3>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Multi-constellation orbital mesh running customer workloads across global orbital horizons continuously.
            </p>
          </div>
        </div>

        {/* Vision Statement (§23) */}
        <div className="mt-12 p-8 rounded-2xl bg-white border border-[#DEDCD5] text-center max-w-3xl mx-auto space-y-3 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-[#A5A198] tracking-widest">
            The Long-Term North Star
          </span>
          <p className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
            "What AWS did for computing, OrCom wants to do for orbital computing."
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: FINAL CTA (GLASS SURFACE) (§15, §24)
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 max-w-4xl mx-auto border-t border-[#DEDCD5] text-center">
        <div className="space-y-3 mb-10">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#171717]">
            Ready to explore orbital computing?
          </h2>
          <p className="text-sm text-[#66635D] max-w-lg mx-auto">
            See how an application moves from code to simulated execution in orbit.
          </p>
        </div>

        {/* The GlassSurface CTA (§15) */}
        <GlassSurface intensity="medium" className="p-8 sm:p-12 max-w-2xl mx-auto text-center space-y-6">
          <div className="w-10 h-10 rounded-xl bg-[#171717] flex items-center justify-center mx-auto text-[#E9681B] shadow-sm">
            <Orbit className="w-5 h-5" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
              Ready to run?
            </h3>
            <p className="text-xs sm:text-sm text-[#66635D] max-w-md mx-auto">
              Open the OrCom developer console, load a sample wildfire or maritime workload, and simulate execution on our Keplerian fleet.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/console"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-[8px] bg-[#171717] hover:bg-[#2B2B2B] text-white text-xs font-bold tracking-wider uppercase shadow-md transition-all group"
            >
              <span>START EXPLORING</span>
              <ArrowRight className="w-4 h-4 text-[#E9681B] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="text-[11px] font-mono text-[#A5A198]">
            No hardware or space logistics required • Runs in browser
          </div>
        </GlassSurface>
      </section>
    </div>
  );
}
