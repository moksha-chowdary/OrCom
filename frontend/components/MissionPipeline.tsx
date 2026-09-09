"use client";

import React from "react";
import {
  Clock,
  Navigation,
  Eye,
  Camera,
  Cpu,
  Radio,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface MissionPipelineProps {
  currentStatus: string;
}

const STAGES = [
  { id: "scheduled", label: "Scheduled", icon: Clock, desc: "Uplink verified" },
  { id: "awaiting_pass", label: "Awaiting Pass", icon: Navigation, desc: "Orbital approach" },
  { id: "sensor_active", label: "Sensor Active", icon: Eye, desc: "LOS acquired" },
  { id: "capturing", label: "Capturing", icon: Camera, desc: "Swath acquisition" },
  { id: "processing", label: "Processing", icon: Cpu, desc: "Edge inference" },
  { id: "downlinking", label: "Downlinking", icon: Radio, desc: "Vector telemetry" },
  { id: "complete", label: "Complete", icon: CheckCircle2, desc: "Ground confirmed" },
];

export default function MissionPipeline({ currentStatus }: MissionPipelineProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStatus.toLowerCase());
  const isFailed = currentStatus.toLowerCase() === "failed";

  return (
    <div className="w-full bg-[#0c111c] border border-[#1e2838] rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Orbital Mission Pipeline Execution
        </span>
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-500">CURRENT STAGE:</span>
          <span
            className={`px-2 py-0.5 rounded font-semibold uppercase ${
              isFailed
                ? "bg-rose-950 text-rose-300 border border-rose-800"
                : currentIndex === STAGES.length - 1
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "bg-cyan-950 text-cyan-300 border border-cyan-800"
            }`}
          >
            {currentStatus.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = currentIndex > idx;
          const isCurrent = currentIndex === idx;
          const isPending = currentIndex < idx;

          let cardStyle = "bg-[#0f1420] border-[#1e2838] text-slate-500 opacity-60";
          let iconStyle = "text-slate-500";
          let badgeStyle = "bg-[#182030] text-slate-400";

          if (isPassed) {
            cardStyle = "bg-emerald-950/20 border-emerald-800/40 text-emerald-200";
            iconStyle = "text-emerald-400";
            badgeStyle = "bg-emerald-900/50 text-emerald-300";
          } else if (isCurrent) {
            cardStyle = "bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50";
            iconStyle = "text-cyan-400 animate-pulse";
            badgeStyle = "bg-cyan-500 text-slate-950 font-bold";
          }

          return (
            <div
              key={stage.id}
              className={`flex flex-col p-2.5 rounded-lg border transition-all ${cardStyle}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${iconStyle}`} />
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${badgeStyle}`}>
                  0{idx + 1}
                </span>
              </div>
              <span className="text-xs font-medium leading-snug">{stage.label}</span>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">{stage.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
