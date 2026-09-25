"use client";

import React from "react";

interface DomainScores {
  academic: number;
  family: number;
  health: number;
  mental_health: number;
  financial: number;
}

interface DomainRadarChartProps {
  scores: DomainScores;
  studentName?: string;
  size?: number;
  showLabels?: boolean;
}

export function DomainRadarChart({
  scores,
  studentName,
  size = 280,
  showLabels = true,
}: DomainRadarChartProps) {
  const domains = [
    { key: "academic", label: "Academic", value: scores.academic || 0, color: "#3B82F6" },
    { key: "family", label: "Family Support", value: scores.family || 0, color: "#10B981" },
    { key: "health", label: "Physical Health", value: scores.health || 0, color: "#8B5CF6" },
    { key: "mental_health", label: "Mental Wellbeing", value: scores.mental_health || 0, color: "#F59E0B" },
    { key: "financial", label: "Financial Security", value: scores.financial || 0, color: "#EC4899" },
  ];

  const center = size / 2;
  const radius = (size / 2) * 0.72;
  const numAxes = domains.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Compute grid circles/polygons (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, valueFactor: number) => {
    // Start from top (- PI / 2)
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueFactor;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Polygon points for student score
  const scorePoints = domains
    .map((d, i) => {
      // Normalize score 0-100 to factor 0-1
      const factor = Math.max(0.05, Math.min(1, d.value / 100));
      const { x, y } = getCoordinates(i, factor);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        width={size}
        height={size}
        className="overflow-visible select-none drop-shadow-md"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B0014" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.25" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid Polygons */}
        {levels.map((lvl, lIdx) => {
          const polyPoints = Array.from({ length: numAxes })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <g key={`grid-level-${lIdx}`}>
              <polygon
                points={polyPoints}
                fill={lIdx === levels.length - 1 ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={lIdx === levels.length - 1 ? "1.5" : "0.75"}
                strokeDasharray={lIdx < levels.length - 1 ? "3 3" : undefined}
                className={
                  lIdx === levels.length - 1
                    ? "text-slate-100/50 dark:text-slate-800/40"
                    : "text-slate-300 dark:text-slate-700"
                }
              />
              {/* Level indicator text along vertical top axis */}
              <text
                x={center + 4}
                y={center - radius * lvl + 10}
                fontSize="8"
                className="fill-slate-400 dark:fill-slate-500 font-mono select-none"
              >
                {Math.round(lvl * 100)}%
              </text>
            </g>
          );
        })}

        {/* Radial Axis Lines */}
        {domains.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-300 dark:text-slate-700"
            />
          );
        })}

        {/* Data Shape */}
        <polygon
          points={scorePoints}
          fill="url(#radarGradient)"
          stroke="#8B0014"
          strokeWidth="2.5"
          filter="url(#glow)"
          className="transition-all duration-500 ease-out"
        />

        {/* Vertex Points & Labels */}
        {domains.map((d, i) => {
          const factor = Math.max(0.05, Math.min(1, d.value / 100));
          const pt = getCoordinates(i, factor);
          const outerPt = getCoordinates(i, 1.18);

          return (
            <g key={`vertex-${d.key}`} className="group cursor-pointer">
              {/* Point Circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill={d.color}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-transform duration-300 group-hover:scale-150 drop-shadow"
              />

              {/* Axis Label */}
              {showLabels && (
                <text
                  x={outerPt.x}
                  y={outerPt.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  className="fill-slate-700 dark:fill-slate-300 font-semibold tracking-tight transition-colors group-hover:fill-red-700 dark:group-hover:fill-red-400 select-none"
                >
                  {d.label}
                  <tspan
                    x={outerPt.x}
                    dy="12"
                    fontSize="9"
                    className="fill-slate-500 dark:fill-slate-400 font-mono"
                  >
                    ({Math.round(d.value)}%)
                  </tspan>
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {studentName && (
        <div className="mt-1 text-center">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {studentName}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            5-Domain Holistic Risk Polygon
          </p>
        </div>
      )}
    </div>
  );
}
