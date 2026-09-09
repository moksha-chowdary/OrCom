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
  AlertTriangle
} from "lucide-react";
import {
  api,
  Application,
  ApplicationRequirements,
  Satellite,
  PassWindow
} from "@/lib/api-client";
import BorderGlow from "@/components/ui/BorderGlow";

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
    "PACKAGING APPLICATION PAYLOAD & MANIFEST...",
    "VERIFYING FLIGHT-CRITICAL ISOLATION SIGNATURE...",
    "UPLINKING WORKLOAD TO GROUND STATION QUEUE...",
    "MISSION SCHEDULED WITH SPACECRAFT TASK CONTROLLER!",
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
        <div className="w-5 h-5 border-2 border-[#E9681B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-[#66635D]">Acquiring deterministic pass geometry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-6 shadow-xs space-y-1">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#66635D] uppercase">
          <Rocket className="w-3.5 h-3.5 text-[#E9681B]" />
          <span>PRE-FLIGHT STAGING</span>
        </div>
        <h1 className="text-xl font-bold text-[#171717] tracking-tight font-mono">
          Schedule & Deploy: {satellite?.code}
        </h1>
        <p className="text-xs text-[#66635D]">
          Uplink '{application?.name}' to the spacecraft queue for the upcoming target pass.
        </p>
      </div>

      {/* Verification Checklist */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-5 space-y-3 shadow-xs">
        <span className="text-[11px] font-mono uppercase text-[#66635D] block font-semibold">
          Flight Readiness Checklist
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2 p-2.5 rounded-[5px] bg-[#F7F6F2] border border-[#E8E5DD]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
            <span className="text-[#171717]">Workload Sandboxed</span>
          </div>
          <div className="flex items-center space-x-2 p-2.5 rounded-[5px] bg-[#F7F6F2] border border-[#E8E5DD]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
            <span className="text-[#171717]">Hardware Envelope Matched</span>
          </div>
          <div className="flex items-center space-x-2 p-2.5 rounded-[5px] bg-[#F7F6F2] border border-[#E8E5DD]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
            <span className="text-[#171717]">Simulation Budget Confirmed</span>
          </div>
          <div className="flex items-center space-x-2 p-2.5 rounded-[5px] bg-[#F7F6F2] border border-[#E8E5DD]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
            <span className="text-[#171717]">Pass Geometry Acquired</span>
          </div>
        </div>
      </div>

      {/* Deterministic Pass Window Card */}
      {passWindow && (
        <BorderGlow active={true}>
          <div className="bg-[#FFFFFF] rounded-[10px] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-mono text-[#171717]">
                <Compass className="w-4 h-4 text-[#E9681B]" />
                <span className="font-semibold uppercase">NEXT DETERMINISTIC PASS WINDOW</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EFECE6] text-[#171717]">
                KEPLERIAN SSO
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="bg-[#F7F6F2] p-2.5 rounded-[6px] border border-[#E8E5DD]">
                <span className="text-[#78746D] block text-[10px]">TARGET</span>
                <span className="text-[#171717] font-bold block truncate">{passWindow.target_region}</span>
                <span className="text-[10px] text-[#78746D]">
                  {passWindow.target_lat.toFixed(2)}°N, {passWindow.target_lon.toFixed(2)}°E
                </span>
              </div>

              <div className="bg-[#F7F6F2] p-2.5 rounded-[6px] border border-[#E8E5DD]">
                <span className="text-[#78746D] block text-[10px]">DURATION</span>
                <span className="text-[#E9681B] font-bold block">
                  {(passWindow.duration_seconds / 60).toFixed(1)} mins
                </span>
                <span className="text-[10px] text-[#78746D]">
                  {passWindow.duration_seconds.toFixed(0)}s pass
                </span>
              </div>

              <div className="bg-[#F7F6F2] p-2.5 rounded-[6px] border border-[#E8E5DD]">
                <span className="text-[#78746D] block text-[10px]">MAX ELEVATION</span>
                <span className="text-[#15803D] font-bold block">
                  {passWindow.max_elevation_deg}°
                </span>
                <span className="text-[10px] text-[#78746D]">Zenith line</span>
              </div>

              <div className="bg-[#F7F6F2] p-2.5 rounded-[6px] border border-[#E8E5DD]">
                <span className="text-[#78746D] block text-[10px]">DOWNLINK</span>
                <span className="text-[#171717] font-bold block">{satellite?.downlink_mbps} Mbps</span>
                <span className="text-[10px] text-[#78746D]">Direct S-band</span>
              </div>
            </div>
          </div>
        </BorderGlow>
      )}

      {/* Scripted Deployment Sequence */}
      {isDeploying && (
        <div className="bg-[#FFFFFF] border border-[#E9681B] rounded-[10px] p-5 space-y-3 shadow-xs">
          <div className="flex items-center space-x-2 text-[#E9681B] font-mono text-xs font-semibold">
            <div className="w-3.5 h-3.5 border-2 border-[#E9681B] border-t-transparent rounded-full animate-spin" />
            <span>DEPLOYMENT STAGING PIPELINE EXECUTING</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {deployStages.map((stage, idx) => {
              const isDone = deployStep > idx;
              const isCurrent = deployStep === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center space-x-2.5 p-2 rounded-[5px] border transition-all ${
                    isDone
                      ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]"
                      : isCurrent
                      ? "bg-[#FFF8F4] border-[#E9681B] text-[#171717] font-semibold"
                      : "bg-[#F7F6F2] border-[#E8E5DD] text-[#A5A198]"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#E9681B] border-t-transparent animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#D5D1C7] flex-shrink-0" />
                  )}
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Deploy CTA */}
      {!isDeploying && (
        <button
          onClick={handleExecuteDeploy}
          className="w-full py-3 rounded-[7px] bg-[#E9681B] hover:bg-[#D65A12] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xs transition-colors"
        >
          <Rocket className="w-4 h-4" />
          <span>[ DEPLOY TO ORBIT ]</span>
        </button>
      )}
    </div>
  );
}
