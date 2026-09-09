"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { api, GroundTrackResponse, GeoPosition } from "@/lib/api-client";
import { Radio } from "lucide-react";

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
  height = 400,
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

  const projection = useMemo(() => {
    return geoEquirectangular()
      .scale(152.5)
      .translate([WIDTH / 2, HEIGHT / 2]);
  }, []);

  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  // Load offline TopoJSON map
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

  // Fetch ground track initially and on interval
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

  // Poll position every 1s
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

  // 60 FPS smooth interpolation (LERP) loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (prevPosRef.current && nextPosRef.current) {
        const now = Date.now();
        const duration = 1000;
        const progress = Math.min(1.0, (now - animStartTimeRef.current) / duration);

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

  const projectCoords = (lat: number, lon: number): [number, number] | null => {
    const coords = projection([lon, lat]);
    return coords ? [coords[0], coords[1]] : null;
  };

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
      className={`relative w-full rounded-[10px] overflow-hidden border border-[#DEDCD5] bg-[#F5F4EE] shadow-xs select-none ${className}`}
      style={{ height }}
    >
      {/* Top Header Information Tag */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-[#FFFFFF]/90 backdrop-blur border border-[#DEDCD5] px-2.5 py-1 rounded-[5px] text-[11px] font-mono shadow-xs">
        <div className="flex items-center space-x-1.5 text-[#E9681B]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E9681B] animate-pulse" />
          <span className="font-semibold text-[#171717]">{satelliteCode} ORBIT</span>
        </div>
        {activeMarker && (
          <div className="text-[#66635D] flex items-center space-x-2 border-l border-[#DEDCD5] pl-2">
            <span>
              {activeMarker.lat.toFixed(2)}°{activeMarker.lat >= 0 ? "N" : "S"}
            </span>
            <span>
              {activeMarker.lon.toFixed(2)}°{activeMarker.lon >= 0 ? "E" : "W"}
            </span>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center space-x-3 bg-[#FFFFFF]/90 backdrop-blur border border-[#DEDCD5] px-2.5 py-1 rounded-[5px] text-[10px] font-mono text-[#66635D] shadow-xs">
        <div className="flex items-center space-x-1">
          <span className="w-3 h-[1.5px] bg-[#8C887E] inline-block" />
          <span>Past Trail</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3 border-t-[1.5px] border-dashed border-[#E9681B] inline-block" />
          <span className="text-[#E9681B] font-medium">Upcoming Path</span>
        </div>
        {targetCoords && (
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#171717] inline-block" />
            <span className="text-[#171717] font-semibold">Target</span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle technical cartographic grid */}
          <pattern id="light-carto-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M 48 0 L 0 0 0 48"
              fill="none"
              stroke="#E2DFD6"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        {/* Ocean Background in Paper Tone */}
        <rect width={WIDTH} height={HEIGHT} fill="#F7F6F2" />
        <rect width={WIDTH} height={HEIGHT} fill="url(#light-carto-grid)" />

        {/* Equator & Reference Axes */}
        <line x1="0" y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="#DDD9CE" strokeWidth="0.75" strokeDasharray="3 3" />
        <line x1={WIDTH / 2} y1="0" x2={WIDTH / 2} y2={HEIGHT} stroke="#DDD9CE" strokeWidth="0.75" strokeDasharray="3 3" />

        {/* Landmass Polygons */}
        {worldGeoJSON && (
          <g className="landmasses">
            {worldGeoJSON.features.map((feature: any, idx: number) => (
              <path
                key={idx}
                d={pathGenerator(feature) || ""}
                fill="#EAE7DF"
                stroke="#D6D2C6"
                strokeWidth="0.5"
              />
            ))}
          </g>
        )}

        {/* Past Ground Track: Solid / Faded Subtle Trail */}
        {groundTrack?.past_segments?.map((segment, idx) => (
          <path
            key={`past-${idx}`}
            d={segmentToPath(segment)}
            fill="none"
            stroke="#8C887E"
            strokeWidth="1.5"
            strokeOpacity="0.45"
            strokeLinecap="round"
          />
        ))}

        {/* Upcoming Ground Track: Visibly Dotted Line in OrCom Orange (#E9681B) */}
        {groundTrack?.upcoming_segments?.map((segment, idx) => (
          <path
            key={`upcoming-${idx}`}
            d={segmentToPath(segment)}
            fill="none"
            stroke="#E9681B"
            strokeWidth="2"
            strokeDasharray="4, 4"
            className="orbital-upcoming-path"
            strokeLinecap="round"
          />
        ))}

        {/* Target Convergence Vector Line */}
        {activeXY && targetXY && (
          <line
            x1={activeXY[0]}
            y1={activeXY[1]}
            x2={targetXY[0]}
            y2={targetXY[1]}
            stroke="#171717"
            strokeWidth="1"
            strokeDasharray="2, 4"
            strokeOpacity="0.4"
          />
        )}

        {/* Target Horizon Marker: Technical Crosshairs in Charcoal */}
        {targetXY && (
          <g transform={`translate(${targetXY[0]}, ${targetXY[1]})`}>
            <circle r="6" fill="none" stroke="#171717" strokeWidth="1" />
            <circle r="2" fill="#171717" />
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#171717" strokeWidth="0.75" />
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#171717" strokeWidth="0.75" />
            <text
              x="12"
              y="3.5"
              fill="#171717"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {targetCoords?.label || "TARGET"}
            </text>
          </g>
        )}

        {/* Additional Fleet Markers */}
        {showAllSatellites &&
          allPositions
            .filter((p) => p.satellite_code !== satelliteCode)
            .map((pos, idx) => {
              const xy = projectCoords(pos.lat, pos.lon);
              if (!xy) return null;
              return (
                <g key={idx} transform={`translate(${xy[0]}, ${xy[1]})`}>
                  <circle r="3" fill="#8C887E" />
                  <text
                    x="5"
                    y="3"
                    fill="#66635D"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    {pos.satellite_code}
                  </text>
                </g>
              );
            })}

        {/* Active Spacecraft Marker: Precision Reticle in OrCom Orange */}
        {activeXY && (
          <g transform={`translate(${activeXY[0]}, ${activeXY[1]})`}>
            {/* Outer precision ring */}
            <circle r="9" fill="rgba(233, 104, 27, 0.15)" stroke="#E9681B" strokeWidth="1.2" />
            <circle r="3" fill="#E9681B" />
            <circle r="1" fill="#FFFFFF" />

            {/* Label Tag */}
            <g transform="translate(11, -8)">
              <rect
                x="-1"
                y="-9"
                width="44"
                height="15"
                rx="2"
                fill="#171717"
              />
              <text
                x="4"
                y="2"
                fill="#F7F6F2"
                fontSize="9"
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
