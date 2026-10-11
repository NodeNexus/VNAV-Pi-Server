import React, { useState } from 'react';
import {
  Terminal as TerminalIcon,
  Play,
  Key,
  Shield,
  Trash2,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { runTerminalCommand } from '../services/api';

export const TerminalPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('vnav-homelab-key-2026');
  const [customCmd, setCustomCmd] = useState('');
  const [outputLog, setOutputLog] = useState<
    { command: string; stdout: string; stderr: string; exitCode: number }[]
  >([
    {
      command: 'uname -a',
      stdout:
        'Linux vnavhomelab 6.6.20+rpt-rpi-2712 #1 SMP PREEMPT Debian 1:6.6.20-1+rpt1 (2024-03-15) aarch64 GNU/Linux',
      stderr: '',
      exitCode: 0,
    },
    {
      command: 'vcgencmd measure_temp',
      stdout: "temp=47.4'C",
      stderr: '',
      exitCode: 0,
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const presets = [
    { label: 'System Uname', alias: 'uname', cmd: 'uname -a' },
    { label: 'RPi SoC Temp', alias: 'vcgencmd_temp', cmd: 'vcgencmd measure_temp' },
    { label: 'ARM Clock', alias: 'vcgencmd_clock', cmd: 'vcgencmd measure_clock arm' },
    { label: 'Throttle Status', alias: 'vcgencmd_throttled', cmd: 'vcgencmd get_throttled' },
    { label: 'Uptime & Load', alias: 'uptime', cmd: 'uptime' },
    { label: 'Disk Free', alias: 'df', cmd: 'df -h' },
    { label: 'Memory Free', alias: 'free', cmd: 'free -h' },
    { label: 'Docker Containers', alias: 'docker_ps', cmd: 'docker ps' },
    { label: 'Network IPs', alias: 'ip', cmd: 'ip -br a' },
    { label: 'Tailscale Status', alias: 'tailscale', cmd: 'tailscale status' },
  ];

  const handleExecute = async (alias?: string, raw?: string) => {
    const commandText = raw || alias || customCmd;
    if (!commandText) return;

    setIsRunning(true);
    try {
      const res = await runTerminalCommand(alias, raw || (alias ? undefined : customCmd), apiKey);
      setOutputLog((prev) => [
        ...prev,
        {
          command: commandText,
          stdout: res.stdout,
          stderr: res.stderr,
          exitCode: res.exit_code,
        },
      ]);
      if (!alias) setCustomCmd('');
    } catch (e: any) {
      setOutputLog((prev) => [
        ...prev,
        {
          command: commandText,
          stdout: '',
          stderr: e?.message || 'Execution error or forbidden',
          exitCode: 1,
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl p-6 bg-brand-card/90 border border-brand-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <TerminalIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Secured Hardware Terminal</h2>
            <p className="text-xs text-slate-400">
              Authenticated diagnostic shell isolated to safe homelab telemetry commands
            </p>
          </div>
        </div>

        {/* Auth Key bar */}
        <div className="flex items-center gap-2 bg-brand-darkest/90 px-3 py-1.5 rounded-xl border border-brand-border text-xs">
          <Key className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 font-medium">Auth Key:</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-transparent border-none text-slate-200 text-xs font-mono focus:outline-none w-36"
          />
        </div>
      </div>

      {/* Preset Quick Commands */}
      <div className="rounded-2xl p-5 bg-brand-card/90 border border-brand-border">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Diagnostic Quick Presets
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.alias}
              onClick={() => handleExecute(p.alias)}
              disabled={isRunning}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{p.label}</span>
              <span className="text-[10px] text-slate-500">({p.cmd})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="rounded-2xl border border-brand-border bg-brand-darkest shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal top header */}
        <div className="p-3 bg-slate-900/80 border-b border-brand-border flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-slate-300 ml-2 font-semibold">pi@vnavhomelab:~</span>
          </div>
          <button
            onClick={() => setOutputLog([])}
            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Output area */}
        <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto select-text">
          {outputLog.map((log, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <span className="text-emerald-400">pi@vnavhomelab:~$</span>
                <span>{log.command}</span>
                <span
                  className={`ml-auto text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    log.exitCode === 0
                      ? 'text-emerald-400/80 bg-emerald-950/40'
                      : 'text-rose-400/80 bg-rose-950/40'
                  }`}
                >
                  exit {log.exitCode}
                </span>
              </div>
              {log.stdout && (
                <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed pl-4 border-l border-cyan-500/20">
                  {log.stdout}
                </pre>
              )}
              {log.stderr && (
                <pre className="text-rose-300 whitespace-pre-wrap leading-relaxed pl-4 border-l border-rose-500/30">
                  {log.stderr}
                </pre>
              )}
            </div>
          ))}

          {isRunning && (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="animate-spin text-cyan-400">◐</span>
              <span>Running command on vnavhomelab...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900/90 border-t border-brand-border flex items-center gap-2">
          <span className="text-emerald-400 font-bold">pi@vnavhomelab:~$</span>
          <input
            type="text"
            value={customCmd}
            onChange={(e) => setCustomCmd(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute(undefined, customCmd)}
            placeholder="Type safe diagnostic command (e.g. uname -a, df -h, vcgencmd measure_temp)..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleExecute(undefined, customCmd)}
            disabled={isRunning || !customCmd.trim()}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3 h-3" />
            <span>Run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
