"use client";

import React from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";

/**
 * Jobright-Inspired Two-Panel Resume Customization Interface Foundation
 * Architecture Handbook Section 5.3 & Figure 3
 */
export function TwoPanelEditor() {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="bg-brand-slate text-white px-6 py-3 flex items-center justify-between text-sm">
        <div>
          <span className="font-semibold">Target Job Customization</span>
          <span className="ml-3 text-emerald-400 font-medium">Match Score: 78% -&gt; 94% (Projected)</span>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-amber" />
          <span>Zero-Fabrication Guardrail Active</span>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 flex-1 min-h-[500px]">
        {/* Left Panel: Verified Candidate Assets */}
        <div className="p-6 space-y-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
              Left Panel: Verified Candidate Assets
            </h3>
            <span className="text-xs text-brand-muted">Source Profile</span>
          </div>
          <div className="p-4 rounded-lg bg-white border border-slate-200 text-sm text-brand-muted">
            Candidate work experience bullets and verified skill tags will be rendered here.
          </div>
        </div>

        {/* Right Panel: Target Job Skill Gaps & Alignment */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-indigo">
              Right Panel: Target Job Skill Gaps & Alignment
            </h3>
            <span className="text-xs text-brand-muted">Job Requirements</span>
          </div>
          <div className="p-4 rounded-lg bg-indigo-50/30 border border-indigo-100 text-sm text-brand-muted">
            Missing required skills with interactive confirmation checkboxes (&quot;I have genuine experience with this&quot;)
            and AI STAR bullet rewriting preview will be rendered here.
          </div>
        </div>
      </div>
    </div>
  );
}
