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
      setErrorMessage("Please select a file (.zip, .onnx, or .tflite).");
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
    setIsIDEOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-[#171717] tracking-tight font-mono">
          STAGE ORBITAL WORKLOAD
        </h1>
        <p className="text-xs text-[#66635D]">
          Package edge code or serialized neural nets for spacecraft container deployment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border border-[#DEDCD5] bg-[#FFFFFF] p-1 rounded-[8px]">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-[5px] flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "upload"
              ? "bg-[#171717] text-white shadow-xs"
              : "text-[#66635D] hover:text-[#171717]"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>File Upload (ZIP / ONNX)</span>
        </button>
        <button
          onClick={() => setActiveTab("github")}
          className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-[5px] flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === "github"
              ? "bg-[#171717] text-white shadow-xs"
              : "text-[#66635D] hover:text-[#171717]"
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>GitHub Connect (Preview)</span>
        </button>
        <button
          onClick={() => setIsIDEOpen(true)}
          className="flex-1 py-1.5 text-xs font-mono font-medium rounded-[5px] flex items-center justify-center space-x-1.5 text-[#E9681B] hover:bg-[#F7F6F2] transition-all"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Open Floating IDE</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Tab Form */}
      {activeTab === "upload" && (
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            className="border border-dashed border-[#DEDCD5] hover:border-[#E9681B] bg-[#FFFFFF] rounded-[10px] p-8 text-center transition-all cursor-pointer group shadow-xs"
          >
            <input
              id="file-input"
              type="file"
              accept=".zip,.onnx,.tflite"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-[8px] bg-[#F7F6F2] border border-[#DEDCD5] flex items-center justify-center mx-auto mb-2 text-[#171717] group-hover:text-[#E9681B] transition-colors">
              <Upload className="w-5 h-5" />
            </div>

            {selectedFile ? (
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#171717] font-mono block">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-[#E9681B] font-mono">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for static analysis
                </span>
              </div>
            ) : (
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#171717] block">
                  Select or drop workload file
                </span>
                <span className="text-[11px] text-[#66635D] block">
                  .zip (Python pipeline), .onnx (Neural model), or .tflite
                </span>
              </div>
            )}
          </div>

          {/* Configuration */}
          <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-5 space-y-3 shadow-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-[#66635D] mb-1 font-mono">WORKLOAD NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Hyperspectral Methane Plume Detector"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#DEDCD5] rounded-[6px] px-3 py-1.5 text-xs text-[#171717] outline-none focus:border-[#E9681B]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#66635D] mb-1 font-mono">VERSION</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#DEDCD5] rounded-[6px] px-3 py-1.5 text-xs text-[#171717] outline-none focus:border-[#E9681B] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#66635D] mb-1 font-mono">TARGET SENSOR PAYLOAD</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className="w-full bg-[#F7F6F2] border border-[#DEDCD5] rounded-[6px] px-3 py-1.5 text-xs text-[#171717] outline-none focus:border-[#E9681B] font-mono"
              >
                <option value="multispectral_imagery">Multispectral Imagery (NIR, Thermal IR, RGB)</option>
                <option value="sar_radar">Synthetic Aperture Radar (SAR L-Band)</option>
                <option value="rgb_highres">Optical RGB Sub-meter</option>
                <option value="thermal_ir">Thermal Radiometer (LWIR)</option>
              </select>
            </div>
          </div>

          {/* Action */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-2.5 rounded-[7px] bg-[#E9681B] hover:bg-[#D65A12] text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <span>Running Static Security Scan & Sizing...</span>
            ) : (
              <>
                <span>Validate & Extract Requirements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* GitHub Mock Tab */}
      {activeTab === "github" && (
        <div className="bg-[#FFFFFF] border border-[#DEDCD5] rounded-[10px] p-5 space-y-3 shadow-xs font-mono text-xs">
          <div className="flex items-center space-x-2 text-[#E9681B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E9681B]" />
            <span className="font-bold">GIT INTEGRATION PREVIEW</span>
          </div>
          <p className="text-[#66635D] text-xs font-sans">
            Connect an edge deployment repository. For this iteration, select a preview repository below:
          </p>

          <div className="space-y-2 pt-1">
            <div>
              <label className="block text-[#66635D] mb-1">REPOSITORY</label>
              <select
                value={ghRepo}
                onChange={(e) => setGhRepo(e.target.value)}
                className="w-full bg-[#F7F6F2] border border-[#DEDCD5] rounded-[5px] px-3 py-1.5 text-xs text-[#171717] outline-none"
              >
                <option value="orcom-labs/orbital-wildfire-onnx">
                  orcom-labs/orbital-wildfire-onnx
                </option>
                <option value="orcom-labs/maritime-vessel-sar">
                  orcom-labs/maritime-vessel-sar
                </option>
                <option value="orcom-labs/canopy-nitrogen-ndvi">
                  orcom-labs/canopy-nitrogen-ndvi
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#66635D] mb-1">BRANCH</label>
                <input
                  type="text"
                  value={ghBranch}
                  onChange={(e) => setGhBranch(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#DEDCD5] rounded-[5px] px-3 py-1.5 text-xs text-[#171717] outline-none"
                />
              </div>
              <div>
                <label className="block text-[#66635D] mb-1">ENTRYPOINT</label>
                <input
                  type="text"
                  disabled
                  value="main.py"
                  className="w-full bg-[#EFECE6] border border-[#DEDCD5] rounded-[5px] px-3 py-1.5 text-xs text-[#78746D] outline-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleMockGithubDeploy}
            className="w-full py-2 rounded-[6px] bg-[#171717] hover:bg-[#2B2B2B] text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors mt-3"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Open in Floating IDE</span>
          </button>
        </div>
      )}

      {/* Floating IDE */}
      <FloatingIDE
        isOpen={isIDEOpen}
        onClose={() => setIsIDEOpen(false)}
        defaultProjectId={projectId}
      />
    </div>
  );
}
