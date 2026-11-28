"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bookmark,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Compass,
  ExternalLink,
  Globe,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { MatchScorePill } from "@/components/common/MatchScorePill";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { Badge, Card } from "@/components/ui/Card";

interface ExploreJob {
  job_id: string;
  title: string;
  company_name: string;
  source_name: string;
  source_url: string;
  location: string;
  is_remote: boolean;
  min_yoe: number;
  salary_min?: number | null;
  salary_max?: number | null;
  description: string;
  posted_at?: string;
  is_saved: boolean;
  best_match_score: number;
  job_match_score: number;
  resume_match_score: number;
  ats_score: number;
  matched_skills: string[];
  missing_skills: string[];
}

export default function ExplorePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<ExploreJob[]>([]);
  const [selected, setSelected] = useState<ExploreJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"best_match" | "ats_score" | "recent">("best_match");
  const [trackMessage, setTrackMessage] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchJobs = async (overrideQuery?: string, overrideLocation?: string) => {
    setLoading(true);
    try {
      const q = overrideQuery !== undefined ? overrideQuery : query;
      const loc = overrideLocation !== undefined ? overrideLocation : location;
      const params: Record<string, string | boolean> = { sort_by: sortBy };
      if (q.trim()) params.query = q.trim();
      if (loc.trim()) params.location = loc.trim();
      if (sourceFilter) params.source = sourceFilter;
      if (remoteOnly) params.remote = true;

      const res = await apiClient.get("/jobs/search", { params });
      const list: ExploreJob[] = res.data.data?.jobs || [];
      setJobs(list);
      if (list.length > 0) {
        setSelected((prev) =>
          prev ? list.find((j) => j.job_id === prev.job_id) || list[0] : list[0]
        );
      } else {
        setSelected(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized && typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get("query") || "";
      const loc = sp.get("location") || "";
      if (q) setQuery(q);
      if (loc) setLocation(loc);
      setInitialized(true);
      fetchJobs(q, loc);
      return;
    }
    fetchJobs();
  }, [sortBy, remoteOnly, sourceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleSyncLive = async () => {
    setSyncing(true);
    try {
      await apiClient.post("/jobs/sync", null, {
        params: { query: query.trim() || "Software Engineer" },
      });
      await fetchJobs();
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleSave = async (job: ExploreJob) => {
    if (job.is_saved) {
      await apiClient.delete(`/jobs/${job.job_id}/save`);
    } else {
      await apiClient.post(`/jobs/${job.job_id}/save`);
    }
    setJobs((prev) =>
      prev.map((j) => (j.job_id === job.job_id ? { ...j, is_saved: !j.is_saved } : j))
    );
    if (selected?.job_id === job.job_id) {
      setSelected({ ...selected, is_saved: !selected.is_saved });
    }
  };

  const handleTrackApplication = async (
    job: ExploreJob,
    status: "WISHLIST" | "APPLIED"
  ) => {
    try {
      await apiClient.post("/applications", {
        job_id: job.job_id,
        status,
        notes: `Applied via ${job.source_name} (Best Match ${job.best_match_score}%, ATS ${job.ats_score}%)`,
      });
      setTrackMessage(
        status === "APPLIED"
          ? `Logged "${job.title}" to Applied in Tracker!`
          : `Saved "${job.title}" to Wishlist in Tracker!`
      );
      setTimeout(() => setTrackMessage(null), 3500);
    } catch {
      setTrackMessage("Already tracked or unable to save.");
      setTimeout(() => setTrackMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explore Jobs"
        badge={<Badge variant="indigo">{jobs.length} Roles</Badge>}
        description="Direct application links across LinkedIn, Naukri, Greenhouse, Lever & Company Career Portals with Best Match % and ATS Score %."
        actions={
          <Button
            variant="outline"
            onClick={handleSyncLive}
            loading={syncing}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "hidden" : ""}`} />
            {syncing ? "Syncing Portals..." : "Sync Live Portals"}
          </Button>
        }
      />

      {/* Search & Filters */}
      <Card className="p-4">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
        >
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Role, skill, or company..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
            />
          </div>

          <div className="md:col-span-2 relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
            >
              <option value="">All Portals</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Naukri">Naukri</option>
              <option value="Company Career">Company Portals</option>
              <option value="Greenhouse">Greenhouse ATS</option>
              <option value="Lever">Lever ATS</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "best_match" | "ats_score" | "recent")
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
            >
              <option value="best_match">Sort: Best Match %</option>
              <option value="ats_score">Sort: ATS Match %</option>
              <option value="recent">Sort: Most Recent</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-brand-slate cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
              />
              Remote
            </label>
            <Button type="submit" size="md">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {trackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {trackMessage}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-[460px] w-full rounded-2xl" />
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Compass className="w-6 h-6" />}
          title="No jobs match your current filters"
          description="Try clearing your search filters or click Sync Live Portals to pull fresh opportunities."
          action={
            <Button variant="outline" onClick={handleSyncLive}>
              <RefreshCw className="w-4 h-4" />
              Sync Live Portals
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Feed */}
          <div className="lg:col-span-5 space-y-3 lg:max-h-[74vh] lg:overflow-y-auto lg:pr-1">
            {jobs.map((job) => {
              const isSelected = selected?.job_id === job.job_id;
              return (
                <div
                  key={job.job_id}
                  onClick={() => setSelected(job)}
                  className={`p-4 rounded-2xl border bg-white cursor-pointer transition-all duration-150 space-y-3 ${
                    isSelected
                      ? "border-brand-indigo ring-2 ring-brand-indigo/15 shadow-saas"
                      : "border-slate-200/90 hover:border-indigo-200 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-brand-slate leading-snug truncate">
                        {job.title}
                      </h3>
                      <p className="text-xs text-brand-muted mt-1 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="font-medium text-slate-700">{job.company_name}</span>
                        <span>&bull;</span>
                        <span className="truncate">{job.location}</span>
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(job);
                      }}
                      aria-label={job.is_saved ? "Unsave job" : "Save job"}
                      className={`p-2 rounded-xl border transition shrink-0 cursor-pointer ${
                        job.is_saved
                          ? "bg-indigo-50 border-indigo-200 text-brand-indigo"
                          : "border-slate-200 text-slate-400 hover:text-brand-slate hover:bg-slate-50"
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${job.is_saved ? "fill-brand-indigo" : ""}`} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <MatchScorePill score={job.best_match_score} />
                    <Badge variant="indigo" className="tabular-nums">
                      ATS: {Math.round(job.ats_score)}%
                    </Badge>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                      <Globe className="w-3 h-3" />
                      {job.source_name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Job Detail & ATS Match Drawer */}
          {selected && (
            <Card className="lg:col-span-7 p-6 space-y-6 lg:sticky lg:top-20">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1.5">
                  <Badge variant="indigo">{selected.source_name}</Badge>
                  <h2 className="text-xl font-extrabold text-brand-slate tracking-tight">
                    {selected.title}
                  </h2>
                  <p className="text-sm text-brand-muted">
                    <span className="font-medium text-slate-700">{selected.company_name}</span>{" "}
                    &bull; {selected.location}
                    {selected.is_remote ? " • Remote" : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={selected.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleTrackApplication(selected, "APPLIED")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-indigo text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/20"
                  >
                    Apply on Portal
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => handleTrackApplication(selected, "WISHLIST")}
                  >
                    + Wishlist
                  </Button>
                </div>
              </div>

              {/* Best Match & ATS Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                  <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Best Match
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-0.5">
                    {Math.round(selected.best_match_score)}%
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80">
                  <p className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider">
                    ATS Score
                  </p>
                  <p className="text-2xl font-extrabold text-brand-indigo tabular-nums mt-0.5">
                    {Math.round(selected.ats_score)}%
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Role Fit
                  </p>
                  <p className="text-2xl font-extrabold text-brand-slate tabular-nums mt-0.5">
                    {Math.round(selected.job_match_score)}%
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    CV Alignment
                  </p>
                  <p className="text-2xl font-extrabold text-brand-slate tabular-nums mt-0.5">
                    {Math.round(selected.resume_match_score)}%
                  </p>
                </div>
              </div>

              {/* Matched & Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Skills ({selected.matched_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.matched_skills.length === 0 ? (
                      <span className="text-xs text-brand-muted">
                        Upload a resume in Resume Studio to see matched skills.
                      </span>
                    ) : (
                      selected.matched_skills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Missing ATS Keywords ({selected.missing_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.missing_skills.length === 0 ? (
                      <span className="text-xs text-emerald-700 font-medium">
                        Great! No major skill gaps detected.
                      </span>
                    ) : (
                      selected.missing_skills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-lg bg-white border border-amber-200 text-amber-800 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-brand-slate">Job Description</h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {selected.description}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => router.push("/customizer")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-brand-indigo transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Tailor Resume in 2-Panel Customizer
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/interview?company=${encodeURIComponent(selected.company_name)}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:underline cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4" />
                  Open {selected.company_name} Interview Prep
                </button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
