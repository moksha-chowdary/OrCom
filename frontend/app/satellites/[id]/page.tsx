"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Orbit,
  Cpu,
  Layers,
  HardDrive,
  Zap,
  Radio,
  ArrowLeft,
  ShieldCheck,
  Compass,
  Activity,
  Server,
  Box,
  Lock,
  Camera
} from "lucide-react";
import { api, Satellite, GeoPosition } from "@/lib/api-client";
import SatelliteMap from "@/components/SatelliteMap";
import { BorderGlow } from "@/components/ui/BorderGlow";

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
        <div className="w-6 h-6 border-2 border-[#E9681B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-[#66635D] uppercase tracking-wider">
          Querying Spacecraft Ephemeris & Telemetry Bus...
        </p>
      </div>
    );
  }

  if (!satellite) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-[#66635D]">Spacecraft node not found in orbital registry.</p>
        <Link href="/satellites" className="text-xs text-[#E9681B] hover:underline mt-2 inline-block font-mono">
          ← Return to Fleet Overview
        </Link>
      </div>
    );
  }

  const isAvail = satellite.status === "available";

  return (
    <div className="space-y-8">
      {/* Header & Status */}
      <div className="border border-[#DEDCD5] bg-white rounded-xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#66635D]">
              <Link href="/satellites" className="hover:text-[#171717] flex items-center space-x-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Constellation</span>
              </Link>
              <span className="text-[#DEDCD5]">/</span>
              <span className="text-[#171717] font-semibold">{satellite.code}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-[#171717] tracking-tight">
                Spacecraft {satellite.code}
              </h1>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded uppercase font-semibold tracking-wider ${
                  isAvail
                    ? "bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]"
                    : "bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]"
                }`}
              >
                {satellite.status}
              </span>
            </div>
            <p className="text-xs text-[#66635D]">
              Polar Sun-Synchronous Orbital Node • Dedicated Linux Edge Computing Payload
            </p>
          </div>

          {currentPos && (
            <div className="flex items-center space-x-3 font-mono text-xs bg-[#F7F6F2] px-4 py-2.5 rounded-lg border border-[#DEDCD5]">
              <span className="w-2 h-2 rounded-full bg-[#E9681B] animate-pulse" />
              <span className="text-[#66635D] uppercase text-[11px]">Telemetry:</span>
              <span className="text-[#171717] font-semibold tabular-nums">
                {currentPos.lat.toFixed(2)}°{currentPos.lat >= 0 ? "N" : "S"},{" "}
                {currentPos.lon.toFixed(2)}°{currentPos.lon >= 0 ? "E" : "W"}
              </span>
            </div>
          )}
        </div>

        {/* Quick Specs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#DEDCD5]">
          <div>
            <div className="text-[11px] font-mono text-[#66635D] uppercase">Mean Altitude</div>
            <div className="text-base font-bold text-[#171717] tabular-nums mt-0.5 font-mono">
              {satellite.orbit_altitude_km} <span className="text-xs font-normal text-[#66635D]">km LEO</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#66635D] uppercase">Inclination</div>
            <div className="text-base font-bold text-[#171717] tabular-nums mt-0.5 font-mono">
              {satellite.inclination_deg}° <span className="text-xs font-normal text-[#66635D]">SSO</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#66635D] uppercase">Compute Node</div>
            <div className="text-base font-bold text-[#171717] tabular-nums mt-0.5 font-mono">
              {satellite.cpu_cores} Cores <span className="text-xs font-normal text-[#66635D]">@{satellite.cpu_ghz}GHz</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#66635D] uppercase">Pass Downlink</div>
            <div className="text-base font-bold text-[#E9681B] tabular-nums mt-0.5 font-mono">
              {satellite.downlink_mbps} <span className="text-xs font-normal text-[#66635D]">Mbps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Size Live Ground Track Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2 text-[#171717] font-semibold">
            <Orbit className="w-4 h-4 text-[#E9681B]" />
            <span className="tracking-tight uppercase">Live Keplerian Ground Track & Sensor Footprint</span>
          </div>
          <span className="text-[#66635D] text-[11px]">
            SGP4 Ground Track Math • Sidereal Earth Rotation Corrected
          </span>
        </div>
        <SatelliteMap
          satelliteId={satellite.id}
          satelliteCode={satellite.code}
          height={420}
        />
      </div>

      {/* Refined Technical 2D Spacecraft Node Architecture Schematic */}
      <div className="border border-[#DEDCD5] bg-white rounded-xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#DEDCD5] pb-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#171717] font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#E9681B]" />
            <span>Spacecraft Hardware Architecture & Payload Bus</span>
          </div>
          <span className="text-[11px] font-mono text-[#66635D]">
            6U CubeSat Architecture • Rad-Tolerant Edge Computing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          {/* Node 1: Edge Compute Payload */}
          <div className="p-4 rounded-lg bg-[#F7F6F2] border border-[#DEDCD5] space-y-2">
            <div className="flex items-center space-x-2 text-[#171717] font-mono text-xs font-bold">
              <Cpu className="w-4 h-4 text-[#E9681B]" />
              <span>EDGE COMPUTE NODE</span>
            </div>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Isolated user-space container runtime. Executes containerized ONNX, PyTorch, or Python vision models.
            </p>
            <div className="text-[11px] font-mono text-[#16A34A] pt-1">
              ✓ Hardware Isolation
            </div>
          </div>

          {/* Node 2: Sensor Payload Bay */}
          <div className="p-4 rounded-lg bg-[#F7F6F2] border border-[#DEDCD5] space-y-2">
            <div className="flex items-center space-x-2 text-[#171717] font-mono text-xs font-bold">
              <Camera className="w-4 h-4 text-[#E9681B]" />
              <span>INSTRUMENT BAY</span>
            </div>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Mounted optical & radiometric instruments ({satellite.sensors.join(", ")}). Direct DMA line to compute RAM.
            </p>
            <div className="text-[11px] font-mono text-[#171717] pt-1">
              Zero-Copy Frame Buffer
            </div>
          </div>

          {/* Node 3: RF Downlink Transceiver */}
          <div className="p-4 rounded-lg bg-[#F7F6F2] border border-[#DEDCD5] space-y-2">
            <div className="flex items-center space-x-2 text-[#171717] font-mono text-xs font-bold">
              <Radio className="w-4 h-4 text-[#E9681B]" />
              <span>RF TRANSCEIVER</span>
            </div>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Direct-to-ground S-band radio transmitting prioritized inference vector metadata at {satellite.downlink_mbps} Mbps.
            </p>
            <div className="text-[11px] font-mono text-[#171717] pt-1">
              Ground Pass Link: Ready
            </div>
          </div>

          {/* Node 4: Flight Critical Isolation */}
          <div className="p-4 rounded-lg bg-[#F7F6F2] border border-[#DEDCD5] space-y-2">
            <div className="flex items-center space-x-2 text-[#171717] font-mono text-xs font-bold">
              <Lock className="w-4 h-4 text-[#DC2626]" />
              <span>FLIGHT CRITICAL BUS</span>
            </div>
            <p className="text-xs text-[#66635D] leading-relaxed">
              Reaction wheels, ADCS, star trackers, and EPS batteries. Airgapped from user code at hardware bus level.
            </p>
            <div className="text-[11px] font-mono text-[#DC2626] pt-1">
              🔒 Strict Hardware Airgap
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Spec Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orbital Mechanics Parameters */}
        <div className="border border-[#DEDCD5] bg-white rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#171717] uppercase tracking-wider font-bold">
            <Compass className="w-4 h-4 text-[#E9681B]" />
            <span>Keplerian Orbital Elements</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">Semi-Major Axis (a)</span>
              <span className="text-[#171717] font-semibold tabular-nums">
                {(6378.137 + satellite.orbit_altitude_km).toFixed(2)} km
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">Mean Orbital Altitude</span>
              <span className="text-[#171717] font-semibold tabular-nums">
                {satellite.orbit_altitude_km} km LEO
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">Inclination (i)</span>
              <span className="text-[#171717] font-semibold tabular-nums">
                {satellite.inclination_deg}°
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">Right Ascension of Ascending Node (RAAN)</span>
              <span className="text-[#171717] font-semibold tabular-nums">
                {satellite.raan_deg}°
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">Nodal Period (T)</span>
              <span className="text-[#E9681B] font-bold tabular-nums">
                {satellite.orbital_period_min} minutes
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#66635D]">Orbit Regime</span>
              <span className="text-[#171717] font-semibold">{satellite.orbit_type}</span>
            </div>
          </div>
        </div>

        {/* Edge Computing Payload Node Hardware */}
        <div className="border border-[#DEDCD5] bg-white rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#171717] uppercase tracking-wider font-bold">
            <Cpu className="w-4 h-4 text-[#E9681B]" />
            <span>Edge Compute Hardware Payload</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">CPU Architecture</span>
              <span className="text-[#171717] font-semibold">
                {satellite.cpu_cores} Cores @ {satellite.cpu_ghz}GHz (Rad-Tolerant)
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">Onboard RAM (LPDDR4 ECC)</span>
              <span className="text-[#171717] font-semibold tabular-nums">
                {satellite.ram_mb} MB
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">NAND Flash Storage</span>
              <span className="text-[#171717] font-semibold tabular-nums">
                {satellite.storage_mb} MB
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">Pass Energy Budget</span>
              <span className="text-[#E9681B] font-bold tabular-nums">
                {satellite.power_budget_wh} Wh
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DEDCD5]">
              <span className="text-[#66635D]">Downlink Data Rate</span>
              <span className="text-[#171717] font-semibold tabular-nums">
                {satellite.downlink_mbps} Mbps (Direct to Ground)
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#66635D]">Mounted Payloads</span>
              <span className="text-[#171717] font-semibold uppercase">
                {satellite.sensors.join(", ")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
