"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Terminal,
  FileCode,
  Play,
  CheckCircle2,
  Sliders,
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Layers,
  Cpu,
  HardDrive,
  Radio,
  ArrowRight,
  ShieldCheck,
  Code
} from "lucide-react";
import { api, Project } from "@/lib/api-client";

interface TemplateWorkload {
  id: string;
  name: string;
  description: string;
  language: string;
  files: Record<string, string>;
  input_type: string;
  ram_mb: number;
  cpu_seconds: number;
  storage_mb: number;
  input_size_mb: number;
  output_size_mb: number;
}

const TEMPLATES: TemplateWorkload[] = [
  {
    id: "wildfire-detector",
    name: "Wildfire Thermal Anomaly Classifier",
    description: "Thermal-IR band clustering isolating active wildfire ignition spots.",
    language: "python",
    input_type: "multispectral",
    ram_mb: 420,
    cpu_seconds: 120.0,
    storage_mb: 1024,
    input_size_mb: 1500.0,
    output_size_mb: 0.15,
    files: {
      "main.py": `"""
OrCom Orbital Payload: Wildfire Thermal Anomaly Detection
Execution Context: Userspace container running on rad-hard ARM Cortex
Input: 16-band multispectral radiometric buffer (B4, B8, B12)
Output: Vector GeoJSON bounding boxes of verified thermal hotspots
"""
import numpy as np

def run_orbital_inference(sensor_buffer):
    print("[OrCom Runtime] Acquiring raw multispectral radiometric frame...")
    thermal_band = sensor_buffer.get("band_12_thermal_kelvin", np.zeros((1024, 1024)))
    
    # Radiometric thresholding for ignition hotspot (T > 325K)
    hotspot_mask = thermal_band > 325.0
    detected_clusters = int(np.sum(hotspot_mask) > 12)
    
    # Downlink only high-value vector alert (99.99% compression)
    alert_payload = {
        "detection_event": "THERMAL_HOTSPOT_VERIFIED",
        "cluster_count": detected_clusters,
        "max_temperature_kelvin": float(np.max(thermal_band)),
        "confidence": 0.964,
        "coordinates": {"lat": 15.8281, "lon": 78.0373},
        "compression_ratio": "99.99%"
    }
    print(f"[OrCom Edge] Anomaly confirmed. Emitting {len(str(alert_payload))} bytes.")
    return alert_payload
`,
      "requirements.txt": `numpy>=1.24.0
scipy>=1.10.0
# Flight-critical safety rule: no socket, subprocess, or os.system
`,
      "orcom_manifest.json": `{
  "schema_version": "1.0",
  "name": "Wildfire Thermal Anomaly Classifier",
  "version": "1.2.0",
  "sensor_capabilities": ["multispectral", "thermal_ir"],
  "isolation_level": "sandboxed_userspace"
}`
    }
  },
  {
    id: "maritime-sar",
    name: "Maritime Dark Vessel AIS Correlator",
    description: "Synthetic Aperture Radar (SAR) ship edge extractor cross-referenced with AIS signals.",
    language: "python",
    input_type: "sar",
    ram_mb: 850,
    cpu_seconds: 180.0,
    storage_mb: 2048,
    input_size_mb: 2400.0,
    output_size_mb: 0.20,
    files: {
      "main.py": `"""
OrCom Orbital Payload: Maritime Dark Vessel SAR Extractor
Input: L-band SAR backscatter radar matrix
Output: Geo-referenced vessel target points with missing AIS flags
"""
import numpy as np

def process_sar_swath(radar_frame):
    print("[SAR Processor] Running Constant False Alarm Rate (CFAR) detector...")
    backscatter = radar_frame.get("sigma_0_db", np.random.randn(2048, 2048))
    
    # Identify high-reflectance metallic hulls
    targets = np.where(backscatter > 14.5)
    num_vessels = len(targets[0])
    
    return {
        "event": "DARK_VESSEL_DETECTED",
        "vessel_count": num_vessels,
        "radar_snr_db": 18.2,
        "ais_transponder_status": "UNMATCHED_SHADOW"
    }
`,
      "requirements.txt": `numpy>=1.24.0\nscipy>=1.11.0\n`,
      "orcom_manifest.json": `{\n  "name": "Maritime Dark Vessel AIS Correlator",\n  "sensor_capabilities": ["sar", "rgb"]\n}`
    }
  },
  {
    id: "crop-ndvi",
    name: "Agricultural Canopy NDVI & Drought Index",
    description: "Multi-band Red/NIR reflection ratio measuring crop nitrogen health.",
    language: "python",
    input_type: "multispectral",
    ram_mb: 380,
    cpu_seconds: 90.0,
    storage_mb: 1024,
    input_size_mb: 1200.0,
    output_size_mb: 0.40,
    files: {
      "main.py": `"""
OrCom Agricultural Health Indexer
Calculates Normalized Difference Vegetation Index (NIR - Red) / (NIR + Red)
"""
import numpy as np

def compute_canopy_metrics(red_band, nir_band):
    print("[OrCom Edge] Processing red/NIR reflectance bands...")
    denominator = nir_band + red_band + 1e-6
    ndvi = (nir_band - red_band) / denominator
    deficit_area_pct = float(np.mean(ndvi < 0.25) * 100.0)
    
    return {
        "metric": "NDVI_CANOPY_INDEX",
        "mean_ndvi": float(np.mean(ndvi)),
        "drought_stress_area_pct": deficit_area_pct,
        "classification": "Moderate Drought Stress" if deficit_area_pct > 15 else "Healthy"
    }
`,
      "requirements.txt": `numpy>=1.24.0\n`,
      "orcom_manifest.json": `{\n  "name": "Agricultural Canopy NDVI",\n  "sensor_capabilities": ["multispectral"]\n}`
    }
  },
  {
    id: "oversized-stress-test",
    name: "Oversized ResNet Workload (Stress Test)",
    description: "Requires 1800MB RAM to demonstrate real platform validation warnings against OC-01/OC-03.",
    language: "python",
    input_type: "rgb",
    ram_mb: 1800,
    cpu_seconds: 280.0,
    storage_mb: 3500,
    input_size_mb: 3000.0,
    output_size_mb: 1.5,
    files: {
      "main.py": `"""
Heavyweight Convolutional Model (High Memory Allocation)
Used to demonstrate realistic spacecraft resource limits and validator warnings!
"""
import numpy as np

# Large model footprint requiring 1.8GB onboard RAM
model_weights = np.zeros((1800, 1024, 1024), dtype=np.float16)

def run_deep_ensemble(image_tile):
    print("[Deep Ensemble] Allocating 1.8GB RAM across compute cores...")
    return {"prediction": "Heavyweight pipeline complete"}
`,
      "requirements.txt": `numpy>=1.24.0\ntorch>=2.0.0\n`,
      "orcom_manifest.json": `{\n  "name": "Heavyweight Model",\n  "ram_requirement_mb": 1800\n}`
    }
  }
];

