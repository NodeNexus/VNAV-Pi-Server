import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  ShieldAlert,
  AlertTriangle,
  Info,
  Terminal,
} from 'lucide-react';
import { LogItem } from '../types/telemetry';
import { fetchLogs } from '../services/api';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('ALL');
  const [source, setSource] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLogs(100, severity, search, source);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [severity, source]);

  const handleDownload = () => {
    const textContent = logs
      .map((l) => `[${l.timestamp}] [${l.severity}] [${l.source}] ${l.message}`)
      .join('\n');
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vnavhomelab-logs-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <ShieldAlert className="w-2.5 h-2.5" />
            ERROR
          </span>
        );
      case 'WARN':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-2.5 h-2.5" />
            WARN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Info className="w-2.5 h-2.5" />
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Live System &amp; Docker Logs</h2>
            <p className="text-xs text-slate-400">
              Structured audit events, container logs, thermal events, and daemon traces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Logs</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
            placeholder="Search log messages or filter by keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-brand-border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Severity selection */}
        <div className="flex items-center bg-brand-darkest rounded-xl p-0.5 border border-brand-border text-xs font-medium">
          {['ALL', 'INFO', 'WARN', 'ERROR'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                severity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Source selection */}
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-brand-border text-xs text-slate-300 focus:outline-none font-mono"
        >
          <option value="all">All Sources</option>
          <option value="docker">Docker</option>
          <option value="system">System</option>
          <option value="network">Network</option>
          <option value="auth">Auth</option>
          <option value="thermal">Thermal</option>
        </select>
      </div>

      {/* Log Terminal Window */}
      <div className="rounded-2xl border border-brand-border bg-brand-darkest shadow-2xl overflow-hidden">
        <div className="p-3 bg-slate-900/70 border-b border-brand-border flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-slate-400 ml-2">journald &amp; container stream</span>
          </div>
          <span className="text-slate-500">{logs.length} events logged</span>
        </div>

        <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto font-mono text-xs select-text">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2 rounded-lg bg-slate-950/60 border border-slate-900 hover:border-slate-800 transition-colors flex items-start gap-3"
            >
              <div className="shrink-0">{getSeverityBadge(log.severity)}</div>
              <div className="text-[11px] text-slate-500 shrink-0">{log.timestamp}</div>
              <div className="text-[11px] font-semibold text-cyan-400/90 shrink-0">
                [{log.source}]
              </div>
              <div className="text-slate-200 break-all leading-relaxed flex-1 select-text">
                {log.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
