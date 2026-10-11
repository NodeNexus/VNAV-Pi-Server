import React, { useState, useEffect } from 'react';
import { Menu, RefreshCw, Shield, Bell, Wifi, Activity } from 'lucide-react';
import { SystemSummary } from '../../types/telemetry';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  activeTitle: string;
  summary: SystemSummary | null;
  isConnected: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  activeTitle,
  summary,
  isConnected,
  onRefresh,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 bg-brand-darkest/80 backdrop-blur-xl border-b border-brand-border px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold hidden sm:inline">
            HOMELAB /
          </span>
          <h2 className="text-sm font-semibold text-slate-100 capitalize">{activeTitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/60 border border-brand-border text-xs font-mono text-cyan-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{timeStr}</span>
        </div>

        {/* Tailscale / Tunnel indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-medium text-emerald-400">
          <Wifi className="w-3 h-3" />
          <span>Mesh Active</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          title="Refresh telemetry"
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 border border-transparent hover:border-cyan-500/30 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
