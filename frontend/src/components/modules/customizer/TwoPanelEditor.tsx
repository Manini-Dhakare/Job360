"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Download,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useUserStore } from "@/stores/user-store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Feedback";

interface JobOption {
  job_id: string;
  title: string;
  company_name: string;
  missing_skills: string[];
  matched_skills: string[];
}

export function TwoPanelEditor() {
  const deductCredit = useUserStore((s) => s.deductCredit);

  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeBullets, setResumeBullets] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [confirmedSkills, setConfirmedSkills] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [customizing, setCustomizing] = useState(false);
  const [custId, setCustId] = useState<string | null>(null);
  const [rewrittenBullets, setRewrittenBullets] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [resRes, jobsRes] = await Promise.all([
          apiClient.get("/resumes"),
          apiClient.get("/jobs/search"),
        ]);
        const resumes = resRes.data.data || [];
        const primary = resumes.find((r: any) => r.is_primary) || resumes[0];
        if (primary) {
          setResumeSkills(primary.parsed_json?.skills || []);
          setResumeBullets(primary.parsed_json?.bullets || []);
        }
        const jobList: JobOption[] = jobsRes.data.data?.jobs || [];
        setJobs(jobList);
        if (jobList.length > 0) {
          setSelectedJobId(jobList[0].job_id);
        }
      } catch {
        setError("Failed to load resume or jobs.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeJob = jobs.find((j) => j.job_id === selectedJobId);
  const missingSkills = activeJob?.missing_skills || [];

  const toggleSkill = (skill: string) => {
    setConfirmedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleCustomize = async () => {
    setError(null);
    setCustomizing(true);
    try {
      const res = await apiClient.post("/resumes/customize", {
        job_id: selectedJobId || undefined,
        confirmed_skills: confirmedSkills,
      });
      setCustId(res.data.data.cust_id);
      setRewrittenBullets(res.data.data.customized_bullets || []);
      deductCredit();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.detail ||
          "Could not customize resume."
      );
    } finally {
      setCustomizing(false);
    }
  };

  const handleDownload = async () => {
    if (!custId) return;
    const res = await apiClient.get(`/resumes/customized/${custId}/download`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `job360_tailored_${custId.slice(0, 8)}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-900 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Anti-Fabrication Guardrail:</strong> Only genuine skills you
          explicitly confirm on the right panel will be aligned into your
          existing STAR bullets.
        </span>
      </div>

      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <span className="text-xs font-bold text-brand-slate uppercase tracking-wider shrink-0">
            Target Job:
          </span>
          <select
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              setConfirmedSkills([]);
              setRewrittenBullets([]);
              setCustId(null);
            }}
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
          >
            {jobs.map((j) => (
              <option key={j.job_id} value={j.job_id}>
                {j.title} — {j.company_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleCustomize}
            loading={customizing}
          >
            <Sparkles className={`w-4 h-4 ${customizing ? "hidden" : ""}`} />
            Customize Resume (1 Credit)
          </Button>
          {custId && (
            <Button
              variant="outline"
              onClick={handleDownload}
              className="border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            >
              <Download className="w-4 h-4" />
              Download DOCX
            </Button>
          )}
        </div>
      </Card>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Verified Assets */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Left Panel: Verified Resume Assets
            </h2>
            <span className="text-xs text-brand-muted tabular-nums">
              {resumeSkills.length} skills
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold text-brand-slate mb-2.5">
              Detected Resume Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {resumeSkills.length === 0 ? (
                <span className="text-xs text-brand-muted">
                  Upload a resume in Resume Studio first.
                </span>
              ) : (
                resumeSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-brand-slate mb-2.5">
              Existing Experience Bullets
            </p>
            <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
              {(resumeBullets.length > 0
                ? resumeBullets.slice(0, 6)
                : ["Upload a resume to inspect extracted bullets."]
              ).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Right Panel: Target Gaps & STAR Alignment */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-indigo">
              Right Panel: Target Job Skill Gaps
            </h2>
            <span className="text-xs text-brand-muted tabular-nums">
              {confirmedSkills.length} confirmed
            </span>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs text-brand-muted">
              Check skills you genuinely possess to highlight them in your bullets:
            </p>
            {missingSkills.length === 0 ? (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl font-medium">
                No missing skills detected for this role!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {missingSkills.map((skill) => {
                  const checked = confirmedSkills.includes(skill);
                  return (
                    <label
                      key={skill}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        checked
                          ? "bg-indigo-50 border-brand-indigo text-brand-indigo"
                          : "bg-slate-50/70 border-slate-200 text-brand-slate hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSkill(skill)}
                        className="rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
                      />
                      <span>{skill}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {rewrittenBullets.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
              <p className="text-xs font-bold text-brand-indigo flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Aligned STAR Bullets Preview
              </p>
              <ul className="space-y-2 text-xs text-slate-700 list-disc pl-4 leading-relaxed">
                {rewrittenBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