interface FloatingIDEProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export default function FloatingIDE({
  isOpen,
  onClose,
  defaultProjectId,
}: FloatingIDEProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("wildfire-detector");

  // Editor state
  const [files, setFiles] = useState<Record<string, string>>(TEMPLATES[0].files);
  const [activeTab, setActiveTab] = useState<string>("main.py");
  const [appName, setAppName] = useState<string>(TEMPLATES[0].name);
  const [appVersion, setAppVersion] = useState<string>("1.0.0");
  const [language, setLanguage] = useState<string>("python");

  // Workload configuration
  const [inputType, setInputType] = useState<string>(TEMPLATES[0].input_type);
  const [ramMb, setRamMb] = useState<number>(TEMPLATES[0].ram_mb);
  const [cpuSeconds, setCpuSeconds] = useState<number>(TEMPLATES[0].cpu_seconds);
  const [storageMb, setStorageMb] = useState<number>(TEMPLATES[0].storage_mb);
  const [inputSizeMb, setInputSizeMb] = useState<number>(TEMPLATES[0].input_size_mb);
  const [outputSizeMb, setOutputSizeMb] = useState<number>(TEMPLATES[0].output_size_mb);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    api.getProjects()
      .then((data) => {
        setProjects(data);
        if (defaultProjectId) {
          setSelectedProjectId(defaultProjectId);
        } else if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      })
      .catch((err) => console.error("Could not fetch projects in IDE", err));
  }, [defaultProjectId]);

  const handleSelectTemplate = (templateId: string) => {
    const t = TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setSelectedTemplateId(templateId);
    setAppName(t.name);
    setFiles({ ...t.files });
    setActiveTab("main.py");
    setInputType(t.input_type);
    setRamMb(t.ram_mb);
    setCpuSeconds(t.cpu_seconds);
    setStorageMb(t.storage_mb);
    setInputSizeMb(t.input_size_mb);
    setOutputSizeMb(t.output_size_mb);
    setErrorMessage(null);
  };

  const handleCodeChange = (newCode: string) => {
    setFiles((prev) => ({
      ...prev,
      [activeTab]: newCode,
    }));
  };

  const currentCode = files[activeTab] || "";
  const lineNumbers = useMemo(() => {
    const count = currentCode.split("\n").length;
    return Array.from({ length: Math.max(count, 1) }, (_, i) => i + 1);
  }, [currentCode]);

  const downlinkReductionPct = (
    (1.0 - outputSizeMb / (inputSizeMb || 1.0)) *
    100.0
  ).toFixed(2);

  const handleValidateAndPackage = async () => {
    if (!selectedProjectId) {
      setErrorMessage("Please select a target Project before packaging.");
      return;
    }
    if (!appName.trim()) {
      setErrorMessage("Please enter an Application Name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const app = await api.publishIDEApplication(selectedProjectId, {
        project_id: selectedProjectId,
        name: appName,
        version: appVersion,
        language: language,
        files: files,
        input_type: inputType,
        ram_mb: ramMb,
        cpu_seconds: cpuSeconds,
        storage_mb: storageMb,
        input_size_mb: inputSizeMb,
        output_size_mb: outputSizeMb,
      });

      onClose();
      router.push(`/applications/${app.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to package application bundle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div
        className={`relative flex flex-col bg-[#18181B] border border-[#2B2B30] rounded-[12px] shadow-2xl overflow-hidden transition-all duration-200 ${
          isMaximized ? "w-full h-full rounded-none" : "w-[96vw] max-w-6xl h-[88vh]"
        }`}
      >
        {/* Cursor/VS Code Titlebar Chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#121214] border-b border-[#252528] text-xs select-none">
          {/* Left: Window controls & branding */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#EF4444] hover:opacity-80 transition-opacity" />
              <button onClick={() => setIsMaximized(!isMaximized)} className="w-3 h-3 rounded-full bg-[#F59E0B] hover:opacity-80 transition-opacity" />
              <button className="w-3 h-3 rounded-full bg-[#10B981] hover:opacity-80 transition-opacity" />
            </div>
            <div className="flex items-center space-x-2 text-[#F7F6F2] font-mono text-xs pl-2 border-l border-[#2B2B30]">
              <Terminal className="w-3.5 h-3.5 text-[#E9681B]" />
              <span className="font-semibold text-xs tracking-tight">ORCOM STUDIO</span>
              <span className="text-[#71717A] text-[11px]">•</span>
              <span className="text-[#A1A1AA] text-[11px]">THIS CODE WILL EXECUTE IN ORBIT</span>
            </div>
          </div>

          {/* Right: Template picker & controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-[#A1A1AA]">
              <span className="hidden sm:inline">Template:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="bg-[#202024] border border-[#303036] text-[#F7F6F2] rounded-[4px] px-2 py-1 text-xs outline-none focus:border-[#E9681B]"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="text-[#71717A] hover:text-white p-1"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="text-[#71717A] hover:text-rose-400 p-1"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Workspace: Left Editor Pane, Right Config Panel */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Pane: True IDE Editor */}
          <div className="flex-1 flex flex-col border-r border-[#252528] bg-[#18181B]">
            {/* Tab Bar */}
            <div className="flex items-center bg-[#141416] border-b border-[#252528] px-2 select-none overflow-x-auto">
              {Object.keys(files).map((filename) => (
                <button
                  key={filename}
                  onClick={() => setActiveTab(filename)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-mono border-b-2 transition-colors ${
                    activeTab === filename
                      ? "border-[#E9681B] text-[#F7F6F2] bg-[#1C1C1F]"
                      : "border-transparent text-[#71717A] hover:text-[#D4D4D8] hover:bg-[#18181B]"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#E9681B]" />
                  <span>{filename}</span>
                </button>
              ))}
            </div>

            {/* Code Textarea with Line Numbers Gutter */}
            <div className="relative flex-1 flex overflow-hidden bg-[#18181B]">
              {/* Line Numbers Gutter */}
              <div className="w-11 py-3 px-1 text-right select-none bg-[#141416] border-r border-[#252528] text-[#52525B] font-mono text-xs leading-[21px]">
                {lineNumbers.map((num) => (
                  <div key={num}>{num}</div>
                ))}
              </div>

              {/* Code Surface */}
              <textarea
                value={currentCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                spellCheck={false}
                className="flex-1 h-full py-3 px-3 bg-[#18181B] text-[#E4E4E7] font-mono text-xs leading-[21px] outline-none resize-none border-none selection:bg-[#E9681B]/30"
              />
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#121214] border-t border-[#252528] text-[11px] font-mono text-[#71717A]">
              <div className="flex items-center space-x-3">
                <span className="text-[#10B981] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>Python 3.10</span>
                </span>
                <span>UTF-8</span>
                <span>Spacecraft Sandbox: Active</span>
              </div>
              <div className="text-[#71717A] hidden sm:inline">
                flight_critical bus isolated (zero import path)
              </div>
            </div>
          </div>

          {/* Right Pane: Application Requirements Drawer */}
          <div className="w-full lg:w-88 bg-[#151518] flex flex-col overflow-y-auto p-4 border-t lg:border-t-0 border-[#252528]">
            <div className="flex items-center justify-between pb-3 border-b border-[#252528] mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] font-semibold flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#E9681B]" />
                <span>Workload Parameters</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#202024] text-[#E9681B] border border-[#33333A]">
                SPEC V1.0
              </span>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Project Selection */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#71717A] mb-1">TARGET PROJECT</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#1C1C1F] border border-[#2B2B30] text-[#F7F6F2] rounded-[5px] px-2.5 py-1.5 text-xs outline-none focus:border-[#E9681B]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workload Name & Version */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-mono text-[#71717A] mb-1">WORKLOAD NAME</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full bg-[#1C1C1F] border border-[#2B2B30] text-[#F7F6F2] rounded-[5px] px-2.5 py-1.5 text-xs outline-none focus:border-[#E9681B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] mb-1">VERSION</label>
                  <input
                    type="text"
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    className="w-full bg-[#1C1C1F] border border-[#2B2B30] text-[#F7F6F2] rounded-[5px] px-2.5 py-1.5 text-xs outline-none focus:border-[#E9681B] font-mono"
                  />
                </div>
              </div>

              {/* Sensor Payload */}
              <div>
                <label className="block text-[11px] font-mono text-[#71717A] mb-1">REQUIRED SENSOR</label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value)}
                  className="w-full bg-[#1C1C1F] border border-[#2B2B30] text-[#F7F6F2] rounded-[5px] px-2.5 py-1.5 text-xs outline-none focus:border-[#E9681B] font-mono"
                >
                  <option value="multispectral">Multispectral (Radiometric Thermal/NIR)</option>
                  <option value="sar">Synthetic Aperture Radar (SAR L-Band)</option>
                  <option value="rgb">High-Resolution Optical RGB</option>
                  <option value="thermal_ir">Thermal Radiometer (LWIR)</option>
                </select>
              </div>

              {/* Hardware Requirements: RAM */}
              <div className="pt-2 border-t border-[#252528] space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-[#A1A1AA] flex items-center space-x-1">
                      <Layers className="w-3 h-3 text-[#E9681B]" />
                      <span>ALLOCATED RAM</span>
                    </span>
                    <span className="text-[#E9681B] font-bold">{ramMb} MB</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="2048"
                    step="64"
                    value={ramMb}
                    onChange={(e) => setRamMb(parseInt(e.target.value))}
                    className="w-full accent-[#E9681B]"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#52525B]">
                    <span>256 MB</span>
                    <span>1024 MB (OC-01)</span>
                    <span>2048 MB (OC-02)</span>
                  </div>
                </div>

                {/* Compute Pass Window */}
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-[#A1A1AA] flex items-center space-x-1">
                      <Cpu className="w-3 h-3 text-[#E9681B]" />
                      <span>COMPUTE WINDOW</span>
                    </span>
                    <span className="text-[#E9681B] font-bold">{cpuSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="360"
                    step="10"
                    value={cpuSeconds}
                    onChange={(e) => setCpuSeconds(parseFloat(e.target.value))}
                    className="w-full accent-[#E9681B]"
                  />
                </div>

                {/* Data Sizes */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div className="bg-[#1C1C1F] p-2.5 rounded-[5px] border border-[#2B2B30]">
                    <span className="text-[10px] text-[#71717A] block">RAW SENSOR IN</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <input
                        type="number"
                        value={inputSizeMb}
                        onChange={(e) => setInputSizeMb(Math.max(1, parseFloat(e.target.value) || 1))}
                        className="w-full bg-transparent text-xs text-white outline-none"
                      />
                      <span className="text-[10px] text-[#71717A]">MB</span>
                    </div>
                  </div>
                  <div className="bg-[#1C1C1F] p-2.5 rounded-[5px] border border-[#2B2B30]">
                    <span className="text-[10px] text-[#71717A] block">DOWNLINK OUT</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <input
                        type="number"
                        step="0.05"
                        value={outputSizeMb}
                        onChange={(e) => setOutputSizeMb(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                        className="w-full bg-transparent text-xs text-white outline-none"
                      />
                      <span className="text-[10px] text-[#71717A]">MB</span>
                    </div>
                  </div>
                </div>

                {/* Downlink Bandwidth Savings Callout */}
                <div className="p-3 rounded-[6px] bg-[#1C1C1F] border border-[#2B2B30] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#A1A1AA]">Downlink Savings</span>
                    <span className="text-sm font-bold text-[#E9681B]">{downlinkReductionPct}%</span>
                  </div>
                  <p className="text-[10px] text-[#71717A] mt-1">
                    Transmitting {outputSizeMb} MB vector alert instead of {inputSizeMb} MB raw pixels.
                  </p>
                </div>
              </div>
            </div>

            {/* Packaging CTA Button */}
            <div className="mt-auto pt-4 border-t border-[#252528]">
              <button
                onClick={handleValidateAndPackage}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-[6px] bg-[#E9681B] hover:bg-[#D65A12] text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Analyzing & Packaging Workload...</span>
                ) : (
                  <>
                    <span>Validate & Package for Orbit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
