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
  FileCode,
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
        <div className="w-5 h-5 border-2 border-[#E9681B] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-[#66635D]">Loading project telemetry...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-24 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h2 className="text-sm font-semibold text-[#171717]">Project Not Found</h2>
        <a href="/" className="text-xs text-[#E9681B] hover:underline mt-2 inline-block">
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#66635D] uppercase">
            <Layers className="w-3.5 h-3.5 text-[#E9681B]" />
            <span>PROJECT WORKSPACE</span>
          </div>
          <h1 className="text-xl font-bold text-[#171717] tracking-tight">{project.name}</h1>
          <p className="text-xs text-[#66635D] max-w-2xl">{project.description}</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsIDEOpen(true)}
            className="btn-orange px-3 py-1.5 flex items-center space-x-1.5 shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Open in IDE</span>
          </button>
          <a
            href={`/projects/${project.id}/upload`}
            className="btn-secondary px-3 py-1.5 flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#171717]" />
            <span>Upload Workload</span>
          </a>
        </div>
      </div>

      {/* Applications Directory */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-wider text-[#171717] font-semibold">
          Configured Workload Applications ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <div className="p-10 text-center rounded-[10px] bg-[#FFFFFF] border border-[#DEDCD5] space-y-3">
            <FileCode className="w-8 h-8 text-[#A5A198] mx-auto" />
            <h3 className="text-xs font-semibold text-[#171717]">No applications packaged yet</h3>
            <p className="text-xs text-[#66635D] max-w-sm mx-auto">
              Author an orbital routine inside the Floating IDE or upload a model binary.
            </p>
            <div className="pt-2 flex justify-center space-x-2">
              <button
                onClick={() => setIsIDEOpen(true)}
                className="btn-orange px-3 py-1.5 text-xs"
              >
                Launch IDE
              </button>
              <a
                href={`/projects/${project.id}/upload`}
                className="btn-secondary px-3 py-1.5 text-xs"
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
                className="bg-[#FFFFFF] border border-[#DEDCD5] hover:border-[#C5C2B8] rounded-[10px] p-5 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#EFECE6] text-[#171717]">
                        {app.language}
                      </span>
                      <span className="text-[11px] font-mono text-[#78746D]">v{app.version}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.2 rounded uppercase font-semibold ${
                        app.status === "ready"
                          ? "bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]"
                          : "bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#171717] group-hover:text-[#E9681B] transition-colors">
                    {app.name}
                  </h3>

                  {app.requirements && (
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#EFECE6] text-[11px] font-mono">
                      <div>
                        <span className="text-[#78746D] block text-[10px]">RAM</span>
                        <span className="text-[#171717] font-semibold">{app.requirements.ram_mb} MB</span>
                      </div>
                      <div>
                        <span className="text-[#78746D] block text-[10px]">COMPUTE</span>
                        <span className="text-[#171717] font-semibold">{app.requirements.cpu_seconds}s</span>
                      </div>
                      <div>
                        <span className="text-[#78746D] block text-[10px]">SENSOR</span>
                        <span className="text-[#E9681B] font-semibold uppercase truncate block">
                          {app.requirements.input_type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-[#EFECE6] flex items-center justify-between">
                  <a
                    href={`/applications/${app.id}`}
                    className="text-xs text-[#66635D] hover:text-[#171717] flex items-center space-x-1 font-mono"
                  >
                    <span>Validation & Specs</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                  <a
                    href={`/applications/${app.id}/simulate`}
                    className="px-2.5 py-1 rounded-[5px] bg-[#171717] hover:bg-[#2B2B2B] text-white text-xs font-mono flex items-center space-x-1.5 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current text-[#E9681B]" />
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
