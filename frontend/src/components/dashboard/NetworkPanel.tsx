import React from 'react';
import {
  Network,
  ArrowDownCircle,
  ArrowUpCircle,
  Wifi,
  Shield,
  Activity,
  Server,
  Globe,
} from 'lucide-react';
import { NetworkMetrics, HistoricalPoint } from '../../types/telemetry';
import { formatThroughput, formatBytes } from '../../services/api';
import { Sparkline } from '../common/Sparkline';
import { Badge } from '../common/Badge';

interface NetworkPanelProps {
  metrics: NetworkMetrics | undefined;
  history: HistoricalPoint[];
}

export const NetworkPanel: React.FC<NetworkPanelProps> = ({ metrics, history }) => {
  const rxFormatted = metrics ? formatThroughput(metrics.rx_bytes_sec) : 'Unavailable';
  const txFormatted = metrics ? formatThroughput(metrics.tx_bytes_sec) : 'Unavailable';

  const rxHistory = history.map((h) => h.network_rx_kb || 0);
  const txHistory = history.map((h) => h.network_tx_kb || 0);

  const primaryIf = metrics?.interfaces?.find((i) => i.is_up && i.ip) || metrics?.interfaces?.[0];

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-brand-card/90 backdrop-blur-md border border-brand-border shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-100 tracking-tight">
              Network Traffic
            </h3>
            <p className="text-xs text-slate-400">
              Interface throughput &amp; mesh gateways
            </p>
          </div>
        </div>

        {/* Tailscale / Tunnel Badges */}
        <div className="flex items-center gap-2">
          {metrics?.tailscale_connected ? (
            <Badge variant="emerald" size="sm" icon={<Wifi className="w-3 h-3" />}>
              Tailscale Connected
            </Badge>
          ) : (
            <Badge variant="slate" size="sm">
              Tailscale Standby
            </Badge>
          )}

          {metrics?.cloudflare_tunnel_active ? (
            <Badge variant="cyan" size="sm" icon={<Shield className="w-3 h-3" />}>
              Tunnel Active
            </Badge>
          ) : (
            <Badge variant="slate" size="sm">
              Tunnel Standby
            </Badge>
          )}
        </div>
      </div>

      {/* Throughput Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Download */}
        <div className="rounded-xl p-4 bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
              Download Rate
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              RX
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight mb-2">
            {rxFormatted}
          </div>
          <Sparkline
            data={rxHistory.slice(-25)}
            color="#34d399"
            gradientId="net-rx-spark"
            height={28}
          />
        </div>

        {/* Upload */}
        <div className="rounded-xl p-4 bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpCircle className="w-4 h-4 text-cyan-400" />
              Upload Rate
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
              TX
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight mb-2">
            {txFormatted}
          </div>
          <Sparkline
            data={txHistory.slice(-25)}
            color="#00f2fe"
            gradientId="net-tx-spark"
            height={28}
          />
        </div>
      </div>

      {/* Interface metadata bar */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Local IP:</span>
          <span className="text-slate-200 font-semibold">{metrics?.local_ip || '127.0.0.1'}</span>
        </div>

        {primaryIf && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">•</span>
            <span>Interface:</span>
            <span className="text-cyan-300 font-semibold">{primaryIf.name}</span>
            <span className="text-slate-500">({primaryIf.speed_mbps} Mbps)</span>
          </div>
        )}

        {metrics?.tailscale_ip && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500">•</span>
            <span>Tailscale:</span>
            <span className="text-emerald-300 font-semibold">{metrics.tailscale_ip}</span>
          </div>
        )}
      </div>
    </div>
  );
};
