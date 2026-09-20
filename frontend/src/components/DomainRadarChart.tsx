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
    { domain: "Academic (30.0%)", score: scores.academic, weight: "30.00%" },
    { domain: "Family (20.0%)", score: scores.family, weight: "20.00%" },
    { domain: "Health (20.0%)", score: scores.health, weight: "20.00%" },
    { domain: "Mental Health (15.0%)", score: scores.mental_health, weight: "15.00%" },
    { domain: "Financial (15.0%)", score: scores.financial, weight: "15.00%" },
  ];

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center relative font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis 
            dataKey="domain" 
            tick={{ fill: "#0F172A", fontSize: 11, fontWeight: 700 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: "#64748B", fontSize: 9 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#FFFFFF", 
              borderColor: "#CBD5E1", 
              borderRadius: "12px", 
              fontSize: "12px", 
              color: "#0F172A",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}
            formatter={(value: any) => [`${value}/100 Risk Score`, "Sub-Score"]}
          />
          <Radar
            name={studentName || "Risk Factors"}
            dataKey="score"
            stroke="#8B0014"
            strokeWidth={2}
            fill="#8B0014"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
