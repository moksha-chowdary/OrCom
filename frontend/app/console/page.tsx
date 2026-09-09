"use client";

import React, { useEffect, useState } from "react";
import {
  Orbit,
  Layers,
  Activity,
  Cpu,
  Radio,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal,
  ChevronRight,
  Clock,
  Compass
} from "lucide-react";
import { api, Project, Mission, Satellite } from "@/lib/api-client";
import SatelliteMap from "@/components/SatelliteMap";
import FloatingIDE from "@/components/FloatingIDE";
import BlurText from "@/components/ui/BlurText";
import BorderGlow from "@/components/ui/BorderGlow";
import SplitFlapText from "@/components/ui/SplitFlapText";

export default function ConsoleDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIDEOpen, setIsIDEOpen] = useState(false);

  // New project modal
  const [isNewProjectModal, setIsNewProjectModal] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");

  const refreshDashboard = async () => {
    try {
      const [projData, misData, satData] = await Promise.all([
        api.getProjects(),
        api.listMissions(),
        api.getSatellites(),
      ]);
      setProjects(projData);
      setMissions(misData);
      setSatellites(satData);
    } catch (err) {
      console.error("Dashboard data load error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      await api.createProject({ name: newProjName, description: newProjDesc });
      setIsNewProjectModal(false);
      setNewProjName("");
      setNewProjDesc("");
      refreshDashboard();
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header — Developer Platform Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DEDCD5] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#66635D] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E9681B]" />
            <span>ORBITAL COMPUTE PLATFORM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            <BlurText text="Compute Beyond Earth." delay={60} />
          </h1>
          <p className="text-xs sm:text-sm text-[#66635D] max-w-2xl leading-relaxed">
            Run containerized code on orbiting spacecraft. Extract insights over target horizons and downlink vector anomalies instead of raw gigabytes.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsIDEOpen(true)}
            className="btn-orange px-3.5 py-2 flex items-center space-x-1.5 shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5 text-white" />
            <span>Open Floating IDE</span>
          </button>
          <button
            onClick={() => setIsNewProjectModal(true)}
            className="btn-secondary px-3.5 py-2 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#171717]" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Primary Visual Center: Live Ground Track & Fleet Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#171717]">
            <Orbit className="w-4 h-4 text-[#E9681B]" />
            <span className="font-semibold uppercase">ACTIVE CONSTELLATION PROPAGATION</span>
          </div>
          <a
            href="/satellites"
            className="text-xs text-[#66635D] hover:text-[#171717] font-mono flex items-center space-x-1"
          >
            <span>Fleet Documentation</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        <SatelliteMap
          satelliteId="sat-oc-01"
          satelliteCode="OC-01"
          targetCoords={{ lat: 15.8281, lon: 78.0373, label: "ANDHRA PRADESH" }}
          height={380}
          showAllSatellites={true}
        />
      </div>

      {/* Active Missions Section — Visual Importance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#171717]">
            <Activity className="w-4 h-4 text-[#E9681B]" />
            <span className="font-semibold uppercase">ACTIVE & RECENT ORBITAL MISSIONS</span>
          </div>
          <a
            href="/missions"
            className="text-xs text-[#66635D] hover:text-[#171717] font-mono flex items-center space-x-1"
          >
            <span>All Missions ({missions.length})</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missions.slice(0, 2).map((m) => {
            const isComplete = m.status === "complete";
            return (
              <BorderGlow key={m.id} active={isComplete}>
                <a
                  href={`/missions/${m.id}`}
                  className="block p-5 bg-[#FFFFFF] rounded-[10px] hover:bg-[#FAF9F5] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-[#171717]">
                        {m.mission_code}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EFECE6] text-[#171717]">
                        {m.satellite_code}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <SplitFlapText text={m.status.replace("_", " ")} size="sm" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[#171717]">
                    {m.application_name || "Orbital Anomaly Detector"}
                  </h3>
                  <p className="text-xs text-[#66635D] mt-0.5">
                    Target: {m.target_region} ({m.target_lat.toFixed(2)}°N, {m.target_lon.toFixed(2)}°E)
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono mt-4 pt-3 border-t border-[#EFECE6]">
                    {m.result ? (
                      <span className="text-[#15803D] font-semibold">
                        Result: {m.result.detection_label} ({m.result.confidence}%)
                      </span>
                    ) : (
                      <span className="text-[#E9681B] flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Pass Executing</span>
                      </span>
                    )}
                    <span className="text-[#66635D] flex items-center space-x-1 hover:text-[#171717]">
                      <span>Mission Console</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              </BorderGlow>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Projects Left, Operational Event Log Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects & Workloads */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#171717]">
              <Layers className="w-4 h-4 text-[#171717]" />
              <span className="font-semibold uppercase">PROJECT DIRECTORY</span>
            </div>
            <button
              onClick={() => setIsNewProjectModal(true)}
              className="text-xs text-[#66635D] hover:text-[#171717] font-mono flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Create Project</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {projects.map((p) => (
              <a
                key={p.id}
                href={`/projects/${p.id}`}
                className="block p-4 bg-[#FFFFFF] border border-[#DEDCD5] hover:border-[#C5C2B8] hover:bg-[#FAF9F5] rounded-[8px] transition-all shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-[#171717]">{p.name}</h3>
                    <p className="text-xs text-[#66635D] mt-0.5 line-clamp-1">{p.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A5A198] mt-0.5 flex-shrink-0" />
                </div>
                <div className="flex items-center space-x-3 text-[10px] font-mono text-[#78746D] mt-2.5 pt-2 border-t border-[#EFECE6]">
                  <span>{p.application_count} Workloads</span>
                  <span>•</span>
                  <span>ID: {p.id}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* System Activity Log — Operational Events */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#171717]">
              <Terminal className="w-4 h-4 text-[#171717]" />
              <span className="font-semibold uppercase">SYSTEM OPERATIONAL ACTIVITY</span>
            </div>
            <span className="text-[10px] font-mono text-[#78746D]">LIVE CHRONOLOGY</span>
          </div>

          <div className="p-4 bg-[#FFFFFF] border border-[#DEDCD5] rounded-[8px] space-y-2.5 font-mono text-xs shadow-xs">
            <div className="flex items-start space-x-2.5 pb-2 border-b border-[#EFECE6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] mt-1.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[#171717] font-medium block">Simulation completed for OC-01 pass</span>
                <span className="text-[10px] text-[#78746D]">99.99% downlink bandwidth reduction verified</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 pb-2 border-b border-[#EFECE6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E9681B] mt-1.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[#171717] font-medium block">Orbital pass calculated for Andhra Pradesh</span>
                <span className="text-[10px] text-[#78746D]">Keplerian pass window acquired (Elevation: 78°)</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 pb-2 border-b border-[#EFECE6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] mt-1.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[#171717] font-medium block">OC-02 compatibility confirmed</span>
                <span className="text-[10px] text-[#78746D]">8 cores @ 1.5GHz • 2048 MB RAM envelope matched</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 pb-2 border-b border-[#EFECE6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] mt-1.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[#171717] font-medium block">Application static security scan passed</span>
                <span className="text-[10px] text-[#78746D]">Zero prohibited system calls • Flight bus isolated</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#66635D] mt-1.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[#171717] font-medium block">OrCom MockProvider runtime initialized</span>
                <span className="text-[10px] text-[#78746D]">Deterministic circular Keplerian fleet loaded</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {isNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs text-[#66635D] mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyclone Track Prediction"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#DEDCD5] rounded-[6px] px-3 py-1.5 text-xs text-[#171717] outline-none focus:border-[#E9681B]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#66635D] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your orbital workload mission goals..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#DEDCD5] rounded-[6px] px-3 py-1.5 text-xs text-[#171717] outline-none focus:border-[#E9681B] resize-none"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModal(false)}
                  className="px-3 py-1.5 text-xs text-[#66635D] hover:text-[#171717]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-orange px-3.5 py-1.5 text-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Floating IDE */}
      <FloatingIDE isOpen={isIDEOpen} onClose={() => setIsIDEOpen(false)} />
    </div>
  );
}
