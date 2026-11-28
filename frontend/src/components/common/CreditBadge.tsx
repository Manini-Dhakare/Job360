"use client";

import React from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { useUserStore } from "@/stores/user-store";

/**
 * Credit Balance Indicator for Navbar
 * Section 5.1 & 11.5: Amber (#F59E0B) for credit indicators
 */
export function CreditBadge() {
  const credits = useUserStore((state) => state.credits);

  return (
    <Link
      href="/billing"
      title="View credit balance & plans"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50/90 hover:bg-amber-100/80 border border-amber-200/90 text-amber-800 text-xs font-semibold transition-colors tabular-nums"
    >
      <Coins className="w-3.5 h-3.5 text-brand-amber shrink-0" />
      <span>{credits.balance} Credits</span>
    </Link>
  );
}
