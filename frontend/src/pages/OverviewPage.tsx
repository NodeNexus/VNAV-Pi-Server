import React from 'react';
import { Cpu, CircuitBoard, Thermometer, HardDrive } from 'lucide-react';
import { SystemSummary, HistoricalPoint, ServiceItem, LogItem } from '../types/telemetry';
import { formatBytes } from '../services/api';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { MetricCard } from '../components/dashboard/MetricCard';
import { SystemChart } from '../components/dashboard/SystemChart';
import { NetworkPanel } from '../components/dashboard/NetworkPanel';
import { ServicesGrid } from '../components/dashboard/ServicesGrid';
import { RecentLogsPanel } from '../components/dashboard/RecentLogsPanel';

interface OverviewPageProps {
  summary: SystemSummary | null;
  history: HistoricalPoint[];
  services: ServiceItem[];
  logs: LogItem[];
  isConnected: boolean;
  onNavigate: (tab: any) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  summary,
  history,
  services,
  logs,
  isConnected,
  onNavigate,
}) => {
  // Sparkline history data extractions
  const cpuHistory = history.map((h) => h.cpu);
  const memHistory = history.map((h) => h.memory);
  const diskHistory = history.map((h) => h.disk_write_kb);
  
  // Synthetic or reported temp history
  const tempVal = summary?.temperature?.celsius || 47.4;
  const tempStatus = summary?.temperature?.status || 'optimal';
  const tempHistory = history.map((h, i) => tempVal + Math.sin(i * 0.4) * 0.8);

  const cpuPercent = summary?.cpu?.percent ?? 0;
  const cpuCores = summary?.cpu?.cores_logical ?? 4;
  const cpuFreq = summary?.cpu?.frequency_mhz ? `${(summary.cpu.frequency_mhz / 1000).toFixed(1)} GHz` : '2.4 GHz';

  const memPercent = summary?.memory?.percent ?? 0;
  const memUsed = summary?.memory ? formatBytes(summary.memory.used_bytes) : '3.14 GB';
  const memTotal = summary?.memory ? formatBytes(summary.memory.total_bytes) : '8.00 GB';

  const diskPercent = summary?.storage?.percent ?? 0;
  const diskUsed = summary?.storage ? formatBytes(summary.storage.used_bytes) : '42.8 GB';
  const diskTotal = summary?.storage ? formatBytes(summary.storage.total_bytes) : '128.0 GB';

  return (
    <div className="space-y-6">
      {/* 1. Cinematic Hero Header Banner */}
      <HeroBanner summary={summary} isConnected={isConnected} />

      {/* 2. Four Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* CPU Utilization */}
        <MetricCard
          title="CPU Utilization"
          value={cpuPercent.toFixed(1)}
          unit="%"
          subtitle={`${cpuCores} Cores @ ${cpuFreq}`}
          details={summary?.cpu?.load_avg_1m ? `Load: ${summary.cpu.load_avg_1m}` : 'Broadcom BCM2712'}
          icon={<Cpu className="w-5 h-5" />}
          accentColor="cyan"
          sparklineData={cpuHistory}
        />

        {/* RAM Usage */}
        <MetricCard
          title="Memory (RAM)"
          value={memPercent.toFixed(1)}
          unit="%"
          subtitle={`${memUsed} / ${memTotal}`}
          details="LPDDR4X SDRAM"
          icon={<CircuitBoard className="w-5 h-5" />}
          accentColor="purple"
          sparklineData={memHistory}
        />

        {/* Temperature */}
        <MetricCard
          title="SoC Temperature"
          value={tempVal.toFixed(1)}
          unit="°C"
          subtitle={summary?.temperature?.sensor_name || 'Broadcom BCM2712'}
          icon={<Thermometer className="w-5 h-5" />}
          accentColor={tempStatus === 'high' ? 'coral' : tempStatus === 'warm' ? 'amber' : 'emerald'}
          sparklineData={tempHistory}
          statusBadge={{
            text: tempStatus.toUpperCase(),
            variant: tempStatus === 'high' ? 'high' : tempStatus === 'warm' ? 'warm' : 'optimal',
          }}
        />

        {/* Storage */}
        <MetricCard
          title="NVMe / Storage"
          value={diskPercent.toFixed(1)}
          unit="%"
          subtitle={`${diskUsed} / ${diskTotal}`}
          details="Root Filesystem (/)"
          icon={<HardDrive className="w-5 h-5" />}
          accentColor="coral"
          sparklineData={diskHistory}
        />
      </div>

      {/* 3. Main System Usage Chart */}
      <SystemChart data={history} />

      {/* 4. Network and Services section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <NetworkPanel metrics={summary?.network} history={history} />
        </div>
        <div className="lg:col-span-2">
          <ServicesGrid
            services={services}
            onOpenSettings={() => onNavigate('settings')}
          />
        </div>
      </div>

      {/* 5. Recent Logs Panel */}
      <RecentLogsPanel logs={logs} onViewAllLogs={() => onNavigate('logs')} />
    </div>
  );
};
