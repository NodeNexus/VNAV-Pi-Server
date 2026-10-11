import time
import socket
import datetime
from concurrent.futures import ThreadPoolExecutor
from typing import List, Dict, Any, Optional
import requests

from app.core.config import settings
from app.schemas.telemetry import ServiceItem

class HealthCheckerService:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl_seconds: float = 8.0  # cache for 8 seconds to prevent excessive polling
        self._services_config = list(settings.DEFAULT_SERVICES)
        self.dev_simulation_mode: bool = False  # can be toggled via settings API

    def check_service(self, svc: Dict[str, Any]) -> ServiceItem:
        svc_id = svc["id"]
        now = time.time()

        # Check cache
        if svc_id in self._cache:
            entry = self._cache[svc_id]
            if now - entry["timestamp"] < self._cache_ttl_seconds:
                return entry["data"]

        port = svc.get("port")
        check_type = svc.get("check_type", "tcp")
        target_host = "127.0.0.1"
        status = "stopped"
        latency: Optional[float] = None

        start_t = time.perf_counter()

        if self.dev_simulation_mode:
            import random
            latency = round(random.uniform(4.2, 18.5), 1)
            status = "running"
        else:
            try:
                if check_type == "http":
                    path = svc.get("path", "/")
                    url = f"http://{target_host}:{port}{path}"
                    res = requests.get(url, timeout=0.6)
                    latency = round((time.perf_counter() - start_t) * 1000.0, 1)
                    if res.status_code < 400:
                        status = "running"
                    else:
                        status = "unhealthy"
                else:
                    # TCP socket check
                    with socket.create_connection((target_host, port), timeout=0.6):
                        latency = round((time.perf_counter() - start_t) * 1000.0, 1)
                        status = "running"
            except (socket.timeout, ConnectionRefusedError, OSError, requests.RequestException):
                latency = None
                status = "stopped"

        item = ServiceItem(
            id=svc["id"],
            name=svc["name"],
            category=svc["category"],
            icon=svc["icon"],
            port=svc["port"],
            url=svc["url"],
            description=svc["description"],
            status=status,
            response_time_ms=latency,
            last_checked=datetime.datetime.now().strftime("%H:%M:%S")
        )

        self._cache[svc_id] = {
            "timestamp": now,
            "data": item
        }
        return item

    def get_all_services(self) -> List[ServiceItem]:
        # Check all services in parallel using thread pool to make response instant
        with ThreadPoolExecutor(max_workers=8) as executor:
            results = list(executor.map(self.check_service, self._services_config))
        return results

    def update_service_url(self, svc_id: str, new_url: str):
        for svc in self._services_config:
            if svc["id"] == svc_id:
                svc["url"] = new_url
                if svc_id in self._cache:
                    del self._cache[svc_id]
                break

health_checker = HealthCheckerService()
