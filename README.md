# OrCom — Orbital Edge Compute Platform

> **"Spacecraft is Infrastructure, Software is the Product."**

OrCom is an orbital developer platform enabling software engineers to write, validate, simulate, and deploy edge computing workloads on Low Earth Orbit (LEO) satellite constellations — without touching physical spacecraft hardware.

Built for **Iteration 1 Priority**: proving the end-to-end software developer journey from IDE to orbital pass and result:
$$\text{Web App} \longrightarrow \text{Floating IDE} \longrightarrow \text{Configuration} \longrightarrow \text{Validation} \longrightarrow \text{Simulation} \longrightarrow \text{Mission Execution} \longrightarrow \text{Result}$$

---

## ⚡ Quick Start (Two-Command Setup)

### 1. Start the Backend API (FastAPI + Uvicorn)
```bash
cd backend
python -m uvicorn app.main:app --port 8000 --reload
```
*The database and investor-ready demo state (including the pre-seeded completed Wildfire Detection mission) will be automatically initialized.*
*API Docs: http://localhost:8000/docs*

### 2. Start the Frontend (Next.js App Router)
```bash
cd frontend
npm run dev
```
*Frontend Console: http://localhost:3000*

---

## 🛰️ Architecture & Provider Seam

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend UI (Next.js 16 + App Router)       │
│   Dashboard • Floating IDE • Map Tracker • Mission Console   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / Polling
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Routers Layer                    │
│   /projects • /applications • /simulations • /missions      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Dependency Injection: get_provider()
┌──────────────────────────────▼──────────────────────────────┐
│             SatelliteProvider (Abstract Interface)          │
│   list_satellites() • get_ground_track() • deploy_mission() │
└───────────────────────┬───────────────────────────────┬─────┘
                        │                               │
┌───────────────────────▼─────────────┐   ┌─────────────▼────────────────┐
│   MockProvider (Active MVP)         │   │   DhruvaProvider (Stub)      │
│   • Keplerian Circular Propagation  │   │   • Drop-in hardware adapter │
│   • Deterministic Resource Sizing   │   │   • Raises NotImplemented    │
│   • Antimeridian Segment Splitting  │   │     until integration        │
└─────────────────────────────────────┘   └──────────────────────────────┘
```

### Architectural Seam Verification
All API routers depend exclusively on `SatelliteProvider`. To verify the seam:
1. In `backend/app/core/config.py`, change `SATELLITE_PROVIDER = "dhruva"` (or launch with `SATELLITE_PROVIDER=dhruva`).
2. Reload any endpoint (e.g. `/api/satellites`).
3. The platform returns a structured `501 Not Implemented ("Dhruva integration pending — see providers/dhruva_provider.py")` rather than breaking.

### Spacecraft Bus vs Customer Runtime Sandboxing
- `app.flight_critical.*`: Controls attitude determination, reaction wheels, bus telemetry, and power rails.
- `app.runtime.*`: Executes customer payloads in an isolated userspace container.
- Prohibited system calls (`os.system`, `subprocess`, raw network sockets) are statically intercepted by the validation engine prior to flight scheduling.

---

## 🎬 Scripted Demo Walkthrough (Investor-Ready)

### Phase 1: The Completed Mission Proof-of-Concept
1. Open `http://localhost:3000`.
2. Inspect the **Telemetry Metrics**:
   - **99.99% Downlink Bandwidth Savings**: Edge inference reduces 1,500 MB of raw multispectral imagery to a 0.15 MB vector polygon alert.
   - **3.8s Edge Inference Latency** on rad-hard ARM bus.
3. Click into Mission `OC-28491` under **Orbital Missions**:
   - View the verified detection: *"Active Thermal Hotspot (Cluster #4)"* with **96.4% confidence** at coordinates `15.8281° N, 78.0373° E` in Andhra Pradesh.
   - View the completed 7-stage lifecycle (`Scheduled` → `Awaiting Pass` → `Sensor Active` → `Capturing` → `Processing` → `Downlinking` → `Complete`).

### Phase 2: Live Workload Authoring with Floating IDE
1. Click **"Launch Floating IDE"** in the top navigation bar.
2. Select a pre-loaded template from the dropdown:
   - *Wildfire Thermal Anomaly Classifier*
   - *Maritime Dark Vessel AIS Correlator (SAR)*
   - *Agricultural Canopy NDVI & Drought Index*
   - *Oversized ResNet Workload (Stress Test)*: Demonstrates realistic RAM warnings when exceeding satellite memory caps!
3. Notice the real-time **Downlink Savings calculation** updating as you tweak input and output payload sizes.
4. Click **"Validate & Package Workload"**.

### Phase 3: Validation & Compatibility Analysis
1. The system automatically inspects the code:
   - Verifies flight-critical bus isolation (static security scan).
   - Generates the **Structured Validation Checklist**.
   - Evaluates compatibility across `OC-01`, `OC-02`, and `OC-03` with itemized reasoning (`✓ RAM: 420MB / 1024MB`, `✓ Sensor payload matched`).
2. Click **"Run Orbit Simulation"**.

### Phase 4: Deterministic Orbital Simulation
1. Select target coordinates (e.g. *Andhra Pradesh* or *Gulf of Aden*).
2. Choose spacecraft `OC-01`.
3. Click **"Execute Simulation"**:
   - Staged reveal displays computed hardware percentages: CPU %, RAM %, Power Draw %, and Downlink Savings.
4. Click **"Schedule Pass & Deploy to Orbit"**.

### Phase 5: Pass Scheduling & Live Mission Execution
1. Review the deterministic pass window (e.g. 4.5 minutes duration, 78° elevation).
2. Click **`[ DEPLOY TO ORBIT ]`**:
   - Observe the scripted staging sequence (*Packaging* → *Security verification* → *Ground station queue* → *Scheduled*).
3. The console opens the **Live Mission Operations Console**:
   - Watch the spacecraft icon animate along the ground track on the world map.
   - Observe the upcoming pathway rendered as a **distinct dotted/dashed line** and the past trail as a faded solid line.
   - As the spacecraft reaches target proximity, watch the pipeline transition live from `awaiting_pass` to `sensor_active` and `capturing`.
   - Once complete, the **Mission Result Card** unlocks with exact computed detection coordinates and confidence.

---

## 🧪 Running Automated Tests
```bash
cd backend
python -m pytest tests/ -v
```
All 7 test suites verify:
- Root & health check endpoints
- Satellites list & current coordinates
- Orbit tracker & antimeridian split logic
- Pre-seeded Wildfire mission state
- Static security pattern detection
- Deterministic simulation formulas
- Provider architectural seam swapping (`DhruvaProvider` `NotImplementedError` contract)
