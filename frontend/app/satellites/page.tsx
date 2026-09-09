"use client";

import React, { useEffect, useState } from "react";
import {
  Orbit,
  Cpu,
  Layers,
  HardDrive,
  Zap,
  Radio,
  ArrowRight,
  Compass,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { api, Satellite } from "@/lib/api-client";
import SatelliteMap from "@/components/SatelliteMap";
import BorderGlow from "@/components/ui/BorderGlow";

export default function SatellitesPage() {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatId, setSelectedSatId] = useState<string>("sat-oc-01");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getSatellites()
      .then((data) => {
        setSatellites(data);
        if (data.length > 0) setSelectedSatId(data[0].id);
      })
      .catch((err) => console.error("Error loading fleet", err))
      .finally(() => setIsLoading(false));
  }, []);

  const selectedSat = satellites.find((s) => s.id === selectedSatId) || satellites[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#66635D] uppercase">
            <Orbit className="w-3.5 h-3.5 text-[#E9681B]" />
            <span>HARDWARE INFRASTRUCTURE REGISTRY</span>
          </div>
          <h1 className="text-xl font-bold text-[#171717] tracking-tight font-mono">
            Spacecraft Constellation Fleet
          </h1>
          <p className="text-xs text-[#66635D]">
            Heterogeneous orbital compute nodes with circular Keplerian ground tracks and rad-hard payload processors.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-[#66635D] bg-[#F7F6F2] px-3 py-1.5 rounded-[5px] border border-[#DEDCD5]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
          <span>Provider: MockProvider (Active)</span>
        </div>
      </div>

      {/* Constellation Live Ground Track Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#171717]">
          <span className="font-semibold uppercase">FOCUSED ORBIT TRACK: {selectedSat?.code}</span>
          <div className="flex items-center space-x-1">
            {satellites.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSatId(s.id)}
                className={`px-2.5 py-1 rounded-[4px] border text-xs font-mono transition-all ${
                  selectedSatId === s.id
                    ? "bg-[#171717] text-white border-[#171717] font-bold"
                    : "bg-[#FFFFFF] text-[#66635D] border-[#DEDCD5] hover:text-[#171717]"
                }`}
              >
                {s.code}
              </button>
            ))}
          </div>
        </div>

        {selectedSat && (
          <SatelliteMap
            satelliteId={selectedSat.id}
            satelliteCode={selectedSat.code}
            height={360}
            showAllSatellites={true}
          />
        )}
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {satellites.map((sat) => {
          const isSelected = selectedSatId === sat.id;
          const isAvail = sat.status === "available";
          return (
            <BorderGlow key={sat.id} active={isSelected}>
              <div
                onClick={() => setSelectedSatId(sat.id)}
                className="p-5 bg-[#FFFFFF] rounded-[10px] cursor-pointer flex flex-col justify-between h-full space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-base font-bold text-[#171717]">{sat.code}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EFECE6] text-[#78746D]">
                        {sat.orbit_type}
                      </span>
                    </div>
                    <span
                      className={`text-[9.5px] font-mono px-2 py-0.2 rounded uppercase font-semibold ${
                        isAvail
                          ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
                          : "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]"
                      }`}
                    >
                      {sat.status}
                    </span>
                  </div>

                  {/* Orbital Elements */}
                  <div className="p-3 rounded-[6px] bg-[#F7F6F2] border border-[#E8E5DD] space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-[#66635D]">
                      <span>ALTITUDE</span>
                      <span className="text-[#171717] font-semibold">{sat.orbit_altitude_km} km</span>
                    </div>
                    <div className="flex justify-between text-[#66635D]">
                      <span>INCLINATION</span>
                      <span className="text-[#171717] font-semibold">{sat.inclination_deg}°</span>
                    </div>
                    <div className="flex justify-between text-[#66635D]">
                      <span>PERIOD</span>
                      <span className="text-[#E9681B] font-semibold">{sat.orbital_period_min}m</span>
                    </div>
                  </div>

                  {/* Hardware Spec */}
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#66635D]">COMPUTE BUS</span>
                      <span className="text-[#171717] font-semibold">
                        {sat.cpu_cores} Cores @ {sat.cpu_ghz}GHz
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66635D]">PAYLOAD RAM</span>
                      <span className="text-[#171717] font-semibold">{sat.ram_mb} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66635D]">POWER BUDGET</span>
                      <span className="text-[#171717] font-semibold">{sat.power_budget_wh} Wh/pass</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66635D]">DOWNLINK RATE</span>
                      <span className="text-[#171717] font-semibold">{sat.downlink_mbps} Mbps</span>
                    </div>
                  </div>

                  {/* Sensors */}
                  <div className="pt-2 border-t border-[#EFECE6]">
                    <span className="text-[10px] font-mono text-[#78746D] block mb-1">
                      MOUNTED SENSORS
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sat.sensors.map((sensor) => (
                        <span
                          key={sensor}
                          className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#EFECE6] text-[#171717] uppercase"
                        >
                          {sensor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EFECE6]">
                  <a
                    href={`/satellites/${sat.id}`}
                    className="text-xs text-[#E9681B] font-mono flex items-center justify-between w-full hover:underline"
                  >
                    <span>Full Engineering Documentation</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </BorderGlow>
          );
        })}
      </div>
    </div>
  );
}
