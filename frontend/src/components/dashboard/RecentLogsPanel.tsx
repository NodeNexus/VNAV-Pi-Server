import React from 'react';
import { FileText, ArrowRight, ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { LogItem } from '../../types/telemetry';

interface RecentLogsPanelProps {
  logs: LogItem[];
  onViewAllLogs: () => void;
}

export const RecentLogsPanel: React.FC<RecentLogsPanelProps> = ({ logs, onViewAllLogs }) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-2.5 h-2.5" />
            ERR
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-2.5 h-2.5" />
            WRN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Info className="w-2.5 h-2.5" />
            INF
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-brand-card/90 backdrop-blur-md border border-brand-border shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-100 tracking-tight">
              Recent System Events
            </h3>
            <p className="text-xs text-slate-400">
              Live daemon telemetry &amp; security logs
            </p>
          </div>
        </div>

        <button
          onClick={onViewAllLogs}
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Log list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">
            No system log events recorded yet.
          </div>
        ) : (
          logs.slice(0, 8).map((log) => (
            <div
              key={log.id}
              className="rounded-lg p-2.5 bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-xs font-mono transition-colors hover:bg-slate-800/50"
            >
              <div className="shrink-0 mt-0.5">{getSeverityBadge(log.severity)}</div>
              <div className="shrink-0 text-[11px] text-slate-500">
                {log.timestamp.split(' ')[1] || log.timestamp}
              </div>
              <div className="shrink-0 text-[11px] text-slate-400 font-semibold px-1 rounded bg-slate-800 border border-slate-700/50">
                [{log.source}]
              </div>
              <div className="flex-1 text-slate-300 text-xs break-all leading-relaxed select-text">
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
