import React from "react";
import { cn } from "@/lib/utils";

interface MatchScorePillProps {
  score?: number;
  className?: string;
}

/**
 * AI Match Score Pill component
 * Section 5.2 color rules: Green >=80%, Yellow 60-79%, Gray <60%
 */
export function MatchScorePill({ score = 0, className }: MatchScorePillProps) {
  let colorStyles = "bg-slate-100 text-slate-600 border-slate-200"; // <60%

  if (score >= 80) {
    colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold";
  } else if (score >= 60) {
    colorStyles = "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
  }

  return (
    <div
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-wide",
        colorStyles,
        className
      )}
    >
      <span>{Math.round(score)}% Match</span>
    </div>
  );
}
