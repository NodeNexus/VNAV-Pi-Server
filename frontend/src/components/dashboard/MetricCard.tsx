import React from 'react';
import { Sparkline } from '../common/Sparkline';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle: string;
  details?: string;
  icon: React.ReactNode;
  accentColor: 'cyan' | 'purple' | 'emerald' | 'coral' | 'amber';
  sparklineData: number[];
  statusBadge?: {
    text: string;
    variant: 'optimal' | 'warm' | 'high' | 'info';
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  details,
  icon,
  accentColor,
  sparklineData,
  statusBadge,
}) => {
  const colorMap = {
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)]',
      textValue: 'text-slate-100 group-hover:text-cyan-300',
      sparkHex: '#00f2fe',
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_-3px_rgba(168,85,247,0.25)]',
      textValue: 'text-slate-100 group-hover:text-purple-300',
      sparkHex: '#c084fc',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]',
      textValue: 'text-slate-100 group-hover:text-emerald-300',
      sparkHex: '#34d399',
    },
    coral: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_-3px_rgba(244,63,94,0.25)]',
      textValue: 'text-slate-100 group-hover:text-rose-300',
      sparkHex: '#fb7185',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]',
      textValue: 'text-slate-100 group-hover:text-amber-300',
      sparkHex: '#fbbf24',
    },
  };

  const currentTheme = colorMap[accentColor];

  const statusVariantStyles = {
    optimal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warm: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div
      className={`group relative rounded-2xl p-5 bg-brand-card/90 backdrop-blur-md border border-brand-border transition-all duration-300 ${currentTheme.border} hover:shadow-card flex flex-col justify-between overflow-hidden`}
    >
      {/* Top row: Title and Icon */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            {title}
          </span>
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${currentTheme.iconBg}`}
          >
            {icon}
          </div>
        </div>

        {/* Middle row: Big metric value */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span
            className={`text-3xl lg:text-4xl font-extrabold font-mono tracking-tight transition-colors duration-200 ${currentTheme.textValue}`}
          >
            {value}
          </span>
          {unit && (
            <span className="text-lg font-bold font-mono text-slate-400">
              {unit}
            </span>
          )}
          {statusBadge && (
            <span
              className={`ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                statusVariantStyles[statusBadge.variant]
              }`}
            >
              {statusBadge.text}
            </span>
          )}
        </div>

        {/* Subtitle and details */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-1">
          <span className="text-slate-300 truncate">{subtitle}</span>
          {details && <span className="text-slate-400 shrink-0 ml-2">{details}</span>}
        </div>
      </div>

      {/* Bottom Sparkline */}
      <div className="mt-4 pt-2 border-t border-slate-800/60">
        <Sparkline
          data={sparklineData}
          color={currentTheme.sparkHex}
          gradientId={`spark-${title.toLowerCase().replace(/\s+/g, '-')}`}
          height={32}
        />
      </div>
    </div>
  );
};
