export interface CpuMetrics {
  percent: number;
  cores_logical: number;
  cores_physical?: number;
  frequency_mhz?: number;
  per_cpu: number[];
  load_avg_1m?: number;
  load_avg_5m?: number;
  load_avg_15m?: number;
}

export interface MemoryMetrics {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  percent: number;
  available_bytes: number;
  cached_bytes?: number;
  buffers_bytes?: number;
  swap_total?: number;
  swap_used?: number;
  swap_percent?: number;
}

export interface TemperatureMetrics {
  celsius: number | null;
  status: 'optimal' | 'warm' | 'high' | 'unavailable';
  sensor_name: string;
}

export interface DiskMetrics {
  total_bytes: number;
  used_bytes: number;
  free_bytes: number;
  percent: number;
  mount_point: string;
  read_bytes_sec: number;
  write_bytes_sec: number;
}

export interface NetworkInterface {
  name: string;
  ip?: string;
  netmask?: string;
  mac?: string;
  is_up: boolean;
  speed_mbps?: number;
  rx_bytes: number;
  tx_bytes: number;
}

export interface NetworkMetrics {
  rx_bytes_sec: number;
  tx_bytes_sec: number;
  local_ip: string;
  tailscale_connected: boolean;
  tailscale_ip?: string | null;
  cloudflare_tunnel_active: boolean;
  interfaces: NetworkInterface[];
}

export interface SystemSummary {
  hostname: string;
  os_name: string;
  kernel: string;
  arch: string;
  uptime_seconds: number;
  uptime_formatted: string;
  server_time: string;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  temperature: TemperatureMetrics;
  storage: DiskMetrics;
  network: NetworkMetrics;
  services_online: number;
  services_total: number;
  containers_running: number;
  containers_total: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  port: number;
  url: string;
  description: string;
  status: 'running' | 'stopped' | 'unhealthy' | 'unknown';
  response_time_ms?: number | null;
  last_checked?: string;
}

export interface ContainerItem {
  id: string;
  name: string;
  image: string;
  state: 'running' | 'exited' | 'paused' | 'restarting';
  status: string;
  created: string;
  ports: string[];
  cpu_percent?: number | null;
  memory_usage_mb?: number | null;
  memory_limit_mb?: number | null;
}

export interface LogItem {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  source: string;
  message: string;
}

export interface HistoricalPoint {
  timestamp: string;
  time_label: string;
  cpu: number;
  memory: number;
  disk_read_kb: number;
  disk_write_kb: number;
  network_rx_kb: number;
  network_tx_kb: number;
}

export type NavItemKey =
  | 'overview'
  | 'system'
  | 'services'
  | 'containers'
  | 'storage'
  | 'logs'
  | 'network'
  | 'terminal'
  | 'files'
  | 'settings';
