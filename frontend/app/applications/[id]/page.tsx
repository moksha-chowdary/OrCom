"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Cpu,
  HardDrive,
  Radio,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import {
  api,
  Application,
  ApplicationRequirements,
  ValidationReport,
  CompatibilityResult
} from "@/lib/api-client";
import BorderGlow from "@/components/ui/BorderGlow";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [requirements, setRequirements] = useState<ApplicationRequirements | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!appId) return;

    Promise.all([
      api.getApplication(appId),
      api.getApplicationRequirements(appId),
      api.getApplicationValidation(appId),
      api.checkCompatibility(appId),
    ])
      .then(([app, req, val, comp]) => {
        setApplication(app);
        setRequirements(req);
        setValidationReport(val);
        setCompatibility(comp);
      })
      .catch((err) => console.error("Failed to load application detail", err))
      .finally(() => setIsLoading(false));
  }, [appId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-5 h-5 border-2 border-[#E9681B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-[#66635D]">Running static infrastructure analysis...</p>
      </div>
    );
  }

  if (!application || !requirements) {
    return (
      <div className="py-24 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <h2 className="text-sm font-semibold text-[#171717]">Application Not Found</h2>
      </div>
    );
  }

  const downlinkReduction = (
    (1.0 - requirements.output_size_mb / (requirements.input_size_mb || 1.0)) *
    100.0
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EFECE6] text-[#171717]">
              {application.language}
            </span>
            <span className="text-xs font-mono text-[#78746D]">v{application.version}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] uppercase font-semibold">
              {application.status}
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#171717] tracking-tight">{application.name}</h1>
          <p className="text-xs font-mono text-[#78746D]">WORKLOAD ID: {application.id}</p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={`/applications/${application.id}/simulate`}
            className="btn-orange px-4 py-2 flex items-center space-x-1.5 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Orbit Simulation</span>
          </a>
        </div>
      </div>

      {/* Resource Envelope Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[8px] p-3.5 shadow-xs">
          <span className="text-[11px] text-[#66635D] block font-mono">RAM ENVELOPE</span>
          <span className="font-mono text-lg font-bold text-[#171717] mt-0.5 block">{requirements.ram_mb} MB</span>
          <span className="text-[10px] text-[#78746D] block mt-0.5">Payload allocation</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[8px] p-3.5 shadow-xs">
          <span className="text-[11px] text-[#66635D] block font-mono">COMPUTE WINDOW</span>
          <span className="font-mono text-lg font-bold text-[#171717] mt-0.5 block">{requirements.cpu_seconds}s</span>
          <span className="text-[10px] text-[#78746D] block mt-0.5">Pass execution budget</span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[8px] p-3.5 shadow-xs">
          <span className="text-[11px] text-[#66635D] block font-mono">DOWNLINK SAVINGS</span>
          <span className="font-mono text-lg font-bold text-[#15803D] mt-0.5 block">{downlinkReduction}%</span>
          <span className="text-[10px] text-[#78746D] block mt-0.5">
            {requirements.input_size_mb}MB raw → {requirements.output_size_mb}MB alert
          </span>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[8px] p-3.5 shadow-xs">
          <span className="text-[11px] text-[#66635D] block font-mono">SENSOR TYPE</span>
          <span className="font-mono text-xs font-bold text-[#E9681B] uppercase truncate block mt-1.5">
            {requirements.input_type}
          </span>
          <span className="text-[10px] text-[#78746D] block mt-0.5">Imaging complement</span>
        </div>
      </div>

      {/* Static Validation & Security Checklist (§11) */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-5 space-y-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#171717]" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#171717] font-semibold">
            Infrastructure Compatibility & Security Gate
          </h2>
        </div>

        <div className="space-y-2">
          {validationReport?.checks.map((c, idx) => {
            const isPass = c.status === "pass";
            const isWarn = c.status === "warn";
            return (
              <div
                key={idx}
                className={`p-3 rounded-[6px] border flex items-start space-x-3 transition-colors ${
                  isPass
                    ? "bg-[#FAFAFA] border-[#E8E5DD]"
                    : isWarn
                    ? "bg-[#FFFBEB] border-[#FDE68A]"
                    : "bg-[#FEF2F2] border-[#FECACA]"
                }`}
              >
                {isPass ? (
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0 mt-0.5" />
                ) : isWarn ? (
                  <AlertTriangle className="w-4 h-4 text-[#B45309] flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#B91C1C] flex-shrink-0 mt-0.5" />
                )}

                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#171717]">{c.title}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold ${
                        isPass
                          ? "bg-[#F0FDF4] text-[#15803D]"
                          : isWarn
                          ? "bg-[#FFFBEB] text-[#B45309]"
                          : "bg-[#FEF2F2] text-[#B91C1C]"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#66635D]">{c.message}</p>
                  {c.suggested_action && (
                    <div className="text-[11px] text-[#B45309] font-mono pt-0.5">
                      Recommended: {c.suggested_action}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fleet Compatibility Matrix (§11) */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-[#171717]" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#171717] font-semibold">
              Fleet Spacecraft Compatibility Analysis
            </h2>
          </div>
          {compatibility?.recommended_satellite_id && (
            <span className="text-xs font-mono text-[#E9681B] font-semibold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended: {compatibility.recommended_satellite_id.toUpperCase()}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {compatibility?.satellites.map((sat) => {
            const isComp = sat.compatible;
            const isRec = compatibility.recommended_satellite_id === sat.satellite_id;
            return (
              <BorderGlow key={sat.satellite_id} active={isRec}>
                <div className="p-4 bg-[#FFFFFF] rounded-[8px] flex flex-col justify-between space-y-3 h-full">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-[#171717]">{sat.satellite_code}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.2 rounded font-semibold uppercase ${
                          isComp
                            ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
                            : "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
                        }`}
                      >
                        {sat.status}
                      </span>
                    </div>

                    <ul className="space-y-1 text-xs text-[#66635D] font-mono">
                      {sat.reasons.map((r, i) => (
                        <li
                          key={i}
                          className={r.startsWith("✓") ? "text-[#15803D]" : "text-[#B91C1C]"}
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#EFECE6]">
                    <a
                      href={`/applications/${application.id}/simulate?sat=${sat.satellite_id}`}
                      className={`w-full py-1.5 rounded-[5px] text-xs font-mono text-center block transition-colors ${
                        isRec
                          ? "bg-[#E9681B] hover:bg-[#D65A12] text-white font-semibold"
                          : isComp
                          ? "bg-[#171717] hover:bg-[#2B2B2B] text-white"
                          : "bg-[#EFECE6] text-[#78746D]"
                      }`}
                    >
                      {isRec ? "Simulate Recommended" : "Select for Simulation"}
                    </a>
                  </div>
                </div>
              </BorderGlow>
            );
          })}
        </div>
      </div>
    </div>
  );
}
