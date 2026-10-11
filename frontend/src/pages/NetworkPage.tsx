import React from 'react';
import {
  Network,
  Wifi,
  Shield,
  Globe,
  Radio,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
} from 'lucide-react';
import { SystemSummary } from '../types/telemetry';
import { formatThroughput, formatBytes } from '../services/api';
import { Badge } from '../components/common/Badge';

interface NetworkPageProps {
  summary: SystemSummary | null;
}

export const NetworkPage: React.FC<NetworkPageProps> = ({ summary }) => {
  const net = summary?.network;
  const interfaces = net?.interfaces || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Network Interfaces &amp; Remote Access</h2>
            <p className="text-xs text-slate-400">
              Gigabit Ethernet, Wi-Fi 5, Tailscale Wireguard mesh, and Cloudflare Tunnel egress
            </p>
          </div>
        </div>
      </div>

      {/* Connectivity cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Local Network */}
        <div className="rounded-2xl p-5 bg-brand-card/90 border border-brand-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Local Subnet
            </span>
            <Badge variant="cyan" size="sm">
              LAN
            </Badge>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mb-1">
            {net?.local_ip || '192.168.1.150'}
          </div>
          <div className="text-xs text-slate-400 font-mono">Gateway: 192.168.1.1</div>
        </div>

        {/* Tailscale */}
        <div className="rounded-2xl p-5 bg-brand-card/90 border border-brand-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tailscale Mesh
            </span>
            <Badge variant={net?.tailscale_connected ? 'emerald' : 'slate'} size="sm">
              {net?.tailscale_connected ? 'CONNECTED' : 'STANDBY'}
            </Badge>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mb-1">
            {net?.tailscale_ip || '100.92.14.88'}
          </div>
          <div className="text-xs text-slate-400 font-mono">MagicDNS: vnavhomelab.tailnet</div>
        </div>

        {/* Cloudflare Tunnel */}
        <div className="rounded-2xl p-5 bg-brand-card/90 border border-brand-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cloudflare Tunnel
            </span>
            <Badge variant={net?.cloudflare_tunnel_active ? 'purple' : 'cyan'} size="sm">
              {net?.cloudflare_tunnel_active ? 'ACTIVE' : 'TUNNEL READY'}
            </Badge>
          </div>
          <div className="text-2xl font-bold text-purple-300 mb-1">cloudflared</div>
          <div className="text-xs text-slate-400 font-mono">Egress Zero-Trust Connector</div>
        </div>
      </div>

      {/* Interfaces list */}
      <div className="rounded-2xl border border-brand-border bg-brand-card/90 overflow-hidden shadow-card">
        <div className="p-5 border-b border-brand-border">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Network Adapter Configurations
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-brand-darkest/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Interface</th>
                <th className="py-3 px-4">IPv4 Address</th>
                <th className="py-3 px-4">Netmask</th>
                <th className="py-3 px-4">MAC Address</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {interfaces.map((iface, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100 font-sans">{iface.name}</td>
                  <td className="py-3 px-4 text-cyan-300 font-bold">{iface.ip || '—'}</td>
                  <td className="py-3 px-4 text-slate-400">{iface.netmask || '255.255.255.0'}</td>
                  <td className="py-3 px-4 text-slate-400">{iface.mac || 'b8:27:eb:d4:1a:09'}</td>
                  <td className="py-3 px-4 text-slate-300">
                    {iface.speed_mbps ? `${iface.speed_mbps} Mbps` : '1000 Mbps'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        iface.is_up
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${iface.is_up ? 'bg-emerald-400' : 'bg-slate-500'}`}
                      />
                      {iface.is_up ? 'UP' : 'DOWN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
