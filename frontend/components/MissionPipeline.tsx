"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Radio,
  Eye,
  Camera,
  Cpu,
  ArrowDownToLine,
  Navigation
} from "lucide-react";
import SplitFlapText from "./ui/SplitFlapText";

interface MissionPipelineProps {
  currentStatus: string;
}

const STAGES = [
  { id: "scheduled", label: "SCHEDULED", desc: "Uplink verified" },
  { id: "awaiting_pass", label: "PASS ACQUIRED", desc: "AOS horizon" },
  { id: "sensor_active", label: "SENSOR ACTIVE", desc: "Payload energized" },
  { id: "capturing", label: "CAPTURING", desc: "Swath acquisition" },
  { id: "processing", label: "PROCESSING", desc: "Edge inference" },
  { id: "downlinking", label: "DOWNLINKING", desc: "Vector telemetry" },
  { id: "complete", label: "COMPLETE", desc: "Ground confirmed" },
];

export default function MissionPipeline({ currentStatus }: MissionPipelineProps) {
  const normStatus = currentStatus.toLowerCase();
  const currentIndex = STAGES.findIndex((s) => s.id === normStatus);
  const activeStage = STAGES[Math.max(0, currentIndex)] || STAGES[0];

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Status Header with SplitFlap Instrumentation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFECE6] pb-3.5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#66635D] block">
            MISSION LIFECYCLE INSTRUMENTATION
          </span>
          <span className="text-xs text-[#171717] font-medium">
            Active Spacecraft Task Execution
          </span>
        </div>

        {/* SplitFlap Instrumentation Display */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-[#66635D] uppercase">STATE:</span>
          <SplitFlapText text={activeStage.label} size="sm" />
        </div>
      </div>

      {/* Stepper Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {STAGES.map((stage, idx) => {
          const isPassed = currentIndex > idx;
          const isCurrent = currentIndex === idx;

          let bg = "bg-[#F7F6F2] border-[#E8E5DD] text-[#8C887E]";
          let numColor = "text-[#A5A198]";
          let labelColor = "text-[#8C887E]";

          if (isPassed) {
            bg = "bg-[#FFFFFF] border-[#DEDCD5] text-[#171717]";
            numColor = "text-[#15803D]";
            labelColor = "text-[#171717]";
          } else if (isCurrent) {
            bg = "bg-[#FFF8F4] border-[#E9681B] text-[#171717] shadow-xs";
            numColor = "text-[#E9681B]";
            labelColor = "text-[#171717] font-semibold";
          }

          return (
            <div
              key={stage.id}
              className={`flex flex-col p-2 rounded-[6px] border transition-all ${bg}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono font-bold ${numColor}`}>
                  0{idx + 1}
                </span>
                {isPassed && <CheckCircle2 className="w-3 h-3 text-[#15803D]" />}
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#E9681B] animate-pulse" />}
              </div>
              <span className={`text-[11px] font-mono truncate ${labelColor}`}>
                {stage.label}
              </span>
              <span className="text-[9.5px] text-[#66635D] truncate mt-0.5">
                {stage.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
