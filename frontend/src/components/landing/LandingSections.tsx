"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Bot,
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  Compass,
  FileText,
  Kanban,
  Layers,
  Lock,
  MapPin,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UploadCloud,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/MotionPrimitives";

interface LandingSectionsProps {
  hasSession: boolean;
  onProtectedNav: (path: string) => void;
}

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Anti-Fabrication AI",
    desc: "Rewrites only your verified achievements into STAR bullets — never invents experience or metrics.",
  },
  {
    icon: Target,
    title: "Tri-Score Transparency",
    desc: "Separates Job Match %, Resume Match %, and ATS Compatibility % so you know why a role fits.",
  },
  {
    icon: Lock,
    title: "Human-Controlled Apply",
    desc: "No unauthorized bot submissions. Review your tailored resume and apply directly on company portals.",
  },
  {
    icon: Layers,
    title: "Atomic Credit Ledger",
    desc: "Start with 5 free credits. Credits are only deducted on successful AI generations.",
  },
];

const KANBAN_PREVIEW = [
  {
    stage: "Wishlist",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    items: [
      { role: "Backend Engineer", company: "FinStack", match: "88%" },
      { role: "Platform Engineer", company: "Nimbus AI", match: "82%" },
    ],
  },
  {
    stage: "Applied",
    color: "bg-indigo-50 text-brand-indigo border-indigo-200",
    items: [{ role: "Full-Stack Developer", company: "CloudScale", match: "92%" }],
  },
  {
    stage: "Interviewing",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    items: [{ role: "AI Product Engineer", company: "VectorOps", match: "90%" }],
  },
  {
    stage: "Offer",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    items: [{ role: "Software Engineer II", company: "Arcadia", match: "94%" }],
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: UploadCloud,
    title: "Upload Resume & Set Targets",
    desc: "Drop your PDF or DOCX resume during onboarding to extract skills, experience, and target roles.",
  },
  {
    step: "02",
    icon: Compass,
    title: "Discover AI-Matched Jobs",
    desc: "Browse aggregated listings ranked by semantic vector similarity and Tri-Score compatibility.",
  },
  {
    step: "03",
    icon: SlidersHorizontal,
    title: "Optimize in 2-Panel Customizer",
    desc: "Confirm genuine skills missing from your CV and generate ATS-ready STAR bullets in seconds.",
  },
  {
    step: "04",
    icon: Kanban,
    title: "Track & Ace Interviews",
    desc: "Move applications across your Kanban pipeline and practice with company-specific STAR question banks.",
  },
];

const FEATURES = [
  {
    icon: Compass,
    title: "Multi-Source Job Explore",
    desc: "Unified search across authorized aggregators and ATS feeds with MD5 deduplication and smart filters.",
    href: "/explore",
  },
  {
    icon: FileText,
    title: "Multi-Format Resume Studio",
    desc: "Parse PDF/DOCX layouts into structured skills, education, work history, and project portfolios.",
    href: "/resumes",
  },
  {
    icon: SlidersHorizontal,
    title: "2-Panel Resume Customizer",
    desc: "Reconcile verified CV assets against job requirements with strict anti-fabrication guardrails.",
    href: "/customizer",
  },
  {
    icon: Bot,
    title: "Autonomous Job-Hunter Agent",
    desc: "Configure target roles, locations, and minimum match thresholds for scheduled opportunity scouting.",
    href: "/agent",
  },
  {
    icon: MessageSquare,
    title: "AI Career Coaching",
    desc: "Interactive career strategy, resume critique, transition roadmaps, and outreach guidance.",
    href: "/coaching",
  },
  {
    icon: BrainCircuit,
    title: "Mock Interview Studio",
    desc: "Practice behavioral, technical, and coding questions with structured STAR evaluation.",
    href: "/interview",
  },
];

