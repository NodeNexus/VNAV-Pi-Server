import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string; // hex or rgb
  gradientId?: string;
  height?: number;
  width?: number | string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#00f2fe',
  gradientId = 'sparkline-grad',
  height = 36,
}) => {
  if (!data || data.length < 2) {
    return <div style={{ height }} className="w-full" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const paddingY = 4;
  const svgHeight = height;
  const svgWidth = 100; // viewBox coordinates

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * svgWidth;
    const y = svgHeight - paddingY - ((val - min) / range) * (svgHeight - paddingY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      preserveAspectRatio="none"
      className="w-full overflow-visible"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
