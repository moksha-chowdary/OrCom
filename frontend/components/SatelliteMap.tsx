"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { api, GroundTrackResponse, GeoPosition } from "@/lib/api-client";
import { Crosshair, Radio, ShieldCheck, Orbit } from "lucide-react";

interface SatelliteMapProps {
  satelliteId?: string;
  satelliteCode?: string;
  targetCoords?: { lat: number; lon: number; label?: string };
  height?: number;
  showAllSatellites?: boolean;
  className?: string;
}

const WIDTH = 960;
const HEIGHT = 480;

export default function SatelliteMap({
  satelliteId = "sat-oc-01",
  satelliteCode = "OC-01",
  targetCoords,
  height = 420,
  showAllSatellites = false,
  className = "",
}: SatelliteMapProps) {
  const [worldGeoJSON, setWorldGeoJSON] = useState<any>(null);
  const [groundTrack, setGroundTrack] = useState<GroundTrackResponse | null>(null);
  const [currentPos, setCurrentPos] = useState<GeoPosition | null>(null);
  const [allPositions, setAllPositions] = useState<GeoPosition[]>([]);
  const [interpolatedPos, setInterpolatedPos] = useState<{ lat: number; lon: number } | null>(null);

  const prevPosRef = useRef<{ lat: number; lon: number } | null>(null);
  const nextPosRef = useRef<{ lat: number; lon: number } | null>(null);
  const animStartTimeRef = useRef<number>(Date.now());

  // Projection
  const projection = useMemo(() => {
    return geoEquirectangular()
      .scale(152.5)
      .translate([WIDTH / 2, HEIGHT / 2]);
  }, []);

  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  // 1. Load offline TopoJSON map once
  useEffect(() => {
    fetch("/world-110m.json")
      .then((res) => res.json())
      .then((data) => {
        const countries = feature(data, data.objects.countries);
        setWorldGeoJSON(countries);
      })
      .catch((err) => {
        console.error("Could not load local world-110m.json", err);
      });
  }, []);

  // 2. Fetch ground track initially and every 30s
  useEffect(() => {
    if (!satelliteId) return;
    let isMounted = true;

    const fetchTrack = async () => {
      try {
        const track = await api.getSatelliteGroundTrack(satelliteId, 45, 45);
        if (isMounted) setGroundTrack(track);
      } catch (err) {
        console.error("Ground track fetch error", err);
      }
    };

    fetchTrack();
    const trackInterval = setInterval(fetchTrack, 25000);
    return () => {
      isMounted = false;
      clearInterval(trackInterval);
    };
  }, [satelliteId]);

  // 3. Poll position every 1s and interpolate (lerp) smoothly
  useEffect(() => {
    let isMounted = true;

    const updatePosition = async () => {
      try {
        if (showAllSatellites) {
          const positions = await api.getAllPositions();
          if (isMounted) setAllPositions(positions);
        }

        if (satelliteId) {
          const pos = await api.getSatellitePosition(satelliteId);
          if (isMounted) {
            setCurrentPos(pos);
            prevPosRef.current = nextPosRef.current || { lat: pos.lat, lon: pos.lon };
            nextPosRef.current = { lat: pos.lat, lon: pos.lon };
            animStartTimeRef.current = Date.now();
          }
        }
      } catch (err) {
        console.error("Position poll error", err);
      }
    };

    updatePosition();
    const posInterval = setInterval(updatePosition, 1000);
    return () => {
      isMounted = false;
      clearInterval(posInterval);
    };
  }, [satelliteId, showAllSatellites]);

  // 4. Smooth lerp animation loop (60 FPS)
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (prevPosRef.current && nextPosRef.current) {
        const now = Date.now();
        const duration = 1000; // 1 second update cycle
        const progress = Math.min(1.0, (now - animStartTimeRef.current) / duration);

        // Linear interpolation accounting for longitude wrapping
        let dLon = nextPosRef.current.lon - prevPosRef.current.lon;
        if (dLon > 180) dLon -= 360;
        if (dLon < -180) dLon += 360;

        const currentLon = prevPosRef.current.lon + dLon * progress;
        const currentLat =
          prevPosRef.current.lat + (nextPosRef.current.lat - prevPosRef.current.lat) * progress;

        setInterpolatedPos({ lat: currentLat, lon: currentLon });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Helper to project lat/lon to SVG coordinates
  const projectCoords = (lat: number, lon: number): [number, number] | null => {
    const coords = projection([lon, lat]);
    return coords ? [coords[0], coords[1]] : null;
  };

  // Convert track point segment to SVG path d string
  const segmentToPath = (points: { lat: number; lon: number }[]): string => {
    let d = "";
    for (let i = 0; i < points.length; i++) {
      const pt = projectCoords(points[i].lat, points[i].lon);
      if (!pt) continue;
      if (i === 0) {
        d += `M ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;
      } else {
        d += ` L ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`;
      }
    }
    return d;
  };

  const activeMarker = interpolatedPos || currentPos;
  const activeXY = activeMarker ? projectCoords(activeMarker.lat, activeMarker.lon) : null;
  const targetXY = targetCoords ? projectCoords(targetCoords.lat, targetCoords.lon) : null;

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-[#1e2838] bg-[#07090e] shadow-2xl select-none ${className}`}
      style={{ height }}
    >
      {/* HUD Header Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-3 bg-[#0c111c]/90 backdrop-blur border border-[#1e2838] px-3 py-1.5 rounded-lg text-xs font-mono">
        <div className="flex items-center space-x-1.5 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <Radio className="w-3.5 h-3.5" />
          <span className="font-semibold">{satelliteCode} LIVE ORBIT</span>
        </div>
        {activeMarker && (
          <div className="text-slate-400 flex items-center space-x-2 border-l border-[#1e2838] pl-2">
            <span>
              LAT:{" "}
              <span className="text-white font-medium">
                {activeMarker.lat.toFixed(2)}°{activeMarker.lat >= 0 ? "N" : "S"}
              </span>
            </span>
            <span>
              LON:{" "}
              <span className="text-white font-medium">
                {activeMarker.lon.toFixed(2)}°{activeMarker.lon >= 0 ? "E" : "W"}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center space-x-4 bg-[#0c111c]/85 backdrop-blur border border-[#1e2838] px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300">
        <div className="flex items-center space-x-1.5">
          <span className="w-4 h-[2px] bg-slate-500 opacity-60 inline-block" />
          <span>Past Trail</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-4 border-t-2 border-dashed border-cyan-400 inline-block" />
          <span className="text-cyan-300">Upcoming Pathway</span>
        </div>
        {targetCoords && (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm" />
            <span className="text-emerald-400 font-medium">Target Zone</span>
          </div>
        )}
      </div>

      {/* Primary SVG Rendering Surface */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="orbital-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#131b29"
              strokeWidth="0.75"
              strokeOpacity="0.8"
            />
          </pattern>

          {/* Satellite glow gradient */}
          <radialGradient id="sat-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#00f0ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>

          {/* Target zone glow */}
          <radialGradient id="target-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ocean Background */}
        <rect width={WIDTH} height={HEIGHT} fill="#070a0f" />
        <rect width={WIDTH} height={HEIGHT} fill="url(#orbital-grid)" />

        {/* Equator and Prime Meridian Reference Lines */}
        <line x1="0" y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="#1b2536" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={WIDTH / 2} y1="0" x2={WIDTH / 2} y2={HEIGHT} stroke="#1b2536" strokeWidth="1" strokeDasharray="3 3" />

        {/* Landmass Polygons */}
        {worldGeoJSON && (
          <g className="landmasses">
            {worldGeoJSON.features.map((feature: any, idx: number) => (
              <path
                key={idx}
                d={pathGenerator(feature) || ""}
                fill="#121824"
                stroke="#1f2c3f"
                strokeWidth="0.65"
              />
            ))}
          </g>
        )}

        {/* Past Ground Track: Solid / Faded Trail */}
        {groundTrack?.past_segments?.map((segment, idx) => (
          <path
            key={`past-${idx}`}
            d={segmentToPath(segment)}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.8"
            strokeOpacity="0.45"
            strokeLinecap="round"
          />
        ))}

        {/* Upcoming Ground Track: Visibly Dotted / Dashed Line (§10 requirement) */}
        {groundTrack?.upcoming_segments?.map((segment, idx) => (
          <path
            key={`upcoming-${idx}`}
            d={segmentToPath(segment)}
            fill="none"
            stroke="#00f0ff"
            strokeWidth="2.2"
            strokeDasharray="5, 4"
            className="upcoming-path"
            strokeOpacity="0.85"
            strokeLinecap="round"
          />
        ))}

        {/* Convergence Vector Line (Target to Satellite) */}
        {activeXY && targetXY && (
          <line
            x1={activeXY[0]}
            y1={activeXY[1]}
            x2={targetXY[0]}
            y2={targetXY[1]}
            stroke="#34d399"
            strokeWidth="1"
            strokeDasharray="2, 4"
            strokeOpacity="0.6"
          />
        )}

        {/* Target Coordinate Crosshair Marker */}
        {targetXY && (
          <g transform={`translate(${targetXY[0]}, ${targetXY[1]})`}>
            {/* Pulsing Target Radar */}
            <circle r="16" fill="url(#target-glow)" />
            <circle r="8" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="2, 2" />
            <circle r="2.5" fill="#10b981" />
            <line x1="-12" y1="0" x2="12" y2="0" stroke="#10b981" strokeWidth="1" />
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#10b981" strokeWidth="1" />
            <text
              x="14"
              y="4"
              fill="#34d399"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              className="drop-shadow"
            >
              {targetCoords?.label || "TARGET HORIZON"}
            </text>
          </g>
        )}

        {/* Multi-satellite dots if showAllSatellites is enabled */}
        {showAllSatellites &&
          allPositions
            .filter((p) => p.satellite_code !== satelliteCode)
            .map((pos, idx) => {
              const xy = projectCoords(pos.lat, pos.lon);
              if (!xy) return null;
              return (
                <g key={idx} transform={`translate(${xy[0]}, ${xy[1]})`}>
                  <circle r="3.5" fill="#94a3b8" />
                  <text
                    x="6"
                    y="3"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {pos.satellite_code}
                  </text>
                </g>
              );
            })}

        {/* Active Spacecraft Marker with Smooth LERP Motion */}
        {activeXY && (
          <g transform={`translate(${activeXY[0]}, ${activeXY[1]})`}>
            {/* Glowing outer halo */}
            <circle r="20" fill="url(#sat-glow)" />
            {/* Concentric radar pulse */}
            <circle r="9" fill="#00e5ff" fillOpacity="0.2" stroke="#00f0ff" strokeWidth="1.5" />
            <circle r="3.5" fill="#ffffff" />
            {/* Satellite Code Badge */}
            <g transform="translate(12, -10)">
              <rect
                x="-2"
                y="-10"
                width="48"
                height="16"
                rx="3"
                fill="#0c111c"
                stroke="#00f0ff"
                strokeWidth="1"
                fillOpacity="0.95"
              />
              <text
                x="4"
                y="2"
                fill="#00f0ff"
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {satelliteCode}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
