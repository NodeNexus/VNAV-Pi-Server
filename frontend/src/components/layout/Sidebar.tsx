import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Layers,
  Box,
  HardDrive,
  FileText,
  Network,
  Terminal,
  FolderOpen,
  Settings,
  CircleCheck,
  Server,
  Microchip,
} from 'lucide-react';
import { NavItemKey, SystemSummary } from '../../types/telemetry';
import { formatBytes } from '../../services/api';

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  summary: SystemSummary | null;
  isConnected: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  summary,
  isConnected,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: { key: NavItemKey; label: string; icon: React.ReactNode; badge?: string }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'system', label: 'System', icon: <Cpu className="w-4 h-4" /> },
    {
      key: 'services',
      label: 'Services',
      icon: <Layers className="w-4 h-4" />,
      badge: summary ? `${summary.services_online}/${summary.services_total}` : '8/8',
    },
    {
      key: 'containers',
      label: 'Containers',
      icon: <Box className="w-4 h-4" />,
      badge: summary ? `${summary.containers_running}` : '8',
    },
    { key: 'storage', label: 'Storage', icon: <HardDrive className="w-4 h-4" /> },
    { key: 'logs', label: 'Logs', icon: <FileText className="w-4 h-4" /> },
    { key: 'network', label: 'Network', icon: <Network className="w-4 h-4" /> },
    { key: 'terminal', label: 'Terminal', icon: <Terminal className="w-4 h-4" /> },
    { key: 'files', label: 'File Manager', icon: <FolderOpen className="w-4 h-4" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const memPercent = summary?.memory?.percent || 0;
  const availMem = summary?.memory ? formatBytes(summary.memory.available_bytes) : '4.8 GB';
  const totalMem = summary?.memory ? formatBytes(summary.memory.total_bytes) : '8.0 GB';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-brand-base/95 backdrop-blur-xl border-r border-brand-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-brand-border/80">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 via-rose-600/10 to-transparent border border-rose-500/30 flex items-center justify-center p-1.5 shadow-sm">
              <img
                src="/rpi-logo.svg"
                alt="Raspberry Pi"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight truncate">
                  vnavhomelab
                </h1>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500'
                  }`}
                />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {isConnected ? 'ONLINE' : 'OFFLINE'}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">• Pi 5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Control Center
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hardware Status Footer */}
        <div className="p-4 border-t border-brand-border/80 bg-brand-darkest/60">
          <div className="rounded-xl bg-brand-card/90 border border-brand-border p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Microchip className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Raspberry Pi 5</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                ARM64
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Broadcom BCM2712</span>
              <span className="font-mono text-slate-300">2.4 GHz</span>
            </div>

            {/* RAM Meter */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] font-medium text-slate-400">
                <span>Memory Available</span>
                <span className="font-mono text-slate-300">
                  {availMem} / {totalMem}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${memPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
