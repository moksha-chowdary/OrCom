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
  ShieldCheck,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { api, Satellite } from "@/lib/api-client";
import SatelliteMap from "@/components/SatelliteMap";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Orbit className="w-4 h-4" />
            <span>CONSTELLATION FLEET STATUS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Orbital Spacecraft Assets
          </h1>
          <p className="text-xs text-slate-400">
            Heterogeneous mock spacecraft fleet with deterministic circular Keplerian propagation and onboard edge computing payload nodes.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Provider: MockProvider</span>
        </div>
      </div>

      {/* Constellation Live Ground Track Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Radio className="w-4 h-4" />
            <span>FOCUSED ORBIT TRACK: {selectedSat?.code}</span>
          </div>
          <div className="flex items-center space-x-1 font-mono text-xs">
            {satellites.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSatId(s.id)}
                className={`px-2.5 py-1 rounded border transition-all ${
                  selectedSatId === s.id
                    ? "bg-cyan-950 text-cyan-300 border-cyan-500 font-bold"
                    : "bg-[#121824] text-slate-400 border-[#1e2838] hover:text-white"
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
            height={380}
            showAllSatellites={true}
          />
        )}
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {satellites.map((sat) => {
          const isSelected = selectedSatId === sat.id;
          const isAvail = sat.status === "available";
          return (
            <div
              key={sat.id}
              onClick={() => setSelectedSatId(sat.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-lg ${
                isSelected
                  ? "bg-[#111827] border-cyan-500 ring-1 ring-cyan-500/40"
                  : "bg-[#0e131d] border-[#1e2838] hover:border-slate-700"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-lg font-bold text-white">{sat.code}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#182233] text-slate-400">
                      {sat.orbit_type}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      isAvail
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {sat.status}
                  </span>
                </div>

                {/* Orbital Elements */}
                <div className="p-3 rounded-xl bg-[#0b0f17] border border-[#1b2536] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>ALTITUDE</span>
                    <span className="text-white">{sat.orbit_altitude_km} km</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>INCLINATION</span>
                    <span className="text-white">{sat.inclination_deg}°</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>RAAN (NODE)</span>
                    <span className="text-white">{sat.raan_deg}°</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>PERIOD</span>
                    <span className="text-cyan-400">{sat.orbital_period_min} mins</span>
                  </div>
                </div>

                {/* Hardware Spec */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Compute Bus</span>
                    </span>
                    <span className="text-white font-semibold">
                      {sat.cpu_cores} Cores @ {sat.cpu_ghz}GHz
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Payload RAM</span>
                    </span>
                    <span className="text-white font-semibold">{sat.ram_mb} MB</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pass Power Budget</span>
                    </span>
                    <span className="text-white font-semibold">{sat.power_budget_wh} Wh/pass</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center space-x-1.5 text-slate-400">
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Downlink</span>
                    </span>
                    <span className="text-white font-semibold">{sat.downlink_mbps} Mbps</span>
                  </div>
                </div>

                {/* Sensors Mounted */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1.5">
                    MOUNTED SENSORS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sat.sensors.map((sensor) => (
                      <span
                        key={sensor}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#162030] text-cyan-300 border border-cyan-800/30 uppercase"
                      >
                        {sensor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1a2230]">
                <a
                  href={`/satellites/${sat.id}`}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center justify-between w-full"
                >
                  <span>Full Telemetry Spec Sheet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
