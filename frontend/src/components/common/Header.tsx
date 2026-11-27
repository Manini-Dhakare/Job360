"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Coins } from "lucide-react";
import { CreditBadge } from "./CreditBadge";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-slate">
          <div className="w-8 h-8 rounded-lg bg-brand-indigo flex items-center justify-center text-white font-black text-sm">
            360
          </div>
          <span>Job360</span>
        </Link>
        <span className="text-xs bg-indigo-50 text-brand-indigo px-2 py-0.5 rounded font-medium border border-indigo-100">
          Jobright Benchmark
        </span>
      </div>

      <div className="flex items-center gap-4">
        <CreditBadge />
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-brand-slate">
          JD
        </div>
      </div>
    </header>
  );
}
