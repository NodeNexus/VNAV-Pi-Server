import os
import platform
from typing import List, Dict, Any

class Settings:
    PROJECT_NAME: str = "vnavhomelab"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOSTNAME: str = os.getenv("HOMELAB_HOSTNAME", "vnavhomelab")
    SAMPLING_INTERVAL_SECONDS: float = float(os.getenv("SAMPLING_INTERVAL", "2.0"))
    RING_BUFFER_SIZE: int = int(os.getenv("RING_BUFFER_SIZE", "120"))
    IS_LINUX: bool = platform.system() == "Linux"
    ALLOWED_ORIGINS: List[str] = ["*"]
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "vnav-homelab-key-2026")
    ALLOWED_ROOT_PATH: str = os.getenv("ALLOWED_ROOT_PATH", os.path.abspath("."))

    # Homelab Services definition
    DEFAULT_SERVICES: List[Dict[str, Any]] = [
        {
            "id": "portainer",
            "name": "Portainer",
            "category": "Management",
            "icon": "Box",
            "port": 9000,
            "url": "http://100.92.50.31:9000",
            "description": "Container Management Platform",
            "check_type": "tcp",
        },
        {
            "id": "grafana",
            "name": "Grafana",
            "category": "Observability",
            "icon": "Activity",
            "port": 3001,
            "url": "http://100.92.50.31:3001",
            "description": "Metrics Visualization & Dashboards",
            "check_type": "http",
            "path": "/api/health"
        },
        {
            "id": "nodered",
            "name": "Node-RED",
            "category": "Automation",
            "icon": "GitFork",
            "port": 1880,
            "url": "http://100.92.50.31:1880",
            "description": "Flow-based IoT Automation",
            "check_type": "http",
            "path": "/"
        },
        {
            "id": "uptimekuma",
            "name": "Uptime Kuma",
            "category": "Monitoring",
            "icon": "ShieldCheck",
            "port": 3002,
            "url": "http://100.92.50.31:3002",
            "description": "Self-hosted Uptime Monitor",
            "check_type": "http",
            "path": "/"
        },
        {
            "id": "prometheus",
            "name": "Prometheus",
            "category": "Observability",
            "icon": "Cpu",
            "port": 9090,
            "url": "http://100.92.50.31:9090",
            "description": "Time-Series Telemetry Database",
            "check_type": "http",
            "path": "/-/healthy"
        },
        {
            "id": "postgres",
            "name": "PostgreSQL",
            "category": "Database",
            "icon": "Database",
            "port": 5432,
            "url": "",
            "description": "Primary Relational Database",
            "check_type": "tcp",
        },
        {
            "id": "minio",
            "name": "MinIO",
            "category": "Storage",
            "icon": "HardDrive",
            "port": 9001,
            "url": "http://100.92.50.31:9001",
            "description": "S3-Compatible Object Store",
            "check_type": "http",
            "path": "/minio/health/live"
        },
        {
            "id": "redis",
            "name": "Redis",
            "category": "Cache",
            "icon": "Zap",
            "port": 6379,
            "url": "",
            "description": "High-Performance In-Memory Cache",
            "check_type": "tcp",
        }
    ]

settings = Settings()
