"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Rocket,
  CheckCircle2,
  Clock,
  Radio,
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap
} from "lucide-react";
import {
  api,
  Application,
  ApplicationRequirements,
  Satellite,
  PassWindow
} from "@/lib/api-client";

export default function DeployPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const appId = params.id as string;
  const satId = searchParams.get("sat") || "sat-oc-01";
  const region = searchParams.get("region") || "Andhra Pradesh";

  const [application, setApplication] = useState<Application | null>(null);
  const [requirements, setRequirements] = useState<ApplicationRequirements | null>(null);
  const [satellite, setSatellite] = useState<Satellite | null>(null);
  const [passWindow, setPassWindow] = useState<PassWindow | null>(null);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const deployStages = [
    "Packaging application payload & isolated container manifest...",
    "Verifying flight-critical safety boundary & cryptographic signature...",
    "Transmitting workload bundle to ground station uplink queue...",
    "Mission successfully scheduled with satellite flight task manager!",
  ];

  useEffect(() => {
    if (!appId) return;

    Promise.all([
      api.getApplication(appId),
      api.getApplicationRequirements(appId),
      api.getSatellite(satId),
      api.getSatelliteNextPass(satId, region),
    ])
      .then(([app, req, sat, pass]) => {
        setApplication(app);
        setRequirements(req);
        setSatellite(sat);
        setPassWindow(pass);
      })
      .catch((err) => console.error("Error loading deployment data", err))
      .finally(() => setIsLoading(false));
  }, [appId, satId, region]);

  const handleExecuteDeploy = async () => {
    setIsDeploying(true);
    setDeployStep(0);
    setErrorMessage(null);

    // Staged step progression
    const stepInterval = setInterval(() => {
      setDeployStep((prev) => {
        if (prev < 3) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 600);

    try {
      const mission = await api.deployMission(appId, {
        satellite_id: satId,
        target_region: region,
        target_lat: passWindow?.target_lat || 15.8281,
        target_lon: passWindow?.target_lon || 78.0373,
      });

      setTimeout(() => {
        router.push(`/missions/${mission.id}`);
      }, 2600);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMessage(err.message || "Deployment failed.");
      setIsDeploying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Computing deterministic pass geometry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <Rocket className="w-4 h-4" />
          <span>ORBITAL DEPLOYMENT STAGING</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Deploy to Spacecraft: {satellite?.code}
        </h1>
        <p className="text-xs text-slate-400">
          Workload '{application?.name}' will be packaged and uplinked to the spacecraft queue for the upcoming pass.
        </p>
      </div>

      {/* Deployment Readiness Checklist */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-5 space-y-3">
        <h2 className="text-xs font-mono uppercase text-slate-400">
          Pre-Flight Verification Checklist
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-[#121824] border border-emerald-900/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-slate-200">Application Validated & Sandboxed</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-[#121824] border border-emerald-900/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-slate-200">Hardware Compatibility Confirmed</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-[#121824] border border-emerald-900/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-slate-200">Resource Budget Simulation Passed</span>
          </div>
          <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-[#121824] border border-emerald-900/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-xs text-slate-200">Pass Window Geometry Acquired</span>
          </div>
        </div>
      </div>

      {/* Deterministic Pass Window Card */}
      {passWindow && (
        <div className="bg-[#0c111c] border border-cyan-800/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
              <Compass className="w-4 h-4" />
              <span>UPCOMING ORBITAL PASS WINDOW</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Deterministic Keplerian
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#121824] p-3 rounded-lg border border-[#1e2838]">
              <span className="text-slate-500 block text-[10px]">TARGET REGION</span>
              <span className="text-white font-bold block truncate">{passWindow.target_region}</span>
              <span className="text-[10px] text-slate-400">
                {passWindow.target_lat.toFixed(2)}°N, {passWindow.target_lon.toFixed(2)}°E
              </span>
            </div>

            <div className="bg-[#121824] p-3 rounded-lg border border-[#1e2838]">
              <span className="text-slate-500 block text-[10px]">PASS DURATION</span>
              <span className="text-cyan-400 font-bold block">
                {(passWindow.duration_seconds / 60).toFixed(1)} mins
              </span>
              <span className="text-[10px] text-slate-400">
                {passWindow.duration_seconds.toFixed(0)}s total
              </span>
            </div>

            <div className="bg-[#121824] p-3 rounded-lg border border-[#1e2838]">
              <span className="text-slate-500 block text-[10px]">MAX ELEVATION</span>
              <span className="text-emerald-400 font-bold block">
                {passWindow.max_elevation_deg}°
              </span>
              <span className="text-[10px] text-slate-400">Clear zenith line</span>
            </div>

            <div className="bg-[#121824] p-3 rounded-lg border border-[#1e2838]">
              <span className="text-slate-500 block text-[10px]">DOWNLINK</span>
              <span className="text-amber-400 font-bold block">{satellite?.downlink_mbps} Mbps</span>
              <span className="text-[10px] text-slate-400">Direct S-band</span>
            </div>
          </div>
        </div>
      )}

      {/* Scripted Deployment Sequence Modal / Overlay */}
      {isDeploying && (
        <div className="bg-[#0e131d] border border-cyan-500 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-semibold">
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span>DEPLOYMENT EXECUTION PIPELINE ACTIVE</span>
          </div>

          <div className="space-y-2.5">
            {deployStages.map((stage, idx) => {
              const isDone = deployStep > idx;
              const isCurrent = deployStep === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 text-xs font-mono p-2.5 rounded-lg border transition-all ${
                    isDone
                      ? "bg-emerald-950/20 border-emerald-800 text-emerald-300"
                      : isCurrent
                      ? "bg-cyan-950/40 border-cyan-600 text-white font-semibold"
                      : "bg-[#0b0f17] border-[#1e2838] text-slate-600"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                  )}
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Deploy Button */}
      {!isDeploying && (
        <button
          onClick={handleExecuteDeploy}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.01]"
        >
          <Rocket className="w-5 h-5" />
          <span>[ DEPLOY TO ORBIT ]</span>
        </button>
      )}
    </div>
  );
}
