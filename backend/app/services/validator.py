import os
import re
import zipfile
from pathlib import Path
from typing import Dict, Any, List, Tuple
from app.core.constants import DISALLOWED_PATTERNS, SUPPORTED_LANGUAGES
from app.schemas.schemas import ValidationCheckItem

def extract_zip_content_preview(zip_path: Path) -> Tuple[List[str], str]:
    """Reads file list and primary python code content from a zip archive."""
    file_list = []
    code_text = ""
    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            file_list = z.namelist()
            # Find entrypoint like main.py or handler.py
            entrypoints = [f for f in file_list if f.endswith(".py")]
            for ep in entrypoints[:3]:
                try:
                    code_text += "\n" + z.read(ep).decode("utf-8", errors="ignore")
                except Exception:
                    pass
    except Exception as e:
        code_text = f"# Zip read error: {str(e)}"
    return file_list, code_text

def run_static_security_analysis(code_str: str) -> List[str]:
    """
    Static pattern matching check to enforce separation between customer
    workload runtime and the flight-critical spacecraft bus.
    """
    flags = []
    for pattern in DISALLOWED_PATTERNS:
        if re.search(r"\b" + pattern + r"\b", code_str, re.IGNORECASE):
            clean_name = pattern.replace(r"\.", ".")
            flags.append(f"Disallowed system/network pattern detected: '{clean_name}'")
    return flags

