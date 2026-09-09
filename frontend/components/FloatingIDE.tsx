"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Code,
  Terminal,
  FileCode,
  Play,
  Save,
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
  FolderOpen
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
    description: "Multispectral thermal-IR band clustering detecting active wildfire ignition spots.",
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
Input: 16-band multispectral radiometric tensor (B4, B8, B12 thermal)
Output: Vector GeoJSON bounding boxes of high-confidence thermal hotspots
"""
import numpy as np

def run_orbital_inference(sensor_buffer):
    print("[OrCom Runtime] Initializing sensor frame acquisition...")
    # Buffer contains calibrated radiance in Kelvin
    thermal_band = sensor_buffer.get("band_12_thermal_kelvin", np.zeros((1024, 1024)))
    
    # Threshold for ignition hotspot (T > 325K)
    hotspot_mask = thermal_band > 325.0
    detected_clusters = int(np.sum(hotspot_mask) > 12)
    
    # Downlink only high-value vector alert
    alert_payload = {
        "detection_event": "THERMAL_HOTSPOT_VERIFIED",
        "hotspot_count": detected_clusters,
        "max_temp_k": float(np.max(thermal_band)),
        "confidence": 0.964,
        "compression_ratio": "99.99%"
    }
    print(f"[OrCom Edge] Hotspot identified. Vectorizing {len(str(alert_payload))} bytes.")
    return alert_payload
`,
      "requirements.txt": `numpy>=1.24.0
scipy>=1.10.0
# Notice: no forbidden network or subprocess dependencies
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
      "requirements.txt": `numpy>=1.24.0
scipy>=1.11.0
`,
      "orcom_manifest.json": `{
  "name": "Maritime Dark Vessel AIS Correlator",
  "version": "2.0.1",
  "sensor_capabilities": ["sar", "rgb"]
}`
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
    description: "Heavyweight model requiring 1800MB RAM to demonstrate real platform validation warnings.",
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

  // Fetch projects on mount
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

  // Load template
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

  // Calculate real-time downlink bandwidth reduction
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

      // Close IDE and navigate directly to application validation / compatibility page
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative flex flex-col bg-[#0b0f17] border border-[#1e2838] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isMaximized ? "w-full h-full max-w-none max-h-none rounded-none" : "w-[94vw] max-w-6xl h-[88vh]"
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e131d] border-b border-[#1e2838] text-sm select-none">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono font-semibold">
              <Terminal className="w-4 h-4" />
              <span>ORCOM FLOATING IDE</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
              Orbital Workload Studio
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Template Selector */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Template:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="bg-[#141b29] border border-[#222e42] text-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-cyan-500"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Window Controls */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="text-slate-400 hover:text-white p-1"
              title={isMaximized ? "Restore size" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-rose-400 p-1"
              title="Close IDE"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main IDE Workspace: Editor Left, Config Drawer Right */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Code Editor Pane */}
          <div className="flex-1 flex flex-col border-r border-[#1e2838] bg-[#080b11]">
            {/* File Tabs */}
            <div className="flex items-center bg-[#0d121c] border-b border-[#1e2838] px-2 overflow-x-auto select-none">
              {Object.keys(files).map((filename) => (
                <button
                  key={filename}
                  onClick={() => setActiveTab(filename)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-mono border-b-2 transition-colors ${
                    activeTab === filename
                      ? "border-cyan-400 text-cyan-300 bg-[#121824]"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#101521]"
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400/70" />
                  <span>{filename}</span>
                </button>
              ))}
            </div>

            {/* Code Textarea / Line Number Area */}
            <div className="relative flex-1 flex overflow-hidden">
              <textarea
                value={files[activeTab] || ""}
                onChange={(e) => handleCodeChange(e.target.value)}
                spellCheck={false}
                className="w-full h-full p-4 bg-[#07090e] text-slate-200 font-mono text-xs sm:text-sm leading-relaxed outline-none resize-none border-none selection:bg-cyan-900/60"
              />
            </div>

            {/* Editor Footer Status */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d121c] border-t border-[#1e2838] text-[11px] font-mono text-slate-400">
              <div className="flex items-center space-x-3">
                <span className="text-emerald-400">● UTF-8</span>
                <span>Language: Python 3.10 / Embedded</span>
              </div>
              <div className="text-slate-500">
                Sandboxed Workload Runtime (flight-critical isolated)
              </div>
            </div>
          </div>

          {/* Right: Application & Spacecraft Requirements Configuration */}
          <div className="w-full lg:w-96 bg-[#0b0f17] flex flex-col overflow-y-auto p-4 border-t lg:border-t-0 border-[#1e2838]">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 mb-3 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Platform Configuration</span>
            </div>

            {errorMessage && (
              <div className="mb-3 p-2.5 rounded bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Target Project */}
            <div className="mb-3">
              <label className="block text-xs text-slate-400 mb-1">Target Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-[#121824] border border-[#1e2838] text-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-cyan-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* App Name & Version */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Workload Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1e2838] text-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Version</label>
                <input
                  type="text"
                  value={appVersion}
                  onChange={(e) => setAppVersion(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1e2838] text-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Sensor Requirements */}
            <div className="mb-3">
              <label className="block text-xs text-slate-400 mb-1">Required Sensor Payload</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className="w-full bg-[#121824] border border-[#1e2838] text-slate-200 rounded px-2.5 py-1.5 text-xs outline-none focus:border-cyan-500"
              >
                <option value="multispectral">Multispectral (RGB + NIR + RedEdge)</option>
                <option value="thermal_ir">Thermal Infrared (Radiometric LWIR)</option>
                <option value="sar">Synthetic Aperture Radar (SAR)</option>
                <option value="rgb">Optical RGB High-Res</option>
              </select>
            </div>

            {/* Hardware Resource Requirements */}
            <div className="space-y-3 pt-2 border-t border-[#1e2838]">
              {/* RAM */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-cyan-400" />
                    <span>Allocated RAM</span>
                  </span>
                  <span className="font-mono text-cyan-300">{ramMb} MB</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="2048"
                  step="64"
                  value={ramMb}
                  onChange={(e) => setRamMb(parseInt(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>256 MB (OC-03)</span>
                  <span>1024 MB (OC-01)</span>
                  <span>2048 MB (OC-02)</span>
                </div>
              </div>

              {/* Compute Seconds */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Cpu className="w-3 h-3 text-cyan-400" />
                    <span>Pass Compute Budget</span>
                  </span>
                  <span className="font-mono text-cyan-300">{cpuSeconds}s</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="360"
                  step="10"
                  value={cpuSeconds}
                  onChange={(e) => setCpuSeconds(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Data Sizes & Downlink Advantage */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-[#121824] p-2 rounded border border-[#1e2838]">
                  <span className="text-[10px] text-slate-400 block">Raw Input Size</span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <input
                      type="number"
                      value={inputSizeMb}
                      onChange={(e) => setInputSizeMb(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-full bg-transparent font-mono text-xs text-white outline-none"
                    />
                    <span className="text-[10px] text-slate-400">MB</span>
                  </div>
                </div>
                <div className="bg-[#121824] p-2 rounded border border-[#1e2838]">
                  <span className="text-[10px] text-slate-400 block">Vector Output</span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <input
                      type="number"
                      step="0.05"
                      value={outputSizeMb}
                      onChange={(e) => setOutputSizeMb(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                      className="w-full bg-transparent font-mono text-xs text-white outline-none"
                    />
                    <span className="text-[10px] text-slate-400">MB</span>
                  </div>
                </div>
              </div>

              {/* Bandwidth Advantage Callout */}
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-medium">Downlink Savings</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {downlinkReductionPct}%
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/70 mt-1">
                  Transmitting {outputSizeMb} MB edge result instead of {inputSizeMb} MB raw sensor stream.
                </p>
              </div>
            </div>

            {/* Packaging CTA */}
            <div className="mt-auto pt-4">
              <button
                onClick={handleValidateAndPackage}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-950/40 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Validating & Packaging...</span>
                  </>
                ) : (
                  <>
                    <span>Validate & Package Workload</span>
                    <ArrowRight className="w-4 h-4" />
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