const PRICING_TIERS = [
  {
    name: "Free Starter",
    price: "$0",
    period: "on signup",
    desc: "Everything you need to explore jobs and test AI resume tailoring.",
    features: [
      "5 free AI credits on registration",
      "Explore feed & Tri-Score matching",
      "Kanban application tracker",
      "Resume parsing & profile builder",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    desc: "Built for active job seekers tailoring resumes across multiple roles.",
    features: [
      "50 AI credits every month",
      "2-Panel Resume Customizer & PDF export",
      "Autonomous Job-Hunter Agent",
      "AI Career Coaching & Interview Studio",
    ],
    cta: "Choose Pro",
    highlighted: true,
  },
  {
    name: "Unlimited",
    price: "$39",
    period: "/ month",
    desc: "For intensive searches, career transitions, and daily interview prep.",
    features: [
      "Unlimited AI customizations & prep",
      "Priority resume & match scoring",
      "Full Skill Assessments & badges",
      "Unlimited coaching sessions",
    ],
    cta: "Go Unlimited",
    highlighted: false,
  },
];

export function LandingSections({
  hasSession,
  onProtectedNav,
}: LandingSectionsProps) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  return (
    <>
      {/* C. Product Trust / Value Section */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <StaggerItem
                  key={pillar.title}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-brand-indigo flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-brand-slate">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    {pillar.desc}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* D. AI-Powered Job Discovery Section */}
      <section id="discovery" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <FadeIn className="lg:col-span-5 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-brand-indigo text-xs font-semibold border border-indigo-100">
              <Compass className="w-3.5 h-3.5" />
              AI-Powered Job Discovery
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-slate leading-tight">
              Stop Scrolling Endless Boards. See Roles Ranked for You.
            </h2>
            <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
              Job360 aggregates listings, removes duplicates, and scores every
              opportunity against your profile so you immediately see why a role
              fits — including salary bands, experience requirements, and skill
              gaps.
            </p>
            <ul className="space-y-2.5 text-sm text-slate-700">
              {[
                "Semantic vector search + keyword & remote filters",
                "Clear breakdown of matched vs. missing skills",
                "Direct verified apply links to employer portals",
              ].map((point) => (
                <li key={point} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onProtectedNav("/explore")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-indigo text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
            >
              Open Job Explore
              <ArrowRight className="w-4 h-4" />
            </button>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-7">
            <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-5 sm:p-6 space-y-3.5 shadow-saas">
              <div className="flex items-center justify-between text-xs text-brand-muted font-medium px-1">
                <span>Illustrative Job Feed Preview</span>
                <span>Sorted by Best Match %</span>
              </div>

              {[
                {
                  title: "Staff Backend Engineer (Python / FastAPI)",
                  company: "DataPulse",
                  location: "Remote • Full-time",
                  salary: "$145k – $180k",
                  exp: "5+ yrs",
                  match: 94,
                  skills: ["Python", "FastAPI", "PostgreSQL", "Redis"],
                  why: "Strong overlap in async Python APIs and PostgreSQL vector search.",
                },
                {
                  title: "Senior Frontend Engineer (Next.js)",
                  company: "Veloce Cloud",
                  location: "San Francisco / Hybrid",
                  salary: "$140k – $170k",
                  exp: "4+ yrs",
                  match: 86,
                  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
                  why: "Matches React/TypeScript core; minor gap in GraphQL caching.",
                },
              ].map((job) => (
                <div
                  key={job.title}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-indigo-200 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-brand-slate">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted mt-1">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.company}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span>{job.exp}</span>
                        <span className="font-semibold text-emerald-700">
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tabular-nums">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {job.match}% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2">
                    <span className="font-semibold text-brand-indigo">
                      Match insight:
                    </span>{" "}
                    {job.why}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* E. AI Resume Matching & 2-Panel Customizer Section */}
      <section
        id="resume-matching"
        className="py-20 sm:py-24 bg-slate-50/70 border-y border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <FadeIn className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-saas-lg p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Illustrative Tri-Score Diagnostic
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  Anti-Fabrication Active
                </span>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    label: "Job Match Score (Role Fit)",
                    value: 92,
                    color: "bg-emerald-500",
                    text: "text-emerald-700",
                  },
                  {
                    label: "Resume Match Score (Keyword Alignment)",
                    value: 78,
                    color: "bg-brand-indigo",
                    text: "text-brand-indigo",
                  },
                  {
                    label: "ATS Compatibility Score (Format & Parseability)",
                    value: 89,
                    color: "bg-amber-500",
                    text: "text-amber-700",
                  },
                ].map((bar) => (
                  <div key={bar.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{bar.label}</span>
                      <span className={`${bar.text} tabular-nums`}>{bar.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={prefersReduced ? { width: `${bar.value}%` } : { width: 0 }}
                        whileInView={{ width: `${bar.value}%` }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full ${bar.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-1.5">
                  <p className="text-xs font-bold text-emerald-800">Strengths</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Verified Python, FastAPI, SQL, and REST API delivery bullets.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1.5">
                  <p className="text-xs font-bold text-amber-800">
                    Suggested Improvements
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Confirm genuine Redis or Docker experience to boost alignment.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-6 order-1 lg:order-2 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              2-Panel Resume Customizer
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-slate leading-tight">
              Tailor Your Resume Truthfully in Seconds
            </h2>
            <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
              Instead of black-box rewrites that invent skills, Job360 places
              your verified resume assets on the left and job-specific skill gaps
              on the right. Check only the skills you genuinely hold, and export
              an ATS-clean PDF or DOCX.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => onProtectedNav("/customizer")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-indigo text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
              >
                Try 2-Panel Customizer
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onProtectedNav("/resumes")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-brand-slate text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Open Resume Studio
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* F. Smart Job Application Tracking Section */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <FadeIn className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-brand-indigo text-xs font-semibold border border-indigo-100">
              <Kanban className="w-3.5 h-3.5" />
              Smart Application Tracker
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-slate">
              Every Application Organized from Wishlist to Offer
            </h2>
            <p className="text-sm sm:text-base text-brand-muted">
              Log applications directly from Explore and manage every stage in a
              clean Kanban pipeline.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KANBAN_PREVIEW.map((col) => (
              <StaggerItem
                key={col.stage}
                className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${col.color}`}
                  >
                    {col.stage}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    {col.items.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {col.items.map((item) => (
                    <div
                      key={item.role}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
                    >
                      <p className="text-xs font-bold text-brand-slate">
                        {item.role}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-brand-muted">
                        <span>{item.company}</span>
                        <span className="font-semibold text-emerald-700 tabular-nums">
                          {item.match}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* G. AI Career Assistant & H. How It Works & I. Features */}
      <section
        id="features"
        className="py-20 sm:py-24 bg-slate-50/70 border-y border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
          <FadeIn className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-brand-indigo text-xs font-semibold border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              Complete AI Career Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-slate">
              Built for Every Stage of Your Job Search
            </h2>
            <p className="text-sm sm:text-base text-brand-muted">
              From parsing your resume and scouting high-match roles to coaching
              and STAR interview practice.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <StaggerItem key={feat.title}>
                  <button
                    onClick={() => onProtectedNav(feat.href)}
                    className="w-full h-full text-left p-6 rounded-2xl bg-white border border-slate-200/85 shadow-saas hover:border-indigo-200 hover:shadow-saas-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-indigo flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-brand-slate">
                        {feat.title}
                      </h3>
                      <p className="text-sm text-brand-muted leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo">
                      Launch tool <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {/* How It Works */}
          <div id="how-it-works" className="pt-8 space-y-10">
            <FadeIn className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-slate">
                How Job360 Works
              </h3>
              <p className="text-sm text-brand-muted">
                Four focused steps from profile setup to interview readiness.
              </p>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {HOW_IT_WORKS.map((item) => {
                const Icon = item.icon;
                return (
                  <StaggerItem
                    key={item.step}
                    className="p-6 rounded-2xl bg-white border border-slate-200/85 shadow-2xs space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        STEP {item.step}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-brand-slate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-brand-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <FadeIn className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <Award className="w-3.5 h-3.5 text-brand-amber" />
              Simple Credit &amp; Subscription Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-slate">
              Start Free with 5 AI Credits
            </h2>
            <p className="text-sm sm:text-base text-brand-muted">
              Upgrade anytime from your workspace billing portal as your search
              scales.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_TIERS.map((tier) => (
              <StaggerItem
                key={tier.name}
                className={`p-7 rounded-3xl border flex flex-col justify-between space-y-6 ${
                  tier.highlighted
                    ? "bg-slate-900 text-white border-slate-800 shadow-saas-lg"
                    : "bg-white text-brand-slate border-slate-200/90 shadow-saas"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                    {tier.highlighted && (
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-indigo text-white text-[11px] font-semibold">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold tabular-nums">
                      {tier.price}
                    </span>
                    <span
                      className={`text-xs ${
                        tier.highlighted ? "text-slate-300" : "text-brand-muted"
                      }`}
                    >
                      {tier.period}
                    </span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      tier.highlighted ? "text-slate-300" : "text-brand-muted"
                    }`}
                  >
                    {tier.desc}
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            tier.highlighted
                              ? "text-emerald-400"
                              : "text-emerald-600"
                          }`}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() =>
                    hasSession
                      ? router.push("/billing")
                      : router.push("/register")
                  }
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    tier.highlighted
                      ? "bg-brand-indigo hover:bg-indigo-500 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-brand-slate"
                  }`}
                >
                  {tier.cta}
                </button>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* J. Final CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <FadeIn className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-14 text-center text-white shadow-saas-lg space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Run a Smarter Job Search?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Create your account, upload your resume, and get instant Tri-Score
            job matches with 5 free AI credits.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() =>
                hasSession ? router.push("/explore") : router.push("/register")
              }
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-indigo hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-md cursor-pointer"
            >
              {hasSession ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onProtectedNav("/explore")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition cursor-pointer"
            >
              Explore Live Jobs
            </button>
          </div>
        </FadeIn>
      </section>

      {/* K. Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/70 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-indigo flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-brand-slate">
                Job<span className="text-brand-indigo">360</span>
              </span>
            </Link>
            <p className="text-xs text-brand-muted max-w-sm leading-relaxed">
              AI-powered job discovery, Tri-Score resume matching, anti-fabrication
              2-panel resume customization, and career intelligence workspace.
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Platform
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#discovery" className="hover:text-brand-indigo transition">
                  Job Discovery
                </a>
              </li>
              <li>
                <a
                  href="#resume-matching"
                  className="hover:text-brand-indigo transition"
                >
                  2-Panel Customizer
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-brand-indigo transition">
                  AI Career Tools
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-brand-indigo transition">
                  Plans &amp; Credits
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Account
            </p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/login" className="hover:text-brand-indigo transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-brand-indigo transition"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <button
                  onClick={() => onProtectedNav("/explore")}
                  className="hover:text-brand-indigo transition cursor-pointer"
                >
                  Explore Workspace
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
