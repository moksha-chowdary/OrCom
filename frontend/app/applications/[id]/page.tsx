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
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Validating edge application bundle...</p>
      </div>
    );
  }

  if (!application || !requirements) {
    return (
      <div className="py-24 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h2 className="text-base font-semibold text-white">Application Not Found</h2>
      </div>
    );
  }

  const downlinkReduction = (
    (1.0 - requirements.output_size_mb / (requirements.input_size_mb || 1.0)) *
    100.0
  ).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              {application.language} Workload
            </span>
            <span className="text-xs font-mono text-slate-500">v{application.version}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
              {application.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{application.name}</h1>
          <p className="text-xs text-slate-400 font-mono">ID: {application.id}</p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={`/applications/${application.id}/simulate`}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-950/40 transition-all hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Orbit Simulation</span>
          </a>
        </div>
      </div>

      {/* Requirements Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0c111c] border border-[#1e2838] rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">RAM Footprint</span>
          <span className="font-mono text-xl font-bold text-cyan-400">{requirements.ram_mb} MB</span>
          <span className="text-[10px] text-slate-500 block mt-1">Allocated payload memory</span>
        </div>
        <div className="bg-[#0c111c] border border-[#1e2838] rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Compute Pass Window</span>
          <span className="font-mono text-xl font-bold text-cyan-400">{requirements.cpu_seconds}s</span>
          <span className="text-[10px] text-slate-500 block mt-1">Estimated execution budget</span>
        </div>
        <div className="bg-[#0c111c] border border-[#1e2838] rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Downlink Savings</span>
          <span className="font-mono text-xl font-bold text-emerald-400">{downlinkReduction}%</span>
          <span className="text-[10px] text-slate-500 block mt-1">
            {requirements.input_size_mb}MB raw → {requirements.output_size_mb}MB alert
          </span>
        </div>
        <div className="bg-[#0c111c] border border-[#1e2838] rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Sensor Compatibility</span>
          <span className="font-mono text-xs font-bold text-amber-400 uppercase truncate block">
            {requirements.input_type}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Target imaging payload</span>
        </div>
      </div>

      {/* Validation Checklist */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            Static Validation & Security Sandbox Checklist
          </h2>
        </div>

        <div className="space-y-3">
          {validationReport?.checks.map((c, idx) => {
            const isPass = c.status === "pass";
            const isWarn = c.status === "warn";
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start space-x-3 transition-colors ${
                  isPass
                    ? "bg-emerald-950/10 border-emerald-900/30"
                    : isWarn
                    ? "bg-amber-950/20 border-amber-900/40"
                    : "bg-rose-950/20 border-rose-900/40"
                }`}
              >
                {isPass ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : isWarn ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{c.title}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.2 rounded uppercase font-semibold ${
                        isPass
                          ? "text-emerald-400"
                          : isWarn
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{c.message}</p>
                  {c.suggested_action && (
                    <div className="text-[11px] text-amber-300/90 font-mono pt-1 flex items-center space-x-1">
                      <span>Suggested: {c.suggested_action}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fleet Compatibility Matrix */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Fleet Compatibility Matrix (Mock Spacecraft)
            </h2>
          </div>
          {compatibility?.recommended_satellite_id && (
            <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended: {compatibility.recommended_satellite_id.toUpperCase()}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {compatibility?.satellites.map((sat) => {
            const isComp = sat.compatible;
            return (
              <div
                key={sat.satellite_id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                  isComp
                    ? "bg-[#0b121b] border-emerald-900/40"
                    : "bg-[#0f1117] border-rose-900/30 opacity-75"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-white">{sat.satellite_code}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                        isComp
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {sat.status}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                    {sat.reasons.map((r, i) => (
                      <li
                        key={i}
                        className={r.startsWith("✓") ? "text-emerald-300" : "text-rose-300"}
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#1a2230]">
                  <a
                    href={`/applications/${application.id}/simulate?sat=${sat.satellite_id}`}
                    className={`w-full py-1.5 rounded text-xs font-mono text-center block transition-colors ${
                      isComp
                        ? "bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/40"
                        : "bg-[#182030] text-slate-400 hover:text-white"
                    }`}
                  >
                    Select for Simulation
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
