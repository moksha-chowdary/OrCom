"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Orbit,
  Cpu,
  Layers,
  HardDrive,
  Zap,
  Radio,
  ArrowLeft,
  ShieldCheck,
  Compass
} from "lucide-react";
import { api, Satellite, GeoPosition } from "@/lib/api-client";
import SatelliteMap from "@/components/SatelliteMap";

export default function SatelliteDetailPage() {
  const params = useParams();
  const satId = params.id as string;

  const [satellite, setSatellite] = useState<Satellite | null>(null);
  const [currentPos, setCurrentPos] = useState<GeoPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!satId) return;

    Promise.all([
      api.getSatellite(satId),
      api.getSatellitePosition(satId),
    ])
      .then(([sat, pos]) => {
        setSatellite(sat);
        setCurrentPos(pos);
      })
      .catch((err) => console.error("Error loading satellite detail", err))
      .finally(() => setIsLoading(false));

    const interval = setInterval(() => {
      api.getSatellitePosition(satId)
        .then((pos) => setCurrentPos(pos))
        .catch(() => {});
    }, 1500);

    return () => clearInterval(interval);
  }, [satId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Interrogating spacecraft telemetry bus...</p>
      </div>
    );
  }

  if (!satellite) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-slate-400">Spacecraft not found in registry.</p>
        <a href="/satellites" className="text-xs text-cyan-400 hover:underline mt-2 inline-block">
          Return to fleet view
        </a>
      </div>
    );
  }

  const isAvail = satellite.status === "available";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <a href="/satellites" className="text-slate-400 hover:text-white flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Fleet</span>
            </a>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400">{satellite.code}</span>
          </div>
          <div className="flex items-center space-x-3 mt-1">
            <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
              Spacecraft: {satellite.code}
            </h1>
            <span
              className={`text-xs font-mono px-2.5 py-0.5 rounded uppercase font-semibold ${
                isAvail
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-rose-950 text-rose-300 border border-rose-800"
              }`}
            >
              {satellite.status}
            </span>
          </div>
        </div>

        {currentPos && (
          <div className="flex items-center space-x-3 font-mono text-xs bg-[#121824] px-4 py-2 rounded-xl border border-[#1e2838]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-400">COORDINATES:</span>
            <span className="text-white font-medium">
              {currentPos.lat.toFixed(2)}°{currentPos.lat >= 0 ? "N" : "S"},{" "}
              {currentPos.lon.toFixed(2)}°{currentPos.lon >= 0 ? "E" : "W"}
            </span>
          </div>
        )}
      </div>

      {/* Full Size Live Ground Track Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
          <div className="flex items-center space-x-2">
            <Orbit className="w-4 h-4" />
            <span>ORBITAL GROUND TRACK & HORIZON COVERAGE</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Circular Keplerian Model • Sidereal Earth Rotation Corrected
          </span>
        </div>
        <SatelliteMap
          satelliteId={satellite.id}
          satelliteCode={satellite.code}
          height={440}
        />
      </div>

      {/* Detailed Spec Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orbital Mechanics Parameters */}
        <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Keplerian Orbital Elements</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">Semi-Major Axis (a)</span>
              <span className="text-white">{(6378.137 + satellite.orbit_altitude_km).toFixed(2)} km</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">Mean Orbital Altitude</span>
              <span className="text-white">{satellite.orbit_altitude_km} km LEO</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">Inclination (i)</span>
              <span className="text-white">{satellite.inclination_deg}°</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">Right Ascension of Ascending Node (RAAN)</span>
              <span className="text-white">{satellite.raan_deg}°</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">Nodal Period (T)</span>
              <span className="text-cyan-400 font-bold">{satellite.orbital_period_min} minutes</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Orbit Regimes</span>
              <span className="text-slate-200">{satellite.orbit_type}</span>
            </div>
          </div>
        </div>

        {/* Edge Computing Payload Node Hardware */}
        <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Edge Compute Hardware Payload</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">CPU Architecture</span>
              <span className="text-white">{satellite.cpu_cores} Cores @ {satellite.cpu_ghz}GHz (Rad-Tolerant)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">Onboard RAM (LPDDR4 ECC)</span>
              <span className="text-white">{satellite.ram_mb} MB</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">NAND Flash Storage</span>
              <span className="text-white">{satellite.storage_mb} MB</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">Pass Energy Budget</span>
              <span className="text-amber-400 font-bold">{satellite.power_budget_wh} Wh</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#1b2536]">
              <span className="text-slate-400">Downlink Data Rate</span>
              <span className="text-cyan-400 font-bold">{satellite.downlink_mbps} Mbps (Direct to Ground)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Mounted Payloads</span>
              <span className="text-cyan-300 uppercase">{satellite.sensors.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
