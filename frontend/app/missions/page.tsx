"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Orbit,
  ArrowRight,
  CheckCircle2,
  Clock,
  Radio,
  Search,
  Filter
} from "lucide-react";
import { api, Mission } from "@/lib/api-client";

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.listMissions()
      .then((data) => setMissions(data))
      .catch((err) => console.error("Error loading missions", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredMissions = missions.filter((m) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && m.status !== "complete" && m.status !== "failed") ||
      (filter === "complete" && m.status === "complete");

    const matchesSearch =
      m.mission_code.toLowerCase().includes(search.toLowerCase()) ||
      (m.application_name || "").toLowerCase().includes(search.toLowerCase()) ||
      m.target_region.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Activity className="w-4 h-4" />
            <span>MISSION OPERATIONS REGISTRY</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Orbital Missions Directory
          </h1>
          <p className="text-xs text-slate-400">
            Track real-time spacecraft pass executions, telemetry downlinks, and edge detection packages.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filter === "all"
                ? "bg-cyan-950 text-cyan-300 border-cyan-800"
                : "bg-[#141b29] text-slate-400 border-[#1e2838] hover:text-white"
            }`}
          >
            All ({missions.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filter === "active"
                ? "bg-cyan-950 text-cyan-300 border-cyan-800"
                : "bg-[#141b29] text-slate-400 border-[#1e2838] hover:text-white"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("complete")}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filter === "complete"
                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                : "bg-[#141b29] text-slate-400 border-[#1e2838] hover:text-white"
            }`}
          >
            Complete
          </button>
        </div>
      </div>

      {/* Missions Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono text-slate-400">Querying orbital mission registry...</p>
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0e131d] border border-[#1e2838] text-xs text-slate-400">
          No missions match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMissions.map((m) => {
            const isComplete = m.status === "complete";
            return (
              <a
                key={m.id}
                href={`/missions/${m.id}`}
                className="bg-[#0e131d] border border-[#1e2838] hover:border-cyan-500/50 rounded-xl p-5 transition-all flex flex-col justify-between shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {m.mission_code}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#162030] text-cyan-400">
                        {m.satellite_code}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        isComplete
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse"
                      }`}
                    >
                      {m.status.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200">
                    {m.application_name || "Orbital Workload"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Target: {m.target_region} ({m.target_lat.toFixed(2)}°N, {m.target_lon.toFixed(2)}°E)
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1a2230] flex items-center justify-between text-[11px] font-mono">
                  {m.result ? (
                    <span className="text-emerald-400 font-medium">
                      Result: {m.result.detection_label} ({m.result.confidence}%)
                    </span>
                  ) : (
                    <span className="text-cyan-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Pass in Progress</span>
                    </span>
                  )}
                  <span className="text-slate-400 group-hover:text-white flex items-center space-x-1">
                    <span>Open Console</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
