"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Cpu,
  HardDrive,
  Zap,
  ArrowRight,
  ShieldCheck,
  Compass,
  RotateCcw
} from "lucide-react";
import {
  api,
  Application,
  ApplicationRequirements,
  Satellite,
  SimulationResult
} from "@/lib/api-client";

export default function SimulatorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const appId = params.id as string;
  const initialSatId = searchParams.get("sat") || "sat-oc-01";

  const [application, setApplication] = useState<Application | null>(null);
  const [requirements, setRequirements] = useState<ApplicationRequirements | null>(null);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatId, setSelectedSatId] = useState<string>(initialSatId);
  const [targetRegion, setTargetRegion] = useState<string>("Andhra Pradesh");

  // Simulation run state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!appId) return;

    Promise.all([
      api.getApplication(appId),
      api.getApplicationRequirements(appId),
      api.getSatellites(),
    ])
      .then(([app, req, sats]) => {
        setApplication(app);
        setRequirements(req);
        setSatellites(sats);
      })
      .catch((err) => console.error("Error loading simulator", err))
      .finally(() => setIsLoading(false));
  }, [appId]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimProgress(15);
    setSimulationResult(null);
    setErrorMessage(null);

    try {
      // Stage 1: Progress reveal animation
      const progressTimer1 = setTimeout(() => setSimProgress(50), 400);
      const progressTimer2 = setTimeout(() => setSimProgress(85), 900);

      const result = await api.runSimulation(appId, {
        satellite_id: selectedSatId,
        target_region: targetRegion,
      });

      setTimeout(() => {
        setSimProgress(100);
        setSimulationResult(result);
        setIsSimulating(false);
      }, 1300);
    } catch (err: any) {
      setErrorMessage(err.message || "Simulation failed to execute.");
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Loading orbital simulator specs...</p>
      </div>
    );
  }

  const selectedSat = satellites.find((s) => s.id === selectedSatId) || satellites[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Radio className="w-4 h-4" />
            <span>DETERMINISTIC SIMULATION HARNESS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Simulate: {application?.name}
          </h1>
          <p className="text-xs text-slate-400">
            Evaluates compute passes, onboard RAM, power draw, and speed factors against actual spacecraft specs.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSimulating ? "Simulating..." : "Execute Simulation"}</span>
        </button>
      </div>

      {/* Target & Spacecraft Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spacecraft Selection */}
        <div className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-5 space-y-3">
          <label className="block text-xs font-mono uppercase text-slate-400">
            Select Assigned Spacecraft
          </label>
          <div className="space-y-2">
            {satellites.map((sat) => (
              <label
                key={sat.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSatId === sat.id
                    ? "bg-[#141d2d] border-cyan-500 text-white"
                    : "bg-[#0b0f17] border-[#1e2838] text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="satellite"
                    checked={selectedSatId === sat.id}
                    onChange={() => setSelectedSatId(sat.id)}
                    className="accent-cyan-400"
                  />
                  <div>
                    <span className="font-mono font-bold text-sm text-white">{sat.code}</span>
                    <span className="text-xs text-slate-400 block">
                      {sat.cpu_cores} Cores @ {sat.cpu_ghz}GHz • {sat.ram_mb} MB RAM
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    sat.status === "available"
                      ? "bg-emerald-950 text-emerald-300"
                      : "bg-rose-950 text-rose-300"
                  }`}
                >
                  {sat.status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Target Horizon Selection */}
        <div className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-5 space-y-3">
          <label className="block text-xs font-mono uppercase text-slate-400">
            Target Geographical Horizon
          </label>
          <div className="space-y-2">
            {[
              { id: "Andhra Pradesh", label: "Andhra Pradesh (15.82°N, 78.03°E)", desc: "Forest thermal anomalies" },
              { id: "Gulf of Aden", label: "Gulf of Aden (12.80°N, 48.00°E)", desc: "Maritime choke point" },
              { id: "Punjab", label: "Punjab Agricultural Belt (30.90°N, 75.85°E)", desc: "Canopy NDVI indices" },
              { id: "Suez Canal", label: "Suez Canal (30.58°N, 32.26°E)", desc: "SAR vessel traffic" },
            ].map((reg) => (
              <label
                key={reg.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  targetRegion === reg.id
                    ? "bg-[#141d2d] border-cyan-500 text-white"
                    : "bg-[#0b0f17] border-[#1e2838] text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="targetRegion"
                    checked={targetRegion === reg.id}
                    onChange={() => setTargetRegion(reg.id)}
                    className="accent-cyan-400"
                  />
                  <div>
                    <span className="font-semibold text-xs text-white">{reg.label}</span>
                    <span className="text-[11px] text-slate-500 block">{reg.desc}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Progress Animation Bar */}
      {isSimulating && (
        <div className="bg-[#0e131d] border border-cyan-500/40 rounded-xl p-5 space-y-3 shadow-lg">
          <div className="flex justify-between text-xs font-mono text-cyan-400">
            <span>EXECUTING ORBITAL HARDWARE PROPAGATION...</span>
            <span>{simProgress}%</span>
          </div>
          <div className="w-full bg-[#121824] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${simProgress}%` }}
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Simulation Results Display (Computed deterministically) */}
      {simulationResult && (
        <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 space-y-6 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[#1e2838] pb-4">
            <div className="flex items-center space-x-3">
              {simulationResult.status === "completed" ? (
                <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Simulation Outcome: {simulationResult.status}
                </h3>
                <p className="text-xs text-slate-400">
                  Target: {simulationResult.target_region} • Spacecraft: {simulationResult.satellite_code}
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-mono px-3 py-1 rounded-full uppercase font-bold ${
                simulationResult.status === "completed"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-rose-950 text-rose-400 border border-rose-800"
              }`}
            >
              {simulationResult.status === "completed" ? "Pass Verified" : "Failed Budget"}
            </span>
          </div>

          {simulationResult.failure_reason && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/70 rounded-lg text-rose-300 text-xs">
              <strong>Failure Cause:</strong> {simulationResult.failure_reason}
            </div>
          )}

          {/* Computed Resource Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* RAM Utilization */}
            <div className="bg-[#121824] p-4 rounded-xl border border-[#1e2838] space-y-2">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>RAM Usage</span>
                <span className="font-mono text-cyan-400">{simulationResult.ram_pct}%</span>
              </span>
              <div className="w-full bg-[#1b2536] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${
                    simulationResult.ram_pct > 100 ? "bg-rose-500" : "bg-cyan-400"
                  }`}
                  style={{ width: `${Math.min(100, simulationResult.ram_pct)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block font-mono">
                {requirements?.ram_mb} MB / {selectedSat.ram_mb} MB
              </span>
            </div>

            {/* Compute Pass Window */}
            <div className="bg-[#121824] p-4 rounded-xl border border-[#1e2838] space-y-2">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Pass Compute</span>
                <span className="font-mono text-cyan-400">{simulationResult.cpu_pct}%</span>
              </span>
              <div className="w-full bg-[#1b2536] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${
                    simulationResult.cpu_pct > 100 ? "bg-rose-500" : "bg-cyan-400"
                  }`}
                  style={{ width: `${Math.min(100, simulationResult.cpu_pct)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block font-mono">
                {simulationResult.execution_seconds}s (speed adjusted)
              </span>
            </div>

            {/* Power Budget */}
            <div className="bg-[#121824] p-4 rounded-xl border border-[#1e2838] space-y-2">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Power Draw</span>
                <span className="font-mono text-amber-400">{simulationResult.power_pct}%</span>
              </span>
              <div className="w-full bg-[#1b2536] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${
                    simulationResult.power_pct > 100 ? "bg-rose-500" : "bg-amber-400"
                  }`}
                  style={{ width: `${Math.min(100, simulationResult.power_pct)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block font-mono">
                {requirements?.estimated_power_wh.toFixed(1)} Wh / {selectedSat.power_budget_wh} Wh
              </span>
            </div>

            {/* Downlink Advantage */}
            <div className="bg-[#121824] p-4 rounded-xl border border-[#1e2838] space-y-2">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Downlink Savings</span>
                <span className="font-mono text-emerald-400">
                  {simulationResult.downlink_reduction_pct}%
                </span>
              </span>
              <div className="w-full bg-[#1b2536] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${simulationResult.downlink_reduction_pct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block font-mono">
                {simulationResult.input_data_mb}MB → {simulationResult.output_data_mb}MB
              </span>
            </div>
          </div>

          {/* Action to proceed to deployment */}
          <div className="pt-4 border-t border-[#1e2838] flex items-center justify-between">
            <button
              onClick={handleRunSimulation}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-run Simulation</span>
            </button>

            {simulationResult.status === "completed" && (
              <a
                href={`/applications/${application?.id}/deploy?sat=${selectedSat.id}&region=${encodeURIComponent(
                  targetRegion
                )}`}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02]"
              >
                <span>Schedule Pass & Deploy to Orbit</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
