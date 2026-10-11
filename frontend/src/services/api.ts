import {
  SystemSummary,
  ServiceItem,
  ContainerItem,
  LogItem,
  HistoricalPoint,
} from '../types/telemetry';

const API_BASE = '/api';

export async function fetchSystemSummary(): Promise<SystemSummary> {
  const res = await fetch(`${API_BASE}/system/summary`);
  if (!res.ok) throw new Error('Failed to fetch system summary');
  return res.json();
}

export async function fetchHistory(limit: number = 60): Promise<HistoricalPoint[]> {
  const res = await fetch(`${API_BASE}/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch history metrics');
  return res.json();
}

export async function fetchServices(): Promise<ServiceItem[]> {
  const res = await fetch(`${API_BASE}/services`);
  if (!res.ok) throw new Error('Failed to fetch homelab services');
  return res.json();
}

export async function updateServiceUrl(id: string, url: string): Promise<any> {
  const res = await fetch(`${API_BASE}/services/${id}/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error('Failed to update service URL');
  return res.json();
}

export async function fetchContainers(): Promise<ContainerItem[]> {
  const res = await fetch(`${API_BASE}/containers`);
  if (!res.ok) throw new Error('Failed to fetch containers');
  return res.json();
}

export async function triggerContainerAction(
  containerId: string,
  action: 'start' | 'stop' | 'restart',
  apiKey: string = 'vnav-homelab-key-2026'
): Promise<any> {
  const res = await fetch(`${API_BASE}/containers/${containerId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, api_key: apiKey }),
  });
  if (!res.ok) throw new Error(`Failed to execute container action: ${action}`);
  return res.json();
}

export async function fetchLogs(
  limit: number = 50,
  severity?: string,
  search?: string,
  source?: string
): Promise<LogItem[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (severity && severity !== 'ALL') params.append('severity', severity);
  if (search) params.append('search', search);
  if (source && source !== 'all') params.append('source', source);

  const res = await fetch(`${API_BASE}/logs?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function runTerminalCommand(
  commandAlias?: string,
  customCommand?: string,
  apiKey: string = 'vnav-homelab-key-2026'
): Promise<{ stdout: string; stderr: string; exit_code: number }> {
  const res = await fetch(`${API_BASE}/terminal/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command_alias: commandAlias,
      custom_command: customCommand,
      api_key: apiKey,
    }),
  });
  if (!res.ok) throw new Error('Terminal command execution failed');
  return res.json();
}

export async function listFiles(path: string = ''): Promise<any> {
  const res = await fetch(`${API_BASE}/files/list?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('Failed to list files');
  return res.json();
}

export async function previewFile(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}/files/preview?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error('Failed to read file preview');
  return res.json();
}

export async function fetchSettings(): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settingsData: {
  sampling_interval?: number;
  simulation_mode?: boolean;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

// Utility formatting functions
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatThroughput(bytesPerSec: number): string {
  const bitsPerSec = bytesPerSec * 8;
  if (bitsPerSec < 1000) return `${Math.round(bitsPerSec)} bps`;
  if (bitsPerSec < 1000 * 1000) return `${(bitsPerSec / 1000).toFixed(1)} Kbps`;
  if (bitsPerSec < 1000 * 1000 * 1000) return `${(bitsPerSec / (1000 * 1000)).toFixed(2)} Mbps`;
  return `${(bitsPerSec / (1000 * 1000 * 1000)).toFixed(2)} Gbps`;
}
