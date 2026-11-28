"use client";

import React, { useEffect, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Star, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui/Feedback";
import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ParsedResume {
  resume_id: string;
  title: string;
  is_primary: boolean;
  created_at: string;
  parsed_json: {
    skills?: string[];
    bullets?: string[];
    ats?: {
      ats_score?: number;
      word_count?: number;
      checks?: {
        standard_headings?: boolean;
        skills_section?: boolean;
        contact_email?: boolean;
        chronology_dates?: boolean;
      };
    };
  };
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ParsedResume[]>([]);
  const [selected, setSelected] = useState<ParsedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/resumes");
      const list: ParsedResume[] = res.data.data || [];
      setResumes(list);
      if (list.length > 0 && !selected) {
        setSelected(list.find((r) => r.is_primary) || list[0]);
      }
    } catch {
      setError("Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created: ParsedResume = res.data.data;
      setResumes((prev) => [created, ...prev]);
      setSelected(created);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Resume upload failed.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (resumeId: string) => {
    try {
      await apiClient.post(`/resumes/${resumeId}/primary`);
      setResumes((prev) =>
        prev.map((r) => ({ ...r, is_primary: r.resume_id === resumeId }))
      );
      if (selected?.resume_id === resumeId) {
        setSelected({ ...selected, is_primary: true });
      }
    } catch {
      setError("Could not update primary resume.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Studio & ATS Parser"
        badge={<Badge variant="indigo">{resumes.length} Uploaded</Badge>}
        description="Upload your PDF or DOCX resume to extract skills and power Best Match % & ATS Compatibility % across Explore Jobs."
      />

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      <label className="group block border-2 border-dashed border-slate-300 hover:border-brand-indigo rounded-2xl p-8 text-center cursor-pointer bg-white shadow-2xs transition-all">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-indigo flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>
        <p className="text-sm font-bold text-brand-slate">
          {uploading
            ? "Parsing resume & running ATS diagnostics..."
            : "Click to upload PDF or DOCX Resume (max 10 MB)"}
        </p>
        <p className="text-xs text-brand-muted mt-1">
          Uses layout-aware extraction (PyMuPDF / python-docx)
        </p>
        <input
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files?.[0])}
        />
      </label>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-72 lg:col-span-2 rounded-2xl" />
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No resumes uploaded yet"
          description="Upload your first resume above to unlock personalized ATS & Best Match scores!"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Your Resumes ({resumes.length})
            </h2>
            {resumes.map((r) => (
              <div
                key={r.resume_id}
                onClick={() => setSelected(r)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white ${
                  selected?.resume_id === r.resume_id
                    ? "border-brand-indigo ring-2 ring-brand-indigo/15 shadow-saas"
                    : "border-slate-200/90 hover:border-indigo-200 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-brand-indigo shrink-0" />
                    <span className="font-semibold text-sm text-brand-slate truncate">
                      {r.title}
                    </span>
                  </div>
                  {r.is_primary && (
                    <Badge variant="emerald" className="shrink-0">
                      <Star className="w-3 h-3 fill-emerald-600" /> Primary
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-brand-muted mt-2 tabular-nums">
                  {r.parsed_json?.skills?.length ?? 0} skills &bull; ATS Baseline:{" "}
                  <span className="font-semibold text-brand-slate">
                    {r.parsed_json?.ats?.ats_score ?? 0}%
                  </span>
                </p>
              </div>
            ))}
          </div>

          {selected && (
            <Card className="lg:col-span-2 p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-brand-slate">
                    {selected.title}
                  </h3>
                  <p className="text-xs text-brand-muted tabular-nums mt-0.5">
                    Word count: {selected.parsed_json?.ats?.word_count ?? 0} words
                  </p>
                </div>
                {!selected.is_primary && (
                  <Button
                    size="sm"
                    onClick={() => handleSetPrimary(selected.resume_id)}
                  >
                    Set as Primary
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                  <p className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider">
                    ATS Readiness
                  </p>
                  <p className="text-2xl font-extrabold text-brand-indigo tabular-nums mt-0.5">
                    {selected.parsed_json?.ats?.ats_score ?? 0}%
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Headings
                  </p>
                  <p className="text-sm font-bold text-brand-slate mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {selected.parsed_json?.ats?.checks?.standard_headings
                      ? "Pass"
                      : "Needs Work"}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Skills Section
                  </p>
                  <p className="text-sm font-bold text-brand-slate mt-1.5">
                    {selected.parsed_json?.ats?.checks?.skills_section
                      ? "Detected"
                      : "Missing"}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Contact Email
                  </p>
                  <p className="text-sm font-bold text-brand-slate mt-1.5">
                    {selected.parsed_json?.ats?.checks?.contact_email
                      ? "Found"
                      : "Missing"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-brand-slate mb-2.5">
                  Extracted Verified Skills ({selected.parsed_json?.skills?.length ?? 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selected.parsed_json?.skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-brand-slate border border-slate-200/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
