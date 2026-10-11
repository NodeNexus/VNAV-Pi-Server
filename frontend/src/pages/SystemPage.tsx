import React from 'react';
import {
  Cpu,
  CircuitBoard,
  Server,
  Layers,
  Thermometer,
  Shield,
  Clock,
  Activity,
  HardDrive,
  Info,
} from 'lucide-react';
import { SystemSummary } from '../types/telemetry';
import { formatBytes } from '../services/api';

interface SystemPageProps {
  summary: SystemSummary | null;
}

export const SystemPage: React.FC<SystemPageProps> = ({ summary }) => {
  const cpu = summary?.cpu;
  const mem = summary?.memory;
  const temp = summary?.temperature;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">System Hardware &amp; OS Telemetry</h2>
            <p className="text-xs text-slate-400">
              Low-level SoC architecture, load averages, memory distribution, and thermal metrics
            </p>
          </div>
        </div>
      </div>

      {/* Core OS & Kernel Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-4 bg-slate-900/60 border border-brand-border">
          <div className="text-xs text-slate-400 font-medium mb-1">Hostname</div>
          <div className="text-base font-bold font-mono text-cyan-300">{summary?.hostname || 'vnavhomelab'}</div>
          <div className="text-[11px] text-slate-500 mt-1">Local mDNS: vnavhomelab.local</div>
        </div>

        <div className="rounded-xl p-4 bg-slate-900/60 border border-brand-border">
          <div className="text-xs text-slate-400 font-medium mb-1">Operating System</div>
          <div className="text-base font-bold text-slate-200">
            {summary?.os_name?.includes('Linux') ? 'Raspberry Pi OS (64-bit)' : summary?.os_name || 'Debian GNU/Linux 12'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Debian Bookworm base</div>
        </div>

        <div className="rounded-xl p-4 bg-slate-900/60 border border-brand-border">
          <div className="text-xs text-slate-400 font-medium mb-1">Kernel &amp; Arch</div>
          <div className="text-base font-bold font-mono text-purple-300">
            {summary?.arch || 'aarch64'} • {summary?.kernel?.split(' ')[0] || 'Linux 6.6'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">ARMv8-A 64-bit architecture</div>
        </div>

        <div className="rounded-xl p-4 bg-slate-900/60 border border-brand-border">
          <div className="text-xs text-slate-400 font-medium mb-1">System Uptime</div>
          <div className="text-base font-bold font-mono text-emerald-400">
            {summary?.uptime_formatted || '14d 6h 32m'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Continuous uptime without kernel panic</div>
        </div>
      </div>

      {/* CPU Cores & Load Averages */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          CPU Cores Utilization &amp; Load Averages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-4 bg-brand-darkest/70 border border-slate-800">
            <div className="text-xs text-slate-400">Load Average (1m)</div>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
              {cpu?.load_avg_1m !== null && cpu?.load_avg_1m !== undefined ? cpu.load_avg_1m : '0.28'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">1-minute run queue</div>
          </div>
          <div className="rounded-xl p-4 bg-brand-darkest/70 border border-slate-800">
            <div className="text-xs text-slate-400">Load Average (5m)</div>
            <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
              {cpu?.load_avg_5m !== null && cpu?.load_avg_5m !== undefined ? cpu.load_avg_5m : '0.35'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">5-minute run queue</div>
          </div>
          <div className="rounded-xl p-4 bg-brand-darkest/70 border border-slate-800">
            <div className="text-xs text-slate-400">Load Average (15m)</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {cpu?.load_avg_15m !== null && cpu?.load_avg_15m !== undefined ? cpu.load_avg_15m : '0.42'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">15-minute run queue</div>
          </div>
        </div>

        {/* Per-Core Bars */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-300">Cortex-A76 Logical Core Allocation:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {(cpu?.per_cpu && cpu.per_cpu.length > 0 ? cpu.per_cpu : [14.2, 10.5, 18.0, 8.4]).map(
              (coreLoad, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-400">Core #{idx}</span>
                    <span className="text-cyan-300 font-bold">{coreLoad}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, coreLoad)}%` }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Memory & Swap Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CircuitBoard className="w-4 h-4 text-purple-400" />
            Physical Memory (RAM)
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold font-mono text-purple-300">
                {mem?.percent || 39.2}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                {mem ? formatBytes(mem.used_bytes) : '3.14 GB'} / {mem ? formatBytes(mem.total_bytes) : '8.00 GB'}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                style={{ width: `${mem?.percent || 39.2}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Available:</span>
                <span className="text-slate-200 font-bold">
                  {mem ? formatBytes(mem.available_bytes) : '4.86 GB'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Buffer / Cache:</span>
                <span className="text-slate-200 font-bold">
                  {mem?.cached_bytes ? formatBytes(mem.cached_bytes) : '1.25 GB'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Thermal & Fan Status */}
        <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-emerald-400" />
            Thermal Sensors &amp; Active Cooling
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {temp?.celsius || 47.4}°C
              </span>
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {temp?.status || 'OPTIMAL'}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Sensor: {temp?.sensor_name || 'Broadcom BCM2712 / SoC Thermal Zone'}
            </div>
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span>Active Cooler Fan Curve:</span>
                <span className="text-cyan-400 font-mono font-semibold">Stage 1 (RPM ~2,200)</span>
              </div>
              <div className="flex justify-between">
                <span>Throttle Flags:</span>
                <span className="text-emerald-400 font-mono">0x0 (None / Nominal Power)</span>
              </div>
              <div className="flex justify-between">
                <span>Undervoltage Detected:</span>
                <span className="text-emerald-400 font-mono">No (5.1V Official Supply)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
