import datetime
from collections import deque
from typing import List, Optional
from app.schemas.telemetry import LogItem

class LogsService:
    def __init__(self, max_logs: int = 500):
        self._logs: deque = deque(maxlen=max_logs)
        self._init_default_logs()

    def _init_default_logs(self):
        now = datetime.datetime.now()
        samples = [
            ("INFO", "system", "vnavhomelab system initialized successfully (Linux aarch64)"),
            ("INFO", "network", "Interface eth0 link up at 1000 Mbps full duplex"),
            ("INFO", "docker", "Container portainer-ce started and passed health check"),
            ("INFO", "docker", "Container grafana started on port 3001"),
            ("INFO", "docker", "Container nodered started on port 1880"),
            ("INFO", "docker", "Container uptime-kuma started on port 3002"),
            ("INFO", "docker", "Container prometheus scraping local targets every 15s"),
            ("INFO", "docker", "Container postgres-homelab ready for incoming connections"),
            ("INFO", "docker", "Container minio-s3 initialized buckets and API endpoints"),
            ("INFO", "docker", "Container redis-cache active (maxmemory 512mb, lru policy)"),
            ("WARN", "thermal", "SoC thermal governor switched to active cooling fan curve at 48°C"),
            ("INFO", "tailscale", "Tailscale mesh node connected. Subnet routes established"),
            ("INFO", "tunnel", "Cloudflare tunnel route vnavhomelab active and verified"),
            ("INFO", "auth", "Admin session authenticated from 192.168.1.150"),
            ("INFO", "storage", "NVMe / SSD root partition healthy (42.8 GB / 128.0 GB used)"),
        ]

        for i, (sev, src, msg) in enumerate(samples):
            t = now - datetime.timedelta(minutes=(len(samples) - i) * 8)
            self._logs.append(
                LogItem(
                    id=f"log_{i}_{int(t.timestamp())}",
                    timestamp=t.strftime("%Y-%m-%d %H:%M:%S"),
                    severity=sev,
                    source=src,
                    message=msg
                )
            )

    def add_log(self, severity: str, source: str, message: str) -> LogItem:
        # Sanitize HTML tags to prevent XSS injection
        clean_msg = message.replace("<", "&lt;").replace(">", "&gt;")
        now = datetime.datetime.now()
        item = LogItem(
            id=f"log_{int(now.timestamp() * 1000)}",
            timestamp=now.strftime("%Y-%m-%d %H:%M:%S"),
            severity=severity.upper(),
            source=source,
            message=clean_msg
        )
        self._logs.appendleft(item)
        return item

    def get_logs(self, limit: int = 50, severity: Optional[str] = None, search: Optional[str] = None, source: Optional[str] = None) -> List[LogItem]:
        filtered = list(self._logs)
        if severity and severity.upper() != "ALL":
            filtered = [l for l in filtered if l.severity == severity.upper()]
        if source and source.lower() != "all":
            filtered = [l for l in filtered if l.source.lower() == source.lower()]
        if search:
            query = search.lower()
            filtered = [l for l in filtered if query in l.message.lower() or query in l.source.lower()]
        return filtered[:limit]

logs_service = LogsService()
