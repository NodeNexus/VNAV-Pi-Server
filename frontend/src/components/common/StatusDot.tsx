import React from 'react';

interface StatusDotProps {
  status: 'online' | 'running' | 'offline' | 'stopped' | 'warning' | 'unhealthy' | 'unknown';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  pulse = true,
  size = 'md',
}) => {
  let color = 'bg-slate-500';
  let glowColor = 'rgba(100, 116, 139, 0.4)';

  if (status === 'online' || status === 'running') {
    color = 'bg-emerald-400';
    glowColor = 'rgba(52, 211, 153, 0.5)';
  } else if (status === 'warning' || status === 'unhealthy') {
    color = 'bg-amber-400';
    glowColor = 'rgba(251, 191, 36, 0.5)';
  } else if (status === 'offline' || status === 'stopped') {
    color = 'bg-rose-500';
    glowColor = 'rgba(244, 63, 94, 0.5)';
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span className="relative flex items-center justify-center shrink-0">
      {pulse && (status === 'online' || status === 'running') && (
        <span
          className={`absolute inline-flex rounded-full opacity-75 animate-ping ${color} ${sizeClasses[size]}`}
          style={{ animationDuration: '2s' }}
        />
      )}
      <span
        className={`relative inline-flex rounded-full shadow-sm ${color} ${sizeClasses[size]}`}
        style={{ boxShadow: `0 0 8px ${glowColor}` }}
      />
    </span>
  );
};
