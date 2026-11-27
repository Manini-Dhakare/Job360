import Link from "next/link";
import { ArrowRight, Bot, Compass, FileText, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-brand-indigo text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Jobright AI Architecture Benchmark</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-slate">
          AI-Powered Career Platform
        </h1>

        <p className="text-lg md:text-xl text-brand-muted max-w-2xl mx-auto">
          Foundational multi-tier architecture connecting Explore, Two-Panel Resume Customization,
          PyTorch Tri-Score Matching, and Autonomous Job Scouting.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-indigo text-white font-medium hover:bg-indigo-700 transition"
          >
            <Compass className="w-4 h-4" />
            Explore Jobs
          </Link>
          <Link
            href="/resumes"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 bg-white text-brand-slate font-medium hover:bg-slate-50 transition"
          >
            <FileText className="w-4 h-4" />
            Resume Studio
          </Link>
        </div>
      </div>
    </main>
  );
}
