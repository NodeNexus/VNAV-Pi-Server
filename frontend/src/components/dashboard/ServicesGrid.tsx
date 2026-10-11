import React from 'react';
import {
  ExternalLink,
  Layers,
  Box,
  Activity,
  GitFork,
  ShieldCheck,
  Cpu,
  Database,
  HardDrive,
  Zap,
} from 'lucide-react';
import { ServiceItem } from '../../types/telemetry';
import { StatusDot } from '../common/StatusDot';

interface ServicesGridProps {
  services: ServiceItem[];
  onOpenSettings?: () => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ services, onOpenSettings }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Box':
        return <Box className="w-4 h-4 text-cyan-400" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-purple-400" />;
      case 'GitFork':
        return <GitFork className="w-4 h-4 text-rose-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'Database':
        return <Database className="w-4 h-4 text-blue-400" />;
      case 'HardDrive':
        return <HardDrive className="w-4 h-4 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-rose-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-brand-card/90 backdrop-blur-md border border-brand-border shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-100 tracking-tight">
              Homelab Services
            </h3>
            <p className="text-xs text-slate-400">
              Live service status &amp; direct management endpoints
            </p>
          </div>
        </div>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Configure URLs →
          </button>
        )}
      </div>

      {/* Grid of 8 service cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {services.map((svc) => {
          const isRunning = svc.status === 'running';
          return (
            <div
              key={svc.id}
              className="group relative rounded-xl p-3.5 bg-slate-900/50 hover:bg-slate-800/50 border border-brand-border hover:border-cyan-500/30 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center">
                    {getIcon(svc.icon)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot
                      status={
                        isRunning
                          ? 'running'
                          : svc.status === 'unhealthy'
                          ? 'unhealthy'
                          : 'stopped'
                      }
                      size="sm"
                    />
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase ${
                        isRunning
                          ? 'text-emerald-400'
                          : svc.status === 'unhealthy'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {svc.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                  {svc.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {svc.description}
                </div>
              </div>

              {/* Bottom bar: latency / port and open link */}
              <div className="mt-3 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">
                  {svc.response_time_ms !== null && svc.response_time_ms !== undefined ? (
                    <span className="text-emerald-400 font-semibold">
                      {svc.response_time_ms}ms
                    </span>
                  ) : (
                    <span>Port :{svc.port}</span>
                  )}
                </span>

                {svc.url ? (
                  <a
                    href={svc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-200 transition-colors"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-slate-500">Internal</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
