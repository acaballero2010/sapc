"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface DomainScores {
  academic: number;
  mental_health: number;
  financial: number;
  family: number;
  health: number;
}

interface DomainRadarChartProps {
  scores: DomainScores;
  studentName?: string;
}

export const DomainRadarChart: React.FC<DomainRadarChartProps> = ({ scores, studentName }) => {
  const data = [
    { domain: "Academic (40.2%)", score: scores.academic, weight: "40.17%" },
    { domain: "Mental Health (24.4%)", score: scores.mental_health, weight: "24.42%" },
    { domain: "Financial (13.7%)", score: scores.financial, weight: "13.73%" },
    { domain: "Family (13.7%)", score: scores.family, weight: "13.73%" },
    { domain: "Health (7.9%)", score: scores.health, weight: "7.94%" },
  ];

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis 
            dataKey="domain" 
            tick={{ fill: "#94a3b8", fontSize: 11 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: "#64748b", fontSize: 9 }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px", color: "#f8fafc" }}
            formatter={(value: any) => [`${value}/100 Risk Score`, "Sub-Score"]}
          />
          <Radar
            name={studentName || "Risk Factors"}
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
