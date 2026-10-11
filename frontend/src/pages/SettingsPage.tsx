import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  Shield,
  Clock,
  Palette,
  Server,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { fetchSettings, updateSettings } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [samplingInterval, setSamplingInterval] = useState<number>(2.0);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState('vnav-homelab-key-2026');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        if (data.sampling_interval) setSamplingInterval(data.sampling_interval);
        if (data.simulation_mode !== undefined) setSimulationMode(data.simulation_mode);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await updateSettings({
        sampling_interval: samplingInterval,
        simulation_mode: simulationMode,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Control Center Settings</h2>
            <p className="text-xs text-slate-400">
              Telemetry frequency, simulation toggles, security tokens and interface parameters
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all shadow-glow-cyan"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings successfully updated across telemetry daemons.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Telemetry Polling */}
        <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-cyan-400" />
            Telemetry Sampling Interval
          </div>
          <p className="text-xs text-slate-400">
            Frequency at which the backend samples CPU, memory, thermal sensors, and network deltas.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Current Interval:</span>
              <span className="text-cyan-300 font-bold">{samplingInterval} seconds</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={samplingInterval}
              onChange={(e) => setSamplingInterval(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.5s (High Precision)</span>
              <span>2.0s (Default)</span>
              <span>5.0s (Power Saving)</span>
            </div>
          </div>
        </div>

        {/* Development & Simulation Mode */}
        <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider">
            <Server className="w-4 h-4 text-purple-400" />
            Development Simulation Mode
          </div>
          <p className="text-xs text-slate-400">
            When enabled on non-Linux development machines, simulates active service socket checks so you can test all UI states locally.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">Simulate Healthy Microservices</div>
              <div className="text-[11px] text-slate-500">
                {simulationMode ? 'Simulating 8 running homelab services' : 'Checking real localhost TCP/HTTP ports'}
              </div>
            </div>
            <button
              onClick={() => setSimulationMode(!simulationMode)}
              className="p-1 text-cyan-400 transition-colors"
            >
              {simulationMode ? (
                <ToggleRight className="w-8 h-8 text-cyan-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Security & Access Tokens */}
        <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-emerald-400" />
            Authentication &amp; API Key
          </div>
          <p className="text-xs text-slate-400">
            Secret bearer token required to authorize container lifecycle operations (start/stop/restart) and terminal diagnostics.
          </p>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Admin Access Token (ADMIN_API_KEY)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-brand-border font-mono text-xs text-cyan-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Cinematic Theme Details */}
        <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider">
            <Palette className="w-4 h-4 text-rose-400" />
            Visual Design Tokens
          </div>
          <p className="text-xs text-slate-400">
            Cinematic dark-mode aesthetic tuned for low-glare homelab night monitoring.
          </p>

          <div className="grid grid-cols-5 gap-2 pt-1">
            <div className="h-10 rounded-lg bg-[#070a12] border border-slate-800 flex items-center justify-center text-[9px] font-mono text-slate-400">
              #070a12
            </div>
            <div className="h-10 rounded-lg bg-[#0f1526] border border-slate-800 flex items-center justify-center text-[9px] font-mono text-slate-400">
              #0f1526
            </div>
            <div className="h-10 rounded-lg bg-[#00f2fe] flex items-center justify-center text-[9px] font-mono text-slate-950 font-bold">
              Cyan
            </div>
            <div className="h-10 rounded-lg bg-[#a855f7] flex items-center justify-center text-[9px] font-mono text-white font-bold">
              Purple
            </div>
            <div className="h-10 rounded-lg bg-[#10b981] flex items-center justify-center text-[9px] font-mono text-slate-950 font-bold">
              Emerald
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
