import React from "react";

interface RiskBadgeProps {
  score?: number | null;
  tier?: string | null;
  size?: "sm" | "md" | "lg";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, tier, size = "md" }) => {
  const normalizedTier = tier?.toLowerCase() || (
    score !== undefined && score !== null
      ? score >= 70
        ? "high"
        : score >= 40
        ? "medium"
        : "low"
      : "unknown"
  );

  let badgeColor = "bg-slate-800 text-slate-300 border-slate-700";
  let dotColor = "bg-slate-400";
  let label = "Unknown Risk";

  if (normalizedTier === "high") {
    badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
    dotColor = "bg-rose-500 animate-pulse";
    label = "High Risk (70-100)";
  } else if (normalizedTier === "medium") {
    badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    dotColor = "bg-amber-500";
    label = "Medium Risk (40-69.9)";
  } else if (normalizedTier === "low") {
    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    dotColor = "bg-emerald-500";
    label = "Low Risk (0-39.9)";
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1 font-medium",
    lg: "text-sm px-3.5 py-1.5 font-semibold"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${badgeColor} ${sizeClasses[size]} backdrop-blur-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{score !== undefined && score !== null ? `${score.toFixed(1)} / 100` : label}</span>
      {score !== undefined && score !== null && (
        <span className="opacity-80 text-[10px] uppercase font-bold tracking-wider">
          • {normalizedTier}
        </span>
      )}
    </span>
  );
};
