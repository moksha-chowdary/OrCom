"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Orbit,
  ArrowRight,
  CheckCircle2,
  Clock,
  Radio,
  Search
} from "lucide-react";
import { api, Mission } from "@/lib/api-client";
import SplitFlapText from "@/components/ui/SplitFlapText";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#66635D] uppercase">
            <Activity className="w-3.5 h-3.5 text-[#E9681B]" />
            <span>MISSION OPERATIONS DIRECTORY</span>
          </div>
          <h1 className="text-xl font-bold text-[#171717] tracking-tight">
            Orbital Missions Registry
          </h1>
          <p className="text-xs text-[#66635D]">
            Historical and real-time spacecraft pass executions, edge inferences, and vector downlinks.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 font-mono text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-[5px] border transition-all ${
              filter === "all"
                ? "bg-[#171717] text-white border-[#171717]"
                : "bg-[#F7F6F2] text-[#66635D] border-[#DEDCD5] hover:text-[#171717]"
            }`}
          >
            All ({missions.length})
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1 rounded-[5px] border transition-all ${
              filter === "active"
                ? "bg-[#171717] text-white border-[#171717]"
                : "bg-[#F7F6F2] text-[#66635D] border-[#DEDCD5] hover:text-[#171717]"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("complete")}
            className={`px-3 py-1 rounded-[5px] border transition-all ${
              filter === "complete"
                ? "bg-[#171717] text-white border-[#171717]"
                : "bg-[#F7F6F2] text-[#66635D] border-[#DEDCD5] hover:text-[#171717]"
            }`}
          >
            Complete
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-5 h-5 border-2 border-[#E9681B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono text-[#66635D]">Querying orbital mission database...</p>
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="p-10 text-center rounded-[10px] bg-[#FFFFFF] border border-[#DEDCD5] text-xs text-[#66635D]">
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
                className="bg-[#FFFFFF] border border-[#DEDCD5] hover:border-[#C5C2B8] rounded-[10px] p-5 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-[#171717] group-hover:text-[#E9681B] transition-colors">
                        {m.mission_code}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EFECE6] text-[#171717]">
                        {m.satellite_code}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <SplitFlapText text={m.status.replace("_", " ")} size="sm" />
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold text-[#171717]">
                    {m.application_name || "Orbital Workload"}
                  </h3>
                  <p className="text-xs text-[#66635D] mt-0.5">
                    Target: {m.target_region} ({m.target_lat.toFixed(2)}°N, {m.target_lon.toFixed(2)}°E)
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFECE6] flex items-center justify-between text-[11px] font-mono">
                  {m.result ? (
                    <span className="text-[#15803D] font-medium">
                      Result: {m.result.detection_label} ({m.result.confidence}%)
                    </span>
                  ) : (
                    <span className="text-[#E9681B] flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Pass in Progress</span>
                    </span>
                  )}
                  <span className="text-[#66635D] group-hover:text-[#171717] flex items-center space-x-1">
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
