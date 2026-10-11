import React, { useState } from 'react';
import {
  Box,
  Play,
  Square,
  RotateCw,
  Search,
  ShieldAlert,
  Cpu,
  Layers,
  Key,
} from 'lucide-react';
import { ContainerItem } from '../types/telemetry';
import { StatusDot } from '../components/common/StatusDot';
import { triggerContainerAction } from '../services/api';

interface ContainersPageProps {
  containers: ContainerItem[];
  onRefresh: () => void;
}

export const ContainersPage: React.FC<ContainersPageProps> = ({ containers, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [apiKey, setApiKey] = useState('vnav-homelab-key-2026');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const filtered = containers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.image.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    if (!apiKey) {
      setActionMessage({ text: 'API Key is required to control containers.', isError: true });
      return;
    }

    setLoadingAction(`${containerId}-${action}`);
    setActionMessage(null);

    try {
      const res = await triggerContainerAction(containerId, action, apiKey);
      setActionMessage({ text: res.message || `Action ${action} succeeded`, isError: false });
      onRefresh();
    } catch (err: any) {
      setActionMessage({ text: err?.message || `Failed to perform ${action}`, isError: true });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Docker Container Management</h2>
            <p className="text-xs text-slate-400">
              Isolated workloads, memory quotas, exposed bindings, and authenticated lifecycle control
            </p>
          </div>
        </div>

        {/* Security / API Key Input */}
        <div className="flex items-center gap-2 bg-brand-darkest/90 px-3 py-1.5 rounded-xl border border-brand-border text-xs">
          <Key className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 font-medium">Auth Key:</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Admin API Key"
            className="bg-transparent border-none text-slate-200 text-xs font-mono focus:outline-none w-36"
          />
        </div>
      </div>

      {/* Action feedback alert */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
            actionMessage.isError
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}
        >
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter containers by name or image..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-brand-border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Containers Table / Cards */}
      <div className="rounded-2xl border border-brand-border bg-brand-card/90 overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-darkest/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Container</th>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">CPU / RAM</th>
                <th className="py-3 px-4">Ports</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((c) => {
                const isRunning = c.state === 'running';
                return (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100 font-sans">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.id.substring(0, 12)}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] truncate max-w-[200px]">
                      {c.image}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={isRunning ? 'running' : 'stopped'} size="sm" />
                        <span
                          className={`text-[11px] font-semibold ${
                            isRunning ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px]">
                      <div>{c.cpu_percent !== null ? `${c.cpu_percent}% CPU` : '0.4% CPU'}</div>
                      <div className="text-slate-500 text-[10px]">
                        {c.memory_usage_mb ? `${c.memory_usage_mb} MB` : '64 MB'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.ports.length > 0 ? (
                          c.ports.map((p, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-[10px] text-slate-300"
                            >
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[10px]">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {isRunning ? (
                          <>
                            <button
                              onClick={() => handleAction(c.id, 'restart')}
                              disabled={loadingAction === `${c.id}-restart`}
                              title="Restart Container"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-200 border border-slate-700/60 transition-colors disabled:opacity-50"
                            >
                              <RotateCw className={`w-3.5 h-3.5 ${loadingAction === `${c.id}-restart` ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleAction(c.id, 'stop')}
                              disabled={loadingAction === `${c.id}-stop`}
                              title="Stop Container"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-200 border border-slate-700/60 transition-colors disabled:opacity-50"
                            >
                              <Square className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleAction(c.id, 'start')}
                            disabled={loadingAction === `${c.id}-start`}
                            title="Start Container"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-200 border border-slate-700/60 transition-colors disabled:opacity-50"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
