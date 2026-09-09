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
  Target
} from "lucide-react";
import {
  api,
  MissionStatusResponse,
  MissionResult
} from "@/lib/api-client";
import MissionPipeline from "@/components/MissionPipeline";
import SatelliteMap from "@/components/SatelliteMap";
import SplitFlapText from "@/components/ui/SplitFlapText";
import BorderGlow from "@/components/ui/BorderGlow";

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
        <div className="w-5 h-5 border-2 border-[#E9681B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-[#66635D]">Acquiring orbital telemetry stream...</p>
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
      {/* Mission Header */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-1.5 py-0.5 rounded bg-[#EFECE6] text-[#171717] font-semibold uppercase">
              MISSION OPS
            </span>
            <span className="text-[#66635D]">
              CODE: <strong className="text-[#171717]">{missionInfo?.mission_code || missionId}</strong>
            </span>
            <span className="text-[#A5A198]">•</span>
            <span className="text-[#66635D]">
              SPACECRAFT: <strong className="text-[#E9681B]">{satCode}</strong>
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#171717] tracking-tight">
            {missionInfo?.application_name || "Orbital In-Flight Mission"}
          </h1>
          <p className="text-xs text-[#66635D]">
            Target Horizon: {targetRegion} ({targetLat.toFixed(2)}°N, {targetLon.toFixed(2)}°E)
          </p>
        </div>

        <div className="flex items-center space-x-2.5 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-[6px] bg-[#F7F6F2] border border-[#E8E5DD]">
            <span className="text-[#78746D] block text-[9.5px]">PROGRESS</span>
            <span className="text-[#171717] font-bold">{statusData?.progress_pct || 0}%</span>
          </div>
          <div className="px-3 py-1.5 rounded-[6px] bg-[#F7F6F2] border border-[#E8E5DD]">
            <span className="text-[#78746D] block text-[9.5px]">ACTIVE STAGE</span>
            <span className="text-[#E9681B] font-bold">{statusData?.current_phase}</span>
          </div>
        </div>
      </div>

      {/* Multi-Stage Mission Lifecycle Pipeline */}
      <MissionPipeline currentStatus={statusData?.status || "scheduled"} />

      {/* Synchronized Orbital Asset Tracking Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#171717]">
          <span className="font-semibold uppercase">REAL-TIME ORBIT TRACKING & CONVERGENCE</span>
          <span className="text-[#66635D] text-[11px]">
            Spacecraft visibly enters target horizon during SENSOR ACTIVE phase
          </span>
        </div>
        <SatelliteMap
          satelliteId={satId}
          satelliteCode={satCode}
          targetCoords={{ lat: targetLat, lon: targetLon, label: `${targetRegion.toUpperCase()} TARGET` }}
          height={360}
        />
      </div>

      {/* Mission Result Card (Unlocked upon complete) */}
      {resultData && (
        <BorderGlow active={true}>
          <div className="bg-[#FFFFFF] rounded-[10px] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                <div>
                  <h3 className="text-sm font-bold text-[#171717] font-mono uppercase">
                    Orbital Detection Package Verified
                  </h3>
                  <span className="text-xs text-[#15803D] font-mono">
                    Ground Station Downlink Decoded • Checksum Validated
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] text-[11px] font-mono font-bold uppercase">
                100% Success
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-[#F7F6F2] p-3 rounded-[6px] border border-[#E8E5DD]">
                <span className="text-[#78746D] block text-[10px]">DETECTION EVENT</span>
                <span className="text-[#171717] font-bold text-xs block mt-0.5">
                  {resultData.detection_label}
                </span>
                <span className="text-[10px] text-[#15803D] block mt-0.5">
                  Confidence: {resultData.confidence}%
                </span>
              </div>

              <div className="bg-[#F7F6F2] p-3 rounded-[6px] border border-[#E8E5DD]">
                <span className="text-[#78746D] block text-[10px]">DOWNLINK REDUCTION</span>
                <span className="text-[#E9681B] font-bold text-xs block mt-0.5">
                  {resultData.downlink_reduction_pct}%
                </span>
                <span className="text-[10px] text-[#78746D] block mt-0.5">
                  {resultData.input_mb}MB raw → {resultData.output_mb}MB alert
                </span>
              </div>

              <div className="bg-[#F7F6F2] p-3 rounded-[6px] border border-[#E8E5DD]">
                <span className="text-[#78746D] block text-[10px]">EXECUTION TIME</span>
                <span className="text-[#171717] font-bold text-xs block mt-0.5">
                  {resultData.processing_seconds}s
                </span>
                <span className="text-[10px] text-[#78746D] block mt-0.5">
                  Rad-Hard Edge Container
                </span>
              </div>

              <div className="bg-[#F7F6F2] p-3 rounded-[6px] border border-[#E8E5DD]">
                <span className="text-[#78746D] block text-[10px]">TARGET COORDINATES</span>
                <span className="text-[#171717] font-bold text-xs block mt-0.5">
                  {resultData.target_lat.toFixed(4)}°N
                </span>
                <span className="text-[10px] text-[#78746D] block mt-0.5">
                  {resultData.target_lon.toFixed(4)}°E
                </span>
              </div>
            </div>
          </div>
        </BorderGlow>
      )}

      {/* Telemetry Event Log */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-5 space-y-2.5 font-mono shadow-xs">
        <div className="flex items-center justify-between border-b border-[#EFECE6] pb-2 text-xs">
          <div className="flex items-center space-x-2 text-[#171717]">
            <Terminal className="w-3.5 h-3.5 text-[#171717]" />
            <span className="font-semibold uppercase">SPACECRAFT TELEMETRY LOG</span>
          </div>
          <span className="text-[10px] text-[#78746D]">AOS TELEMETRY</span>
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs">
          {statusData?.latest_logs && statusData.latest_logs.length > 0 ? (
            statusData.latest_logs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-[#252525]">
                <span className="text-[#78746D] text-[10px] select-none">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="px-1 py-0.2 rounded text-[9.5px] bg-[#EFECE6] text-[#171717]">
                  [{log.phase}]
                </span>
                <span className="text-[#171717]">{log.message}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#78746D]">Awaiting first telemetry frame...</p>
          )}
        </div>
      </div>
    </div>
  );
}
