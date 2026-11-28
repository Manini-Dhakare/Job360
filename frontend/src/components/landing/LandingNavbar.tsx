"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";

interface LandingNavbarProps {
  hasSession: boolean;
}

const NAV_LINKS = [
  { href: "#top", label: "Home" },
  { href: "#discovery", label: "Find Jobs" },
  { href: "#resume-matching", label: "AI Career Tools" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
];

export function LandingNavbar({ hasSession }: LandingNavbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-indigo to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="font-extrabold text-lg tracking-tight text-brand-slate block">
              Job<span className="text-brand-indigo">360</span>
            </span>
            <span className="text-[10px] font-medium text-brand-muted block -mt-0.5">
              AI Career Copilot
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-brand-indigo transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {hasSession ? (
            <button
              onClick={() => router.push("/explore")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-indigo text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/20 cursor-pointer"
            >
              Open Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-brand-slate hover:bg-slate-100 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-indigo text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/20"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-brand-indigo transition"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {hasSession ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  router.push("/explore");
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-indigo text-white text-sm font-semibold"
              >
                Open Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-brand-slate"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-indigo text-white text-sm font-semibold"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
