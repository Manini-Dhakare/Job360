"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { CreditBadge } from "./CreditBadge";
import { apiClient, setStoredToken } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";
import { useUIStore } from "@/stores/ui-store";

export function Header() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "U";

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network errors during logout
    }
    setStoredToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand-slate transition"
          aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        <Link href="/explore" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-indigo to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-lg tracking-tight text-brand-slate block">
              Job<span className="text-brand-indigo">360</span>
            </span>
            <span className="text-[10px] font-medium text-brand-muted hidden sm:block -mt-0.5">
              AI Career Workspace
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <CreditBadge />

        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-brand-indigo flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <span className="text-xs font-medium text-slate-600 max-w-[160px] truncate">
            {user?.email}
          </span>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
