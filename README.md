# vnavhomelab — Raspberry Pi 5 Real-Time Control Center

A production-grade, self-hosted Raspberry Pi monitoring and management dashboard designed with a cinematic dark-mode interface, real-time hardware telemetry streaming via WebSockets, and secure homelab service controls.

---

## 📸 System Architecture & Overview

```
                      ┌───────────────────────────────────────────────┐
                      │              vnavhomelab Web UI               │
                      │   React 18 + Vite + Tailwind + Lucide React    │
                      └───────────────────────┬───────────────────────┘
                                              │ (HTTP & WebSocket /ws)
                                              ▼
                      ┌───────────────────────────────────────────────┐
                      │         FastAPI Real-Time Telemetry           │
                      │          Uvicorn Daemon (Port 8000)           │
                      └───────┬───────────────┬───────────────┬───────┘
                              │               │               │
                              ▼               ▼               ▼
                 ┌──────────────────┐ ┌───────────────┐ ┌────────────────┐
                 │  Hardware Sensor │ │ Docker Socket │ │ Homelab Mesh   │
                 │ psutil / thermal │ │ (Read-only ro)│ │ Tailscale / CF │
                 └──────────────────┘ └───────────────┘ └────────────────┘
```

---

## ✨ Features Implemented

### 1. Application Shell & Visual Aesthetics
- **Cinematic Dark Theme**: Near-black (`#070a12`, `#0b0f19`) and deep navy background layers with subtle blue-grey borders (`#1e2942`) and selective glassmorphism.
- **Accents**: Neon Cyan (`#00f2fe`), Emerald Green (`#10b981`), Purple (`#a855f7`), Blue (`#3b82f6`), and Coral (`#f43f5e`).
- **Sidebar**: Fixed desktop navigation with live online/offline indicator, Raspberry Pi 5 hardware specifications, and live memory meter.
- **Cinematic Dusk Banner**: High-resolution dusk mountain backdrop, live system uptime badge, local IP badge, Tailscale status badge, and second-by-second live clock.

### 2. Live Metric Cards & Sparklines
- **CPU Utilization**: Live percentage, Cortex-A76 quad-core frequency (2.4 GHz), load average, and mini SVG sparkline.
- **RAM Allocation**: Live memory percentage, used/total capacity, and smooth purple sparkline.
- **SoC Temperature**: Real-time Broadcom BCM2712 thermal readings in Celsius, color-coded status badges (`OPTIMAL`, `WARM`, `HIGH`), and emerald sparkline.
- **NVMe Storage**: Mounted root filesystem capacity and read/write throughput rates.

### 3. Interactive Charts & Real-time Panels
- **System Usage Area Chart**: Multi-series area chart plotting CPU %, RAM %, and Disk I/O with interactive series toggles and time-range filters (15m, 1h, 24h).
- **Network Traffic Panel**: Calculated RX download and TX upload throughput counters with dynamic unit scaling (Kbps, Mbps, MB/s) and interface details.
- **Homelab Services Grid**: Status probes and response latency (ms) for Portainer, Grafana, Node-RED, Uptime Kuma, Prometheus, PostgreSQL, MinIO, and Redis.
- **Recent Events Panel**: Monospace audit event log with severity pills and source classification.

### 4. Dedicated Functional Sub-pages
- **System Telemetry**: Per-core Cortex-A76 allocation, 1m/5m/15m load averages, physical RAM distribution, swap status, and thermal fan curves.
- **Services Directory**: Searchable microservice catalog with category filtering and inline URL configuration.
- **Containers Management**: Docker container catalog with image versions, uptime, CPU/memory usage, and authenticated `start`, `stop`, and `restart` actions.
- **Block Storage**: Partition mount points (`/`, `/boot/firmware`, `/mnt/storage`), filesystem formats (ext4, vfat), and I/O rates.
- **Logs Explorer**: Full-screen log viewer with severity filtering (`ALL`, `INFO`, `WARN`, `ERROR`), source filtering, keyword search, and text export.
- **Network Interfaces**: IPv4 configuration, MAC addresses, link speeds, Tailscale status, and Cloudflare Tunnel detection.
- **Diagnostic Terminal**: Whitelisted safe diagnostic command shell (`uname -a`, `vcgencmd measure_temp`, `uptime`, `df -h`, `free -h`, `docker ps`, `ip -br a`) protected by bearer token.
- **Secured File Browser**: Path-traversal protected directory explorer constrained to permitted homelab boundaries with safe file preview.
- **Settings**: Dynamic telemetry sampling interval adjustments (0.5s–5.0s), simulation mode toggles, and token configuration.

---

## 🚀 Local Development & Testing (Step 1)

### Prerequisites
- Node.js 18+ (tested with v24.18)
- Python 3.10+ (tested with v3.13)
- Windows / Linux / macOS

### 1. Start Backend (Terminal 1)
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Start Frontend (Terminal 2)
```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```
Open your browser at `http://localhost:3000`.

---

## 🔒 Security Architecture

1. **Authentication**: State-changing endpoints (`/api/containers/{id}/action`, `/api/terminal/run`) require `x-api-key` or JSON body token matching `ADMIN_API_KEY`.
2. **Path Traversal Protection**: File manager operations are strictly validated using `os.path.commonpath` against `ALLOWED_ROOT_PATH`.
3. **Command Sanitization**: Terminal operations forbid shell metacharacters (`;`, `&`, `|`, `>`) and enforce a whitelist of non-destructive diagnostic utilities.
4. **Read-Only Docker Socket**: Host Docker engine integration mounts `/var/run/docker.sock` in read-only mode (`:ro`) exclusively inside the backend container.
5. **No Secret Leakage**: Database passwords, MinIO access keys, and Cloudflare tokens are never retrieved or stored by the dashboard.

---

## 🍓 Raspberry Pi 5 Production Deployment (Step 2 Preview)

> **Important**: As instructed, do not execute these steps until ready to begin Step 2.

### Docker Compose Architecture
The `deploy/docker-compose.yml` file is configured with non-conflicting ports:
- **Dashboard Web UI**: Port `3050` (maps to internal Nginx:80)
- **Backend API**: Port `8000` (internal bridge network)
- **Hardware Telemetry**: Read-only mounts for `/sys/class/thermal` and `/proc`.

### Running on Raspberry Pi 5
```bash
# 1. Transfer dashboard repository to Raspberry Pi 5
cd ~/vnavhomelab-dashboard/deploy

# 2. Configure environment
cp ../.env.example ../.env

# 3. Launch Docker Compose stack
docker compose up -d --build
```
The dashboard will be accessible at:
- Local LAN: `http://vnavhomelab.local:3050`
- Tailscale: `http://100.x.y.z:3050`
- Existing Cloudflare Tunnel (optional public hostname routing via zero-trust dashboard to `http://localhost:3050`).
