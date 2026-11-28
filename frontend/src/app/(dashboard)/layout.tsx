"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sidebar";
import { apiClient, getStoredToken, setStoredToken } from "@/lib/api";
import { useUserStore } from "@/stores/user-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const setUser = useUserStore((s) => s.setUser);
  const setCredits = useUserStore((s) => s.setCredits);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    const verifyAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/explore")}`);
        return;
      }
      try {
        const res = await apiClient.get("/auth/me");
        if (!active) return;
        const userData = res.data.data;
        setUser(userData);
        setCredits({
          balance: userData.credits ?? 5,
          lifetime_granted: userData.credits ?? 5,
          lifetime_consumed: 0,
        });
        setChecking(false);
      } catch {
        setStoredToken(null);
        setUser(null);
        if (active) {
          router.replace(`/login?next=${encodeURIComponent(pathname || "/explore")}`);
        }
      }
    };
    verifyAuth();
    return () => {
      active = false;
    };
  }, [pathname, router, setCredits, setUser]);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-brand-muted gap-3 text-sm">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-indigo to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2 font-medium text-brand-slate">
          <Loader2 className="w-4 h-4 animate-spin text-brand-indigo" />
          <span>Loading your career workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
