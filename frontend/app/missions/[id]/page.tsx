"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  Radio,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Zap,
  ArrowDownToLine,
  Share2,
  ExternalLink,
  Target
} from "lucide-react";
import {
  api,
  MissionStatusResponse,
  MissionResult
} from "@/lib/api-client";
import MissionPipeline from "@/components/MissionPipeline";
import SatelliteMap from "@/components/SatelliteMap";

export default function MissionDetailPage() {
  const params = useParams();
  const missionId = params.id as string;

  const [statusData, setStatusData] = useState<MissionStatusResponse | null>(null);
  const [resultData, setResultData] = useState<MissionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [missionInfo, setMissionInfo] = useState<any>(null);

  // Poll mission status every 2.5s
  useEffect(() => {
    if (!missionId) return;

    let isMounted = true;

    const pollStatus = async () => {
      try {
        const data = await api.getMissionStatus(missionId);
        if (isMounted) {
          setStatusData(data);
          if (data.result) {
            setResultData(data.result);
          } else if (data.status === "complete") {
            // Fetch explicit result endpoint
            api.getMissionResult(missionId).then((res) => {
              if (isMounted) setResultData(res);
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error("Mission status poll error", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [missionId]);

  // Fetch static mission details once
  useEffect(() => {
    if (!missionId) return;
    api.listMissions().then((missions) => {
      const m = missions.find((x) => x.id === missionId);
      if (m) setMissionInfo(m);
    }).catch(() => {});
  }, [missionId]);

  if (isLoading && !statusData) {
    return (
      <div className="py-24 text-center">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Locking mission telemetry channel...</p>
      </div>
    );
  }

  const satCode = missionInfo?.satellite_code || "OC-01";
  const satId = missionInfo?.satellite_id || "sat-oc-01";
  const targetLat = missionInfo?.target_lat || 15.8281;
  const targetLon = missionInfo?.target_lon || 78.0373;
  const targetRegion = missionInfo?.target_region || "Andhra Pradesh";

  return (
    <div className="space-y-6">
      {/* Mission Header Banner */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              MISSION OPERATIONS
            </span>
            <span className="font-mono text-xs text-slate-400">
              CODE: <strong className="text-white">{missionInfo?.mission_code || missionId}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-xs text-slate-400">
              SPACECRAFT: <strong className="text-cyan-400">{satCode}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {missionInfo?.application_name || "Orbital In-Flight Mission"}
          </h1>
          <p className="text-xs text-slate-400">
            Target Horizon: {targetRegion} ({targetLat.toFixed(2)}°N, {targetLon.toFixed(2)}°E)
          </p>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="px-3 py-2 rounded-lg bg-[#141b29] border border-[#1e2838] text-slate-300">
            <span className="text-slate-500 block text-[10px]">PROGRESS</span>
            <span className="text-cyan-400 font-bold">{statusData?.progress_pct || 0}%</span>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[#141b29] border border-[#1e2838] text-slate-300">
            <span className="text-slate-500 block text-[10px]">CURRENT PHASE</span>
            <span className="text-emerald-400 font-bold">{statusData?.current_phase}</span>
          </div>
        </div>
      </div>

      {/* Multi-Stage Mission Pipeline */}
      <MissionPipeline currentStatus={statusData?.status || "scheduled"} />

      {/* Synchronized World Map & Convergence View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>REAL-TIME ORBITAL ASSET TRACKING & CONVERGENCE</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Spacecraft visibly reaches target vicinity during sensor_active phase
          </span>
        </div>
        <SatelliteMap
          satelliteId={satId}
          satelliteCode={satCode}
          targetCoords={{ lat: targetLat, lon: targetLon, label: `${targetRegion.toUpperCase()} TARGET` }}
          height={380}
        />
      </div>

      {/* Mission Result Card (Rendered upon complete) */}
      {resultData && (
        <div className="bg-gradient-to-br from-[#0c161f] via-[#0d1824] to-[#0a121d] border border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Mission Payload Result Verified
                </h3>
                <span className="text-xs text-emerald-300 font-mono">
                  Ground Station Downlink Decoded • Telemetry Checksum Validated
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold uppercase">
              100% Success
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#101724] p-3.5 rounded-xl border border-[#1e2838]">
              <span className="text-slate-500 block text-[10px]">DETECTION PAYLOAD</span>
              <span className="text-emerald-400 font-bold text-sm block mt-0.5">
                {resultData.detection_label}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Confidence: <strong className="text-white">{resultData.confidence}%</strong>
              </span>
            </div>

            <div className="bg-[#101724] p-3.5 rounded-xl border border-[#1e2838]">
              <span className="text-slate-500 block text-[10px]">DOWNLINK REDUCTION</span>
              <span className="text-cyan-400 font-bold text-sm block mt-0.5">
                {resultData.downlink_reduction_pct}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {resultData.input_mb}MB raw → {resultData.output_mb}MB alert
              </span>
            </div>

            <div className="bg-[#101724] p-3.5 rounded-xl border border-[#1e2838]">
              <span className="text-slate-500 block text-[10px]">PROCESSING TIME</span>
              <span className="text-amber-400 font-bold text-sm block mt-0.5">
                {resultData.processing_seconds}s
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                ARM Rad-Hard Vector Engine
              </span>
            </div>

            <div className="bg-[#101724] p-3.5 rounded-xl border border-[#1e2838]">
              <span className="text-slate-500 block text-[10px]">COORDINATES ISOLATED</span>
              <span className="text-white font-bold text-sm block mt-0.5">
                {resultData.target_lat.toFixed(4)}°N
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {resultData.target_lon.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Live Telemetry Console Logs */}
      <div className="bg-[#0b0f17] border border-[#1e2838] rounded-2xl p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-[#1a2230] pb-2 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>ORBITAL TELEMETRY EVENT LOG</span>
          </div>
          <span className="text-[10px] text-slate-600">LIVE FEED</span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
          {statusData?.latest_logs && statusData.latest_logs.length > 0 ? (
            statusData.latest_logs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-slate-300">
                <span className="text-slate-500 text-[10px] select-none">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#141b29] text-cyan-400 border border-cyan-900/40">
                  [{log.phase}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Waiting for first telemetry frame packet...</p>
          )}
        </div>
      </div>
    </div>
  );
}
