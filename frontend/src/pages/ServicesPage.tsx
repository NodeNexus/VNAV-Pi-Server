import React, { useState } from 'react';
import {
  Layers,
  Search,
  ExternalLink,
  Edit2,
  Check,
  X,
  RefreshCw,
  Box,
  Activity,
  GitFork,
  ShieldCheck,
  Cpu,
  Database,
  HardDrive,
  Zap,
} from 'lucide-react';
import { ServiceItem } from '../types/telemetry';
import { StatusDot } from '../components/common/StatusDot';
import { updateServiceUrl } from '../services/api';

interface ServicesPageProps {
  services: ServiceItem[];
  onRefresh: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrlValue, setEditUrlValue] = useState<string>('');

  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category)))];

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleStartEdit = (s: ServiceItem) => {
    setEditingId(s.id);
    setEditUrlValue(s.url);
  };

  const handleSaveEdit = async (s: ServiceItem) => {
    try {
      await updateServiceUrl(s.id, editUrlValue);
      setEditingId(null);
      onRefresh();
    } catch (e) {
      alert('Failed to update URL');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Homelab Services Directory</h2>
            <p className="text-xs text-slate-400">
              Active microservices, internal TCP sockets, HTTP health probes, and endpoints
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check Health Now</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service by name, port, or description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-brand-border text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((svc) => (
          <div
            key={svc.id}
            className="rounded-2xl p-5 bg-brand-card/90 border border-brand-border flex flex-col justify-between hover:border-purple-500/30 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                  {svc.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusDot status={svc.status === 'running' ? 'running' : 'stopped'} size="sm" />
                  <span
                    className={`text-[11px] font-mono font-bold uppercase ${
                      svc.status === 'running' ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {svc.status}
                  </span>
                </div>
              </div>

              <h4 className="text-base font-bold text-slate-100 mb-1">{svc.name}</h4>
              <p className="text-xs text-slate-400 mb-3">{svc.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Port / Socket:</span>
                <span className="text-slate-200">:{svc.port}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Latency:</span>
                <span className="text-emerald-400 font-bold">
                  {svc.response_time_ms ? `${svc.response_time_ms} ms` : 'Standby / Internal'}
                </span>
              </div>

              {/* URL with edit capability */}
              <div className="pt-2 border-t border-slate-800/60">
                {editingId === svc.id ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      value={editUrlValue}
                      onChange={(e) => setEditUrlValue(e.target.value)}
                      className="flex-1 px-2 py-1 bg-brand-darkest border border-cyan-500/50 rounded text-[11px] text-cyan-200 font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(svc)}
                      className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:bg-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="truncate text-slate-400 flex items-center gap-1">
                      <span>URL:</span>
                      <span className="text-slate-300 truncate max-w-[120px]">
                        {svc.url || 'Internal'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStartEdit(svc)}
                        title="Edit service URL"
                        className="text-slate-400 hover:text-cyan-300"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {svc.url && (
                        <a
                          href={svc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
