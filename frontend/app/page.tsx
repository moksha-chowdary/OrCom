"use client";

import React, { useEffect, useState } from "react";
import {
  Orbit,
  Layers,
  Activity,
  Cpu,
  Radio,
  HardDrive,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Terminal,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { api, Project, Mission, Satellite } from "@/lib/api-client";
import SatelliteMap from "@/components/SatelliteMap";
import FloatingIDE from "@/components/FloatingIDE";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIDEOpen, setIsIDEOpen] = useState(false);

  // New project modal state
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
      {/* Top Banner / Value Proposition */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c121e] via-[#0f1726] to-[#0a101b] border border-[#1e2838] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/50 text-[11px] font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>SPACECRAFT IS INFRASTRUCTURE • SOFTWARE IS THE PRODUCT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Orbital Edge Compute Console
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Deploy, simulate, and execute edge AI workloads on simulated Low Earth Orbit satellites.
              Process terabytes of sensor swaths in orbit and downlink high-value vector results with 99.9% bandwidth reduction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsIDEOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Floating IDE</span>
            </button>
            <button
              onClick={() => setIsNewProjectModal(true)}
              className="px-4 py-2.5 rounded-lg bg-[#141b29] hover:bg-[#1a2336] text-white border border-[#222e42] text-xs font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Telemetry Metric Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Downlink Compression</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-mono text-2xl font-bold text-emerald-400">99.99%</span>
          <span className="text-[11px] text-slate-400 mt-1">1.5GB raw → 0.15MB alert</span>
        </div>

        <div className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Constellation Health</span>
            <Orbit className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-mono text-2xl font-bold text-white">
            2 / 3 <span className="text-xs text-slate-400 font-normal">Active</span>
          </span>
          <span className="text-[11px] text-slate-400 mt-1">OC-01, OC-02 on orbit</span>
        </div>

        <div className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Edge Inference Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-mono text-2xl font-bold text-amber-400">3.8s</span>
          <span className="text-[11px] text-slate-400 mt-1">Rad-hard ARM Cortex bus</span>
        </div>

        <div className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Sandboxed Workloads</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-mono text-2xl font-bold text-cyan-400">100% Gated</span>
          <span className="text-[11px] text-slate-400 mt-1">Zero flight-critical bus access</span>
        </div>
      </div>

      {/* Primary Constellation Map Widget */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Orbit className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-semibold text-white font-mono">
              LIVE CONSTELLATION GROUND TRACKS
            </h2>
          </div>
          <a
            href="/satellites"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View Fleet Specs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <SatelliteMap
          satelliteId="sat-oc-01"
          satelliteCode="OC-01"
          targetCoords={{ lat: 15.8281, lon: 78.0373, label: "ANDHRA PRADESH TARGET" }}
          height={380}
          showAllSatellites={true}
        />
      </div>

      {/* Two Column Layout: Projects Left, Active Missions Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">Workload Projects</h2>
            </div>
            <button
              onClick={() => setIsNewProjectModal(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <a
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="block p-4 rounded-xl bg-[#0e131d] border border-[#1e2838] hover:border-cyan-500/50 hover:bg-[#121824] transition-all group shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-[#1a2230] text-[11px] font-mono text-slate-500">
                  <span>{proj.application_count} Workloads</span>
                  <span>•</span>
                  <span>ID: {proj.id}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Missions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Orbital Missions</h2>
            </div>
            <a
              href="/missions"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>All Missions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            {missions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#0e131d] border border-[#1e2838] text-xs text-slate-400">
                No active or historical missions. Deploy a workload to start.
              </div>
            ) : (
              missions.slice(0, 4).map((mis) => {
                const isComplete = mis.status === "complete";
                return (
                  <a
                    key={mis.id}
                    href={`/missions/${mis.id}`}
                    className="block p-4 rounded-xl bg-[#0e131d] border border-[#1e2838] hover:border-emerald-500/50 hover:bg-[#121824] transition-all group shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-300">
                          {mis.mission_code}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#182030] text-slate-300">
                          {mis.satellite_code}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          isComplete
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse"
                        }`}
                      >
                        {mis.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 truncate">
                      {mis.application_name || "Wildfire Thermal Hotspot Classifier"}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2.5 pt-2.5 border-t border-[#1a2230]">
                      <span>Target: {mis.target_region}</span>
                      {mis.result && (
                        <span className="text-emerald-400 font-semibold">
                          Confidence: {mis.result.confidence}%
                        </span>
                      )}
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {isNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e131d] border border-[#1e2838] rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white font-mono">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyclone Track Prediction"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full bg-[#141b29] border border-[#1e2838] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your orbital workload mission goals..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full bg-[#141b29] border border-[#1e2838] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 resize-none"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold text-xs rounded-lg hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-950/40"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Floating IDE Modal */}
      <FloatingIDE isOpen={isIDEOpen} onClose={() => setIsIDEOpen(false)} />
    </div>
  );
}
