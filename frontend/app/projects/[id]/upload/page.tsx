"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Upload,
  FileCode,
  GitBranch,
  Terminal,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { api } from "@/lib/api-client";
import FloatingIDE from "@/components/FloatingIDE";

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [activeTab, setActiveTab] = useState<"upload" | "github" | "ide">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [appName, setAppName] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [inputType, setInputType] = useState("multispectral_imagery");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isIDEOpen, setIsIDEOpen] = useState(false);

  // GitHub mock state
  const [ghRepo, setGhRepo] = useState("orcom-labs/orbital-wildfire-onnx");
  const [ghBranch, setGhBranch] = useState("main");

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!appName) {
        setAppName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!appName) {
        setAppName(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage("Please select a file to upload (.zip, .onnx, or .tflite).");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (appName) formData.append("name", appName);
    formData.append("version", version);
    formData.append("input_type", inputType);

    try {
      const app = await api.uploadApplication(projectId, formData);
      router.push(`/applications/${app.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Upload and validation failed.");
      setIsUploading(false);
    }
  };

  const handleMockGithubDeploy = async () => {
    // Uses the pre-validated demo wildfire model
    setIsUploading(true);
    setErrorMessage(null);
    try {
      // Direct user into Floating IDE loaded with template or create directly
      setIsIDEOpen(true);
      setIsUploading(false);
    } catch (err: any) {
      setErrorMessage(err.message || "GitHub repository import failed.");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
          Upload & Package Orbital Workload
        </h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Deploy Python edge routines or serialized models (ONNX, TFLite).
          Every upload passes static security scanning and deterministic hardware sizing.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e2838] bg-[#0c111c] p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTab === "upload"
              ? "bg-[#162030] text-cyan-300 shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>File Upload (ZIP / ONNX / TFLite)</span>
        </button>
        <button
          onClick={() => setActiveTab("github")}
          className={`flex-1 py-2 text-xs font-mono font-medium rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeTab === "github"
              ? "bg-[#162030] text-cyan-300 shadow"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>GitHub Connect (Preview)</span>
        </button>
        <button
          onClick={() => setIsIDEOpen(true)}
          className="flex-1 py-2 text-xs font-mono font-medium rounded-lg flex items-center justify-center space-x-2 text-amber-400 hover:bg-[#162030] transition-all"
        >
          <Terminal className="w-4 h-4" />
          <span>Open Floating IDE</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Tab Form */}
      {activeTab === "upload" && (
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-[#222e42] hover:border-cyan-500/60 bg-[#0e131d] rounded-2xl p-8 text-center transition-all cursor-pointer group"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".zip,.onnx,.tflite"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-[#141b29] border border-[#222e42] flex items-center justify-center mx-auto mb-3 text-cyan-400 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <span className="text-sm font-semibold text-white font-mono block">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-cyan-400 font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <span className="text-sm font-medium text-white block">
                  Click to browse or drop package here
                </span>
                <span className="text-xs text-slate-400 block">
                  Supports .zip (Python project), .onnx (Neural Nets), or .tflite
                </span>
              </div>
            )}
          </div>

          {/* Configuration Fields */}
          <div className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Application Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hyperspectral Methane Plume Detector"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-[#141b29] border border-[#1e2838] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-[#141b29] border border-[#1e2838] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Sensor Type</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className="w-full bg-[#141b29] border border-[#1e2838] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
              >
                <option value="multispectral_imagery">Multispectral Imagery (NIR, Thermal, RGB)</option>
                <option value="sar_radar">Synthetic Aperture Radar (SAR L-Band)</option>
                <option value="rgb_highres">Optical RGB Sub-meter</option>
                <option value="thermal_ir">Thermal Radiometer (LWIR)</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Running Static Security Scan & Sizing...</span>
              </>
            ) : (
              <>
                <span>Validate & Extract Requirements</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* GitHub Mock Tab */}
      {activeTab === "github" && (
        <div className="bg-[#0e131d] border border-[#1e2838] rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>MOCK GITHUB INTEGRATION PREVIEW</span>
          </div>
          <p className="text-xs text-slate-400">
            Connect directly to an edge deployment repository. For this iteration, select a demo repository below to preview the git-sync pipeline.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Repository</label>
              <select
                value={ghRepo}
                onChange={(e) => setGhRepo(e.target.value)}
                className="w-full bg-[#141b29] border border-[#1e2838] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
              >
                <option value="orcom-labs/orbital-wildfire-onnx">
                  orcom-labs/orbital-wildfire-onnx (Recommended)
                </option>
                <option value="orcom-labs/maritime-vessel-sar">
                  orcom-labs/maritime-vessel-sar
                </option>
                <option value="orcom-labs/canopy-nitrogen-ndvi">
                  orcom-labs/canopy-nitrogen-ndvi
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Branch</label>
                <input
                  type="text"
                  value={ghBranch}
                  onChange={(e) => setGhBranch(e.target.value)}
                  className="w-full bg-[#141b29] border border-[#1e2838] rounded-lg px-3 py-2 text-xs text-white outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Entrypoint</label>
                <input
                  type="text"
                  disabled
                  value="main.py : run_orbital_inference"
                  className="w-full bg-[#141b29]/50 border border-[#1e2838] rounded-lg px-3 py-2 text-xs text-slate-400 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleMockGithubDeploy}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center justify-center space-x-2 transition-all mt-4"
          >
            <GitBranch className="w-4 h-4" />
            <span>Open & Edit in Floating IDE</span>
          </button>
        </div>
      )}

      {/* Floating IDE Modal Trigger */}
      <FloatingIDE
        isOpen={isIDEOpen}
        onClose={() => setIsIDEOpen(false)}
        defaultProjectId={projectId}
      />
    </div>
  );
}
