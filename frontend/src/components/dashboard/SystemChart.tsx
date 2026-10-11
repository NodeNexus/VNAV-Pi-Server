import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Clock } from 'lucide-react';
import { HistoricalPoint } from '../../types/telemetry';

interface SystemChartProps {
  data: HistoricalPoint[];
}

export const SystemChart: React.FC<SystemChartProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '24h'>('15m');
  const [activeSeries, setActiveSeries] = useState<{
    cpu: boolean;
    memory: boolean;
    disk: boolean;
  }>({
    cpu: true,
    memory: true,
    disk: true,
  });

  // Filter or downsample based on timeRange
  const displayedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeRange === '15m') return data.slice(-30);
    if (timeRange === '1h') return data.slice(-60);
    return data;
  }, [data, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-brand-card/95 border border-brand-border p-3 shadow-2xl backdrop-blur-md text-xs font-mono space-y-1.5 min-w-[160px]">
          <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>Time</span>
            <span className="text-slate-200">{label}</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-slate-100">
                {entry.value}
                {entry.name === 'CPU' || entry.name === 'RAM' ? '%' : ' KB/s'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-brand-card/90 backdrop-blur-md border border-brand-border shadow-card flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-100 tracking-tight">
              System Usage
            </h3>
            <p className="text-xs text-slate-400">
              Real-time resource allocation &amp; historical telemetry
            </p>
          </div>
        </div>

        {/* Legend toggles & Time range buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Series toggle buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSeries((s) => ({ ...s, cpu: !s.cpu }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                activeSeries.cpu
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>CPU</span>
            </button>

            <button
              onClick={() => setActiveSeries((s) => ({ ...s, memory: !s.memory }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                activeSeries.memory
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>RAM</span>
            </button>

            <button
              onClick={() => setActiveSeries((s) => ({ ...s, disk: !s.disk }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                activeSeries.disk
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Disk I/O</span>
            </button>
          </div>

          {/* Time range selector */}
          <div className="flex items-center bg-brand-darkest rounded-lg p-0.5 border border-brand-border text-xs font-medium">
            {(['15m', '1h', '24h'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  timeRange === r
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="w-full h-72 md:h-80 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
            <XAxis
              dataKey="time_label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1e2942' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[0, 100]}
              tickLine={false}
              axisLine={{ stroke: '#1e2942' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />

            {activeSeries.cpu && (
              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU"
                stroke="#00f2fe"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cpuGrad)"
                isAnimationActive={false}
              />
            )}
            {activeSeries.memory && (
              <Area
                type="monotone"
                dataKey="memory"
                name="RAM"
                stroke="#c084fc"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#memGrad)"
                isAnimationActive={false}
              />
            )}
            {activeSeries.disk && (
              <Area
                type="monotone"
                dataKey="disk_write_kb"
                name="Disk I/O"
                stroke="#34d399"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#diskGrad)"
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
