"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  FileText,
  SlidersHorizontal,
  Kanban,
  Bot,
  BrainCircuit,
  MessageSquare,
  Award,
  CreditCard,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useUserStore } from "@/stores/user-store";

const NAV_GROUPS = [
  {
    label: "Discover & Apply",
    items: [
      { href: "/explore", label: "Explore Jobs", icon: Compass },
      { href: "/tracker", label: "Application Tracker", icon: Kanban },
      { href: "/agent", label: "Job-Hunter Agent", icon: Bot },
    ],
  },
  {
    label: "AI Career Studio",
    items: [
      { href: "/resumes", label: "Resume Studio", icon: FileText },
      { href: "/customizer", label: "2-Panel Customizer", icon: SlidersHorizontal },
      { href: "/coaching", label: "Career Coaching", icon: MessageSquare },
      { href: "/interview", label: "Mock Interview Studio", icon: BrainCircuit },
      { href: "/assessments", label: "Skill Assessments", icon: Award },
    ],
  },
  {
    label: "Account & System",
    items: [
      { href: "/billing", label: "Billing & Credits", icon: CreditCard },
      { href: "/admin", label: "Admin Governance", icon: Shield },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const credits = useUserStore((s) => s.credits);

  const navContent = (
    <div className="flex flex-col h-full">
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-indigo-50/90 text-brand-indigo font-semibold shadow-2xs ring-1 ring-indigo-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-brand-slate"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-brand-indigo"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <Link
          href="/billing"
          className="block p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              AI Credits
            </span>
            <span className="tabular-nums text-amber-300 font-bold">
              {credits.balance} left
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
            Tailor resumes &amp; run mock interviews. Manage plan &rarr;
          </p>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-200/80 bg-white flex-col sticky top-16 h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full border-r border-slate-200 shadow-2xl z-10 flex flex-col">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
