import os
import datetime
from typing import List, Dict, Any, Optional
from app.schemas.telemetry import ContainerItem

class DockerService:
    def __init__(self):
        self.is_connected = False
        self._mock_mode = True  # Used when docker daemon is not available locally
        self._simulated_containers: List[Dict[str, Any]] = [
            {
                "id": "c1a93f01b234",
                "name": "portainer-ce",
                "image": "portainer/portainer-ce:latest",
                "state": "running",
                "status": "Up 14 days (healthy)",
                "created": "2026-09-27T10:00:00Z",
                "ports": ["9000:9000", "9443:9443"],
                "cpu_percent": 0.4,
                "memory_usage_mb": 45.2,
                "memory_limit_mb": 8192.0
            },
            {
                "id": "d8e20f14a567",
                "name": "grafana",
                "image": "grafana/grafana:latest",
                "state": "running",
                "status": "Up 14 days",
                "created": "2026-09-27T10:02:00Z",
                "ports": ["3001:3000"],
                "cpu_percent": 1.2,
                "memory_usage_mb": 112.5,
                "memory_limit_mb": 8192.0
            },
            {
                "id": "e4b31a89c789",
                "name": "nodered",
                "image": "nodered/node-red:latest",
                "state": "running",
                "status": "Up 14 days",
                "created": "2026-09-27T10:03:00Z",
                "ports": ["1880:1880"],
                "cpu_percent": 0.8,
                "memory_usage_mb": 88.0,
                "memory_limit_mb": 8192.0
            },
            {
                "id": "f5c42b90d890",
                "name": "uptime-kuma",
                "image": "louislam/uptime-kuma:1",
                "state": "running",
                "status": "Up 14 days (healthy)",
                "created": "2026-09-27T10:04:00Z",
                "ports": ["3002:3001"],
                "cpu_percent": 0.5,
                "memory_usage_mb": 64.1,
                "memory_limit_mb": 8192.0
            },
            {
                "id": "a6d53c01e901",
                "name": "prometheus",
                "image": "prom/prometheus:latest",
                "state": "running",
                "status": "Up 14 days",
                "created": "2026-09-27T10:05:00Z",
                "ports": ["9090:9090"],
                "cpu_percent": 1.5,
                "memory_usage_mb": 195.4,
                "memory_limit_mb": 8192.0
            },
            {
                "id": "b7e64d12f012",
                "name": "postgres-homelab",
                "image": "postgres:16-alpine",
                "state": "running",
                "status": "Up 14 days (healthy)",
                "created": "2026-09-27T10:06:00Z",
                "ports": ["5432:5432"],
                "cpu_percent": 0.3,
                "memory_usage_mb": 74.8,
                "memory_limit_mb": 8192.0
            },
            {
                "id": "c8f75e23a123",
                "name": "minio-s3",
                "image": "minio/minio:latest",
                "state": "running",
                "status": "Up 14 days (healthy)",
                "created": "2026-09-27T10:07:00Z",
                "ports": ["9000:9000", "9001:9001"],
                "cpu_percent": 0.6,
                "memory_usage_mb": 96.2,
                "memory_limit_mb": 8192.0
            },
            {
                "id": "d9a86f34b234",
                "name": "redis-cache",
                "image": "redis:7-alpine",
                "state": "running",
                "status": "Up 14 days",
                "created": "2026-09-27T10:08:00Z",
                "ports": ["6379:6379"],
                "cpu_percent": 0.2,
                "memory_usage_mb": 22.4,
                "memory_limit_mb": 8192.0
            }
        ]

    def check_connection(self) -> bool:
        # Check standard Linux unix socket or env
        if os.path.exists("/var/run/docker.sock"):
            try:
                import socket
                s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                s.connect("/var/run/docker.sock")
                s.close()
                self.is_connected = True
                return True
            except Exception:
                pass
        self.is_connected = False
        return False

    def list_containers(self) -> List[ContainerItem]:
        # Return containers
        items = []
        for c in self._simulated_containers:
            items.append(ContainerItem(**c))
        return items

    def restart_container(self, container_id: str) -> Dict[str, Any]:
        for c in self._simulated_containers:
            if c["id"] == container_id or c["name"] == container_id:
                c["state"] = "running"
                c["status"] = "Restarted just now (Up 1s)"
                return {"success": True, "message": f"Container {c['name']} restarted successfully"}
        return {"success": False, "message": f"Container {container_id} not found"}

    def stop_container(self, container_id: str) -> Dict[str, Any]:
        for c in self._simulated_containers:
            if c["id"] == container_id or c["name"] == container_id:
                c["state"] = "exited"
                c["status"] = "Exited (0) just now"
                return {"success": True, "message": f"Container {c['name']} stopped"}
        return {"success": False, "message": f"Container {container_id} not found"}

    def start_container(self, container_id: str) -> Dict[str, Any]:
        for c in self._simulated_containers:
            if c["id"] == container_id or c["name"] == container_id:
                c["state"] = "running"
                c["status"] = "Up 2 seconds"
                return {"success": True, "message": f"Container {c['name']} started"}
        return {"success": False, "message": f"Container {container_id} not found"}

docker_service = DockerService()
