import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  Server,
  Globe,
  Radio,
  Wifi,
  Calendar,
  Layers,
} from 'lucide-react';
import { SystemSummary } from '../../types/telemetry';
import { Badge } from '../common/Badge';

interface HeroBannerProps {
  summary: SystemSummary | null;
  isConnected: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ summary, isConnected }) => {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '',
    time: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime({
        date: now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const uptime = summary?.uptime_formatted || '14d 6h 32m';
  const localIp = summary?.network?.local_ip || '192.168.1.150';
  const hostname = summary?.hostname || 'vnavhomelab';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-brand-border shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950">
      {/* Background Image with Fallback Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: "url('/mountain-dusk.jpg')",
        }}
      />

      {/* Dark overlay with cinematic gradients to ensure supreme text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-darkest via-brand-base/80 to-slate-950/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-darkest/95 via-brand-darkest/75 to-transparent" />
      <div className="absolute inset-0 bg-cyan-950/15 mix-blend-overlay" />

      {/* Content Container */}
      <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col justify-between min-h-[220px] md:min-h-[260px]">
        {/* Top Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Badge */}
            <Badge
              variant={isConnected ? 'emerald' : 'rose'}
              icon={<span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />}
            >
              {isConnected ? 'ONLINE' : 'DISCONNECTED'}
            </Badge>

            {/* System Uptime Badge */}
            <Badge
              variant="cyan"
              icon={<Clock className="w-3.5 h-3.5" />}
            >
              Uptime: {uptime}
            </Badge>

            {/* Local IP Badge */}
            <Badge
              variant="purple"
              icon={<Globe className="w-3.5 h-3.5" />}
            >
              IP: {localIp}
            </Badge>

            {/* Tailscale Badge */}
            {summary?.network?.tailscale_connected && (
              <Badge variant="emerald" icon={<Wifi className="w-3.5 h-3.5" />}>
                Tailscale {summary.network.tailscale_ip || 'Mesh'}
              </Badge>
            )}
          </div>

          {/* Live Date & Time Counter */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700/50 backdrop-blur-md text-xs font-mono text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">{currentDateTime.date}</span>
            <span className="text-slate-500">•</span>
            <span className="font-bold text-cyan-300 tracking-wider">{currentDateTime.time}</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="mt-8 md:mt-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight drop-shadow-sm font-sans">
              {hostname}
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wider rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Pi 5
            </span>
          </div>
          <p className="text-sm md:text-base font-medium text-slate-300 flex items-center gap-2">
            <span className="text-cyan-400 font-semibold">Raspberry Pi 5</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Home Server</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Always On
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
