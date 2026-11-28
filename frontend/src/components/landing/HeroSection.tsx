"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

interface HeroSectionProps {
  hasSession: boolean;
  onProtectedNav: (path: string) => void;
}

export function HeroSection({ hasSession, onProtectedNav }: HeroSectionProps) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (searchLocation.trim()) params.set("location", searchLocation.trim());
    const qs = params.toString();
    onProtectedNav(qs ? `/explore?${qs}` : "/explore");
  };

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white pt-14 pb-20 sm:pt-20 sm:pb-28"
    >
      <div className="absolute inset-0 bg-grid-slate [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full bg-indigo-200/25 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Copy & Search */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-brand-indigo text-xs font-semibold shadow-2xs">
              <Zap className="w-3.5 h-3.5" />
              <span>AI Career Copilot &bull; 5 Free Credits on Signup</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-[3.5rem] font-extrabold tracking-tight text-brand-slate leading-[1.08]">
              Find the Right Job Faster with{" "}
              <span className="bg-gradient-to-r from-brand-indigo to-indigo-500 bg-clip-text text-transparent">
                Precision AI Matching
              </span>
            </h1>

            <p className="text-base sm:text-lg text-brand-muted max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Discover high-affinity roles, inspect your Tri-Score compatibility,
              tailor your resume without fabrication, and track every application
              from one intelligent workspace.
            </p>

            {/* Interactive Job Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="p-2 rounded-2xl bg-white border border-slate-200/90 shadow-saas-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl mx-auto lg:mx-0"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title or skill (e.g. React, Python)"
                  className="w-full text-sm text-brand-slate placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <div className="hidden sm:block w-px h-7 bg-slate-200" />
              <div className="flex items-center gap-2 px-3 py-2 sm:w-44">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Location / Remote"
                  className="w-full text-sm text-brand-slate placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-brand-indigo hover:bg-indigo-700 text-white text-sm font-semibold transition inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
              <button
                onClick={() =>
                  hasSession ? router.push("/explore") : router.push("/register")
                }
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-indigo text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                {hasSession ? "Open Your Workspace" : "Start Your Job Search"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-brand-slate font-semibold text-sm hover:bg-slate-50 transition shadow-2xs"
              >
                <Compass className="w-4 h-4 text-brand-indigo" />
                Explore Features
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-xs text-brand-muted font-medium">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero-fabrication AI guardrails
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-indigo" />
                You control every submission
              </span>
            </div>
          </div>

          {/* Right Illustrative Product Preview */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-saas-lg p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-semibold text-slate-500">
                    Illustrative Workspace Preview
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-brand-indigo text-[11px] font-semibold border border-indigo-100">
                  Tri-Score AI
                </span>
              </div>

              {/* Mock Recommended Job Card */}
              <div className="p-4 rounded-2xl border border-indigo-200/80 bg-indigo-50/30 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-brand-slate">
                      Senior Full-Stack Engineer
                    </p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      CloudScale Labs &bull; Remote &bull; Full-time
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tabular-nums shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    92% Match
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                    <p className="text-[10px] text-brand-muted font-medium">Job Match</p>
                    <p className="text-sm font-extrabold text-emerald-600 tabular-nums">92%</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                    <p className="text-[10px] text-brand-muted font-medium">Resume Match</p>
                    <p className="text-sm font-extrabold text-brand-indigo tabular-nums">84%</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                    <p className="text-[10px] text-brand-muted font-medium">ATS Score</p>
                    <p className="text-sm font-extrabold text-amber-600 tabular-nums">88%</p>
                  </div>
                </div>
              </div>

              {/* Mock 2-Panel Skill Gap Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Verified on Resume
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["TypeScript", "Next.js", "Python", "PostgreSQL"].map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Confirm Skill Gaps
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded bg-brand-indigo text-white flex items-center justify-center text-[10px]">
                        &#10003;
                      </span>
                      <span>Redis Caching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-white" />
                      <span className="text-slate-500">Docker Compose</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Floating Accent Card */}
            <motion.div
              animate={prefersReduced ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 absolute -bottom-4 -left-4"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-indigo flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">STAR Bullet Ready</p>
                <p className="text-[11px] text-slate-300">Zero fabricated claims</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
