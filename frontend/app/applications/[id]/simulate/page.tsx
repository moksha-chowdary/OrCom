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
  RotateCcw,
  Orbit
} from "lucide-react";
import {
  api,
  Application,
  ApplicationRequirements,
  Satellite,
  SimulationResult
} from "@/lib/api-client";
import SatelliteMap from "@/components/SatelliteMap";
import SplitFlapText from "@/components/ui/SplitFlapText";
import BorderGlow from "@/components/ui/BorderGlow";

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
  const [simStepText, setSimStepText] = useState("INITIALIZING SIMULATION");
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

  const targetCoordsMap: Record<string, { lat: number; lon: number }> = {
    "Andhra Pradesh": { lat: 15.8281, lon: 78.0373 },
    "Gulf of Aden": { lat: 12.8000, lon: 48.0000 },
    "Punjab": { lat: 30.9000, lon: 75.8500 },
    "Suez Canal": { lat: 30.5852, lon: 32.2654 },
  };

  const currentCoords = targetCoordsMap[targetRegion] || { lat: 15.8281, lon: 78.0373 };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimProgress(15);
    setSimStepText("CALCULATING ORBITAL PASS");
    setSimulationResult(null);
    setErrorMessage(null);

    try {
      setTimeout(() => {
        setSimProgress(50);
        setSimStepText("EVALUATING RESOURCE BUDGET");
      }, 400);

      setTimeout(() => {
        setSimProgress(85);
        setSimStepText("SIMULATING ONBOARD EXECUTION");
      }, 900);

      const result = await api.runSimulation(appId, {
        satellite_id: selectedSatId,
        target_region: targetRegion,
      });

      setTimeout(() => {
        setSimProgress(100);
        setSimStepText("SIMULATION COMPLETE");
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
        <div className="w-5 h-5 border-2 border-[#E9681B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-[#66635D]">Loading orbital simulator parameters...</p>
      </div>
    );
  }

  const selectedSat = satellites.find((s) => s.id === selectedSatId) || satellites[0];

  return (
    <div className="space-y-6">
      {/* Simulation Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#66635D] uppercase">
            <Orbit className="w-3.5 h-3.5 text-[#E9681B]" />
            <span>ORBITAL SIMULATION CENTERPIECE</span>
          </div>
          <h1 className="text-xl font-bold text-[#171717] tracking-tight mt-1">
            Simulate: {application?.name}
          </h1>
          <p className="text-xs text-[#66635D]">
            Spacecraft: <strong className="text-[#171717] font-mono">{selectedSat?.code}</strong> • Target: <strong className="text-[#171717]">{targetRegion}</strong>
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="btn-orange px-4 py-2 flex items-center space-x-2 shadow-xs disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isSimulating ? "Simulating..." : "Execute Simulation"}</span>
        </button>
      </div>

      {/* Target & Spacecraft Configuration Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spacecraft Selection */}
        <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-4 space-y-2.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase text-[#66635D] block">
            ASSIGNED SPACECRAFT
          </span>
          <div className="space-y-1.5">
            {satellites.map((sat) => (
              <label
                key={sat.id}
                className={`flex items-center justify-between p-2.5 rounded-[6px] border cursor-pointer transition-colors ${
                  selectedSatId === sat.id
                    ? "bg-[#FFF8F4] border-[#E9681B] text-[#171717]"
                    : "bg-[#F7F6F2] border-[#E8E5DD] text-[#66635D] hover:border-[#D5D1C7]"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <input
                    type="radio"
                    name="satellite"
                    checked={selectedSatId === sat.id}
                    onChange={() => setSelectedSatId(sat.id)}
                    className="accent-[#E9681B]"
                  />
                  <div>
                    <span className="font-mono font-bold text-xs text-[#171717]">{sat.code}</span>
                    <span className="text-[11px] text-[#78746D] block">
                      {sat.cpu_cores} Cores @ {sat.cpu_ghz}GHz • {sat.ram_mb} MB RAM
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold ${
                    sat.status === "available"
                      ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
                      : "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
                  }`}
                >
                  {sat.status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Target Horizon Selection */}
        <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-4 space-y-2.5 shadow-xs">
          <span className="text-[11px] font-mono uppercase text-[#66635D] block">
            TARGET HORIZON CONVERGENCE
          </span>
          <div className="space-y-1.5">
            {[
              { id: "Andhra Pradesh", label: "Andhra Pradesh (15.82°N, 78.03°E)", desc: "Forest thermal anomalies" },
              { id: "Gulf of Aden", label: "Gulf of Aden (12.80°N, 48.00°E)", desc: "Maritime choke point" },
              { id: "Punjab", label: "Punjab Agricultural Belt (30.90°N, 75.85°E)", desc: "Canopy NDVI indices" },
              { id: "Suez Canal", label: "Suez Canal (30.58°N, 32.26°E)", desc: "SAR vessel traffic" },
            ].map((reg) => (
              <label
                key={reg.id}
                className={`flex items-center justify-between p-2.5 rounded-[6px] border cursor-pointer transition-colors ${
                  targetRegion === reg.id
                    ? "bg-[#FFF8F4] border-[#E9681B] text-[#171717]"
                    : "bg-[#F7F6F2] border-[#E8E5DD] text-[#66635D] hover:border-[#D5D1C7]"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <input
                    type="radio"
                    name="targetRegion"
                    checked={targetRegion === reg.id}
                    onChange={() => setTargetRegion(reg.id)}
                    className="accent-[#E9681B]"
                  />
                  <div>
                    <span className="font-semibold text-xs text-[#171717]">{reg.label}</span>
                    <span className="text-[10px] text-[#78746D] block">{reg.desc}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Orbital View — Explains what the workload is doing (§12) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#171717]">
          <span className="font-semibold uppercase">ORBITAL VIEW & TARGET CONVERGENCE</span>
          <span className="text-[#66635D] text-[11px]">
            Orange dashed upcoming path indicates satellite approach
          </span>
        </div>
        <SatelliteMap
          satelliteId={selectedSatId}
          satelliteCode={selectedSat?.code || "OC-01"}
          targetCoords={{ lat: currentCoords.lat, lon: currentCoords.lon, label: `${targetRegion.toUpperCase()}` }}
          height={340}
        />
      </div>

      {/* Meaningful Simulation Progress State (§22) */}
      {isSimulating && (
        <div className="bg-[#FFFFFF] border border-[#E9681B] rounded-[10px] p-4 space-y-2.5 shadow-xs">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#171717] font-semibold">{simStepText}</span>
            <span className="text-[#E9681B] font-bold">{simProgress}%</span>
          </div>
          <div className="w-full bg-[#EFECE6] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#E9681B] h-full transition-all duration-300 ease-out"
              style={{ width: `${simProgress}%` }}
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Simulation Results — Tabular Readouts (§12) */}
      {simulationResult && (
        <BorderGlow active={simulationResult.status === "completed"}>
          <div className="bg-[#FFFFFF] rounded-[10px] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3.5">
              <div className="flex items-center space-x-3">
                {simulationResult.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#B91C1C]" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-[#171717] font-mono uppercase">
                    Simulation Outcome: {simulationResult.status}
                  </h3>
                  <span className="text-xs text-[#66635D]">
                    Target: {simulationResult.target_region} • Spacecraft: {simulationResult.satellite_code}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold uppercase ${
                  simulationResult.status === "completed"
                    ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
                    : "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
                }`}
              >
                {simulationResult.status === "completed" ? "Pass Verified" : "Budget Failed"}
              </span>
            </div>

            {simulationResult.failure_reason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-[6px] text-rose-700 text-xs font-mono">
                <strong>Failure Reason:</strong> {simulationResult.failure_reason}
              </div>
            )}

            {/* Tabular Resource Utilization Metrics (§12) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#F7F6F2] p-3.5 rounded-[8px] border border-[#E8E5DD] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#66635D]">RAM USAGE</span>
                  <span className="font-bold text-[#171717]">{simulationResult.ram_pct}%</span>
                </div>
                <div className="w-full bg-[#E8E5DD] rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full ${simulationResult.ram_pct > 100 ? "bg-[#B91C1C]" : "bg-[#171717]"}`}
                    style={{ width: `${Math.min(100, simulationResult.ram_pct)}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#78746D] block">
                  {requirements?.ram_mb} MB / {selectedSat.ram_mb} MB
                </span>
              </div>

              <div className="bg-[#F7F6F2] p-3.5 rounded-[8px] border border-[#E8E5DD] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#66635D]">COMPUTE PASS</span>
                  <span className="font-bold text-[#171717]">{simulationResult.cpu_pct}%</span>
                </div>
                <div className="w-full bg-[#E8E5DD] rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full ${simulationResult.cpu_pct > 100 ? "bg-[#B91C1C]" : "bg-[#171717]"}`}
                    style={{ width: `${Math.min(100, simulationResult.cpu_pct)}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#78746D] block">
                  {simulationResult.execution_seconds}s (speed factor)
                </span>
              </div>

              <div className="bg-[#F7F6F2] p-3.5 rounded-[8px] border border-[#E8E5DD] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#66635D]">POWER DRAW</span>
                  <span className="font-bold text-[#171717]">{simulationResult.power_pct}%</span>
                </div>
                <div className="w-full bg-[#E8E5DD] rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full ${simulationResult.power_pct > 100 ? "bg-[#B91C1C]" : "bg-[#171717]"}`}
                    style={{ width: `${Math.min(100, simulationResult.power_pct)}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#78746D] block">
                  {requirements?.estimated_power_wh.toFixed(1)} Wh / {selectedSat.power_budget_wh} Wh
                </span>
              </div>

              <div className="bg-[#F7F6F2] p-3.5 rounded-[8px] border border-[#E8E5DD] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#66635D]">DOWNLINK REDUCTION</span>
                  <span className="font-bold text-[#E9681B]">
                    {simulationResult.downlink_reduction_pct}%
                  </span>
                </div>
                <div className="w-full bg-[#E8E5DD] rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-[#E9681B]"
                    style={{ width: `${simulationResult.downlink_reduction_pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#78746D] block">
                  {simulationResult.input_data_mb}MB → {simulationResult.output_data_mb}MB
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between">
              <button
                onClick={handleRunSimulation}
                className="text-xs text-[#66635D] hover:text-[#171717] flex items-center space-x-1 font-mono"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-simulate</span>
              </button>

              {simulationResult.status === "completed" && (
                <a
                  href={`/applications/${application?.id}/deploy?sat=${selectedSat.id}&region=${encodeURIComponent(
                    targetRegion
                  )}`}
                  className="btn-orange px-4 py-2 flex items-center space-x-2 shadow-xs"
                >
                  <span>Schedule Pass & Deploy to Orbit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </BorderGlow>
      )}
    </div>
  );
}
