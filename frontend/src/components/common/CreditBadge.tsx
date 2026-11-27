"use client";

import React from "react";
import { Coins } from "lucide-react";
import { useUserStore } from "@/stores/user-store";

/**
 * Credit Balance Indicator for Navbar
 * Section 5.1 & 11.5: Amber (#F59E0B) for credit indicators
 */
export function CreditBadge() {
  const credits = useUserStore((state) => state.credits);

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
      <Coins className="w-3.5 h-3.5 text-brand-amber" />
      <span>{credits.balance} Credits</span>
    </div>
  );
}
