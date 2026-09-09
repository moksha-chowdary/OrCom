"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Layers,
  Upload,
  Terminal,
  Play,
  ArrowRight,
  ShieldCheck,
  Cpu,
  HardDrive,
  FileCode,
  Calendar,
  AlertCircle
} from "lucide-react";
import { api, Project, Application } from "@/lib/api-client";
import FloatingIDE from "@/components/FloatingIDE";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isIDEOpen, setIsIDEOpen] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      api.getProject(projectId),
      api.getProjectApplications(projectId),
    ])
      .then(([p, apps]) => {
        setProject(p);
        setApplications(apps);
      })
      .catch((err) => console.error("Error loading project details", err))
      .finally(() => setIsLoading(false));
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Retrieving project telemetry...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h2 className="text-base font-semibold text-white">Project Not Found</h2>
        <a href="/" className="text-xs text-cyan-400 hover:underline mt-2 inline-block">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header Card */}
      <div className="bg-[#0e131d] border border-[#1e2838] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Layers className="w-4 h-4" />
            <span>PROJECT WORKSPACE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
          <p className="text-xs text-slate-400 max-w-2xl">{project.description}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsIDEOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center space-x-2 shadow-md shadow-cyan-950/40"
          >
            <Terminal className="w-4 h-4" />
            <span>Open Floating IDE</span>
          </button>
          <a
            href={`/projects/${project.id}/upload`}
            className="px-3.5 py-2 rounded-lg bg-[#141b29] hover:bg-[#1a2336] text-white border border-[#222e42] text-xs font-medium flex items-center space-x-2"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Workload</span>
          </a>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            Configured Workload Applications ({applications.length})
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0e131d] border border-[#1e2838] space-y-3">
            <FileCode className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-medium text-white">No applications packaged yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Write an orbital edge script inside the Floating IDE, or upload a pre-trained model (.onnx, .tflite) or Python project archive.
            </p>
            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={() => setIsIDEOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs"
              >
                Launch Floating IDE
              </button>
              <a
                href={`/projects/${project.id}/upload`}
                className="px-3.5 py-2 rounded-lg bg-[#141b29] text-slate-200 border border-[#222e42] text-xs"
              >
                Upload File
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-5 hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-[#162030] text-cyan-400 border border-cyan-800/30">
                        {app.language}
                      </span>
                      <span className="text-xs font-mono text-slate-500">v{app.version}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        app.status === "ready"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {app.name}
                  </h3>

                  {app.requirements && (
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1a2230] text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500 block">RAM</span>
                        <span className="text-slate-200 font-medium">{app.requirements.ram_mb} MB</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">COMPUTE</span>
                        <span className="text-slate-200 font-medium">{app.requirements.cpu_seconds}s</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">SENSOR</span>
                        <span className="text-cyan-400 font-medium uppercase truncate block">
                          {app.requirements.input_type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-[#1a2230] flex items-center justify-between">
                  <a
                    href={`/applications/${app.id}`}
                    className="text-xs text-slate-300 hover:text-white flex items-center space-x-1"
                  >
                    <span>Validation & Specs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={`/applications/${app.id}/simulate`}
                    className="px-3 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-xs font-mono flex items-center space-x-1.5 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Simulate</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FloatingIDE
        isOpen={isIDEOpen}
        onClose={() => setIsIDEOpen(false)}
        defaultProjectId={project.id}
      />
    </div>
  );
}
