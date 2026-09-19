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

  let badgeColor = "bg-slate-100 text-slate-800 border-slate-200";
  let dotColor = "bg-slate-500";
  let label = "Unknown Risk";

  if (normalizedTier === "high") {
    badgeColor = "bg-rose-50 text-rose-800 border-rose-200 shadow-xs";
    dotColor = "bg-rose-600 animate-pulse";
    label = "High Risk (70-100)";
  } else if (normalizedTier === "medium") {
    badgeColor = "bg-amber-50 text-amber-900 border-amber-200 shadow-xs";
    dotColor = "bg-[#D97706]";
    label = "Medium Risk (40-69.9)";
  } else if (normalizedTier === "low") {
    badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs";
    dotColor = "bg-emerald-600";
    label = "Low Risk (0-39.9)";
  }

  const sizeClasses = {
    sm: "text-xs px-2.5 py-0.5 font-bold",
    md: "text-xs sm:text-sm px-3 py-1 font-bold",
    lg: "text-sm sm:text-base px-4 py-1.5 font-extrabold"
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border whitespace-nowrap shrink-0 ${badgeColor} ${sizeClasses[size]}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
      <span className="tracking-tight">{score !== undefined && score !== null ? `${score.toFixed(1)} / 100` : label}</span>
      {score !== undefined && score !== null && (
        <span className="font-extrabold uppercase tracking-wider text-[10px] pl-1.5 border-l border-slate-300">
          {normalizedTier}
        </span>
      )}
    </span>
  );
};