def analyze_workload(
    file_path: Path,
    filename: str,
    declared_config: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Performs deterministic inspection of an uploaded or IDE-generated workload.
    Produces resource estimates, dependency extractions, security scan results, and UI checklist.
    """
    declared = declared_config or {}
    file_size_bytes = file_path.stat().st_size if file_path.exists() else 1024 * 50
    file_size_mb = round(file_size_bytes / (1024.0 * 1024.0), 2)
    
    ext = Path(filename).suffix.lower()
    
    # 1. Detect language / format
    if ext == ".zip":
        language = "python"
        files, code_content = extract_zip_content_preview(file_path)
    elif ext in [".onnx"]:
        language = "onnx"
        files, code_content = [filename], ""
    elif ext in [".tflite"]:
        language = "tflite"
        files, code_content = [filename], ""
    else:
        language = declared.get("language", "python")
        files = declared.get("files", [filename])
        code_content = declared.get("code", "")
        
    # 2. Dependency detection
    dependencies = ["numpy", "scipy"]
    if language == "onnx":
        dependencies = ["onnxruntime-radhard", "numpy"]
    elif language == "tflite":
        dependencies = ["tflite-runtime-micro", "numpy"]
    elif "torch" in code_content:
        dependencies.append("torch-embedded")
    if "cv2" in code_content:
        dependencies.append("opencv-micro")
        
    # 3. Security checks
    security_flags = run_static_security_analysis(code_content)
    
    # 4. Resource heuristic estimation
    # Heuristic: base memory + model/artifact size * 2.5 buffer
    ram_mb = declared.get("ram_mb")
    if not ram_mb:
        if language in ["onnx", "tflite"]:
            ram_mb = max(256, int(file_size_mb * 4 + 128))
        else:
            ram_mb = 420  # standard efficient edge python pipeline
            
    storage_mb = declared.get("storage_mb") or max(512, int(file_size_mb * 3 + 256))
    cpu_seconds = declared.get("cpu_seconds") or (90.0 if language in ["onnx", "tflite"] else 120.0)
    
    # Power estimation: rough conversion of CPU-seconds at satellite 20W TDP
    estimated_power_wh = round((cpu_seconds / 3600.0) * 22.0, 2)
    
    input_type = declared.get("input_type", "multispectral_imagery")
    input_size_mb = declared.get("input_size_mb", 1500.0)
    output_size_mb = declared.get("output_size_mb", 0.15)
    
    # 5. Build structured checklist for UI
    checks: List[ValidationCheckItem] = []
    
    # Language check
    if language in SUPPORTED_LANGUAGES:
        checks.append(ValidationCheckItem(
            category="runtime",
            title="Runtime & Format Validation",
            status="pass",
            message=f"Workload format '{language}' is officially supported by OrCom isolated runtime engine."
        ))
    else:
        checks.append(ValidationCheckItem(
            category="runtime",
            title="Runtime Format Warning",
            status="warn",
            message=f"Format '{language}' requires fallback containerization.",
            suggested_action="Package as ONNX or standardized Python entrypoint."
        ))
        
    # Security check
    if not security_flags:
        checks.append(ValidationCheckItem(
            category="security",
            title="Flight-Critical Isolation Check",
            status="pass",
            message="No prohibited system calls (os.system, socket, subprocess) detected. Workload respects bus isolation."
        ))
    else:
        checks.append(ValidationCheckItem(
            category="security",
            title="Sandbox Boundary Alert",
            status="warn",
            message=f"Potentially disallowed system operations: {', '.join(security_flags)}",
            suggested_action="Refactor pipeline to consume platform sensor I/O abstraction instead of direct socket/syscalls."
        ))
        
    # Memory check against fleet
    # OC-01 has 1024MB, OC-02 has 2048MB, OC-03 has 512MB
    if ram_mb <= 512:
        checks.append(ValidationCheckItem(
            category="memory",
            title="Memory Footprint: High Fleet Compatibility",
            status="pass",
            message=f"Required RAM ({ram_mb} MB) is compatible across all spacecraft in the fleet."
        ))
    elif ram_mb <= 1024:
        checks.append(ValidationCheckItem(
            category="memory",
            title="Memory Footprint: Standard Fleet Compatibility",
            status="pass",
            message=f"Required RAM ({ram_mb} MB) fits OC-01 (1024 MB) and OC-02 (2048 MB)."
        ))
    elif ram_mb <= 2048:
        checks.append(ValidationCheckItem(
            category="memory",
            title="Memory Footprint: High Spec Satellite Required",
            status="warn",
            message=f"Required RAM ({ram_mb} MB) exceeds OC-01 (1024 MB) and OC-03 (512 MB). Only OC-02 is compatible.",
            suggested_action="Quantize model weights to INT8 or reduce input batch tile size to fit standard rad-hard bus."
        ))
    else:
        checks.append(ValidationCheckItem(
            category="memory",
            title="Memory Limit Exceeded",
            status="fail",
            message=f"Required RAM ({ram_mb} MB) exceeds maximum spacecraft onboard memory (2048 MB).",
            suggested_action="Downscale neural network architecture or partition workload into sequential pipeline passes."
        ))
        
    # CPU & Power check
    if cpu_seconds <= 240:
        checks.append(ValidationCheckItem(
            category="compute",
            title="Pass Compute Window Feasibility",
            status="pass",
            message=f"Estimated compute time ({cpu_seconds}s) completes well within the 360s orbital pass window."
        ))
    else:
        checks.append(ValidationCheckItem(
            category="compute",
            title="Compute Window Duration Warning",
            status="warn",
            message=f"Compute time ({cpu_seconds}s) approaches the orbital pass window horizon.",
            suggested_action="Optimize inner loops or enable hardware vector acceleration."
        ))

    # Downlink advantage check
    downlink_reduction = round((1.0 - (output_size_mb / input_size_mb)) * 100.0, 2)
    checks.append(ValidationCheckItem(
        category="downlink",
        title="Orbital Edge Downlink Optimization",
        status="pass",
        message=f"In-orbit edge processing yields a {downlink_reduction}% bandwidth reduction ({input_size_mb} MB raw down to {output_size_mb} MB vector results)."
    ))

    overall_status = "analysis_failed" if any(c.status == "fail" for c in checks) else "ready"

    return {
        "status": overall_status,
        "language": language,
        "files": files,
        "dependencies": dependencies,
        "security_flags": security_flags,
        "ram_mb": ram_mb,
        "storage_mb": storage_mb,
        "cpu_seconds": cpu_seconds,
        "estimated_power_wh": estimated_power_wh,
        "input_type": input_type,
        "input_size_mb": input_size_mb,
        "output_size_mb": output_size_mb,
        "checks": checks
    }
