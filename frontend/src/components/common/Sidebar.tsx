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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/explore", label: "Explore Jobs", icon: Compass },
  { href: "/resumes", label: "Resume Studio", icon: FileText },
  { href: "/customizer", label: "2-Panel Customizer", icon: SlidersHorizontal },
  { href: "/tracker", label: "Application Tracker", icon: Kanban },
  { href: "/agent", label: "Job-Hunter Agent", icon: Bot },
  { href: "/coaching", label: "Career Coaching", icon: MessageSquare },
  { href: "/interview", label: "Mock Interview Studio", icon: BrainCircuit },
  { href: "/assessments", label: "Skill Assessments", icon: Award },
  { href: "/billing", label: "Billing & Credits", icon: CreditCard },
  { href: "/admin", label: "Admin Governance", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-[calc(100vh-4rem)]">
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                isActive
                  ? "bg-indigo-50 text-brand-indigo font-semibold"
                  : "text-brand-muted hover:bg-slate-50 hover:text-brand-slate"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
