from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CpuMetrics(BaseModel):
    percent: float
    cores_logical: int
    cores_physical: Optional[int] = None
    frequency_mhz: Optional[float] = None
    per_cpu: List[float] = Field(default_factory=list)
    load_avg_1m: Optional[float] = None
    load_avg_5m: Optional[float] = None
    load_avg_15m: Optional[float] = None

class MemoryMetrics(BaseModel):
    total_bytes: int
    used_bytes: int
    free_bytes: int
    percent: float
    available_bytes: int
    cached_bytes: Optional[int] = 0
    buffers_bytes: Optional[int] = 0
    swap_total: Optional[int] = 0
    swap_used: Optional[int] = 0
    swap_percent: Optional[float] = 0.0

class TemperatureMetrics(BaseModel):
    celsius: Optional[float] = None
    status: str = "optimal"  # optimal (<60), warm (60-75), high (>75), unavailable
    sensor_name: str = "Broadcom BCM2712 / SoC"

class DiskMetrics(BaseModel):
    total_bytes: int
    used_bytes: int
    free_bytes: int
    percent: float
    mount_point: str = "/"
    read_bytes_sec: float = 0.0
    write_bytes_sec: float = 0.0

class NetworkInterface(BaseModel):
    name: str
    ip: Optional[str] = None
    netmask: Optional[str] = None
    mac: Optional[str] = None
    is_up: bool = True
    speed_mbps: Optional[int] = None
    rx_bytes: int = 0
    tx_bytes: int = 0

class NetworkMetrics(BaseModel):
    rx_bytes_sec: float = 0.0
    tx_bytes_sec: float = 0.0
    local_ip: str = "127.0.0.1"
    tailscale_connected: bool = False
    tailscale_ip: Optional[str] = None
    cloudflare_tunnel_active: bool = False
    interfaces: List[NetworkInterface] = Field(default_factory=list)

class SystemSummary(BaseModel):
    hostname: str
    os_name: str
    kernel: str
    arch: str
    uptime_seconds: float
    uptime_formatted: str
    server_time: str
    cpu: CpuMetrics
    memory: MemoryMetrics
    temperature: TemperatureMetrics
    storage: DiskMetrics
    network: NetworkMetrics
    services_online: int = 0
    services_total: int = 8
    containers_running: int = 0
    containers_total: int = 0

class ServiceItem(BaseModel):
    id: str
    name: str
    category: str
    icon: str
    port: int
    url: str
    description: str
    status: str = "unknown"  # running, stopped, unhealthy, unknown
    response_time_ms: Optional[float] = None
    last_checked: Optional[str] = None

class ContainerItem(BaseModel):
    id: str
    name: str
    image: str
    state: str  # running, exited, paused, restarting
    status: str
    created: str
    ports: List[str] = Field(default_factory=list)
    cpu_percent: Optional[float] = None
    memory_usage_mb: Optional[float] = None
    memory_limit_mb: Optional[float] = None

class LogItem(BaseModel):
    id: str
    timestamp: str
    severity: str  # INFO, WARN, ERROR, DEBUG
    source: str
    message: str

class HistoricalPoint(BaseModel):
    timestamp: str
    time_label: str
    cpu: float
    memory: float
    disk_read_kb: float = 0.0
    disk_write_kb: float = 0.0
    network_rx_kb: float = 0.0
    network_tx_kb: float = 0.0
