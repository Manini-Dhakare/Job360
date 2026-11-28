"use client";

import React, { useEffect, useState } from "react";
import { Bot, ExternalLink, Play, Save, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { MatchScorePill } from "@/components/common/MatchScorePill";
import { PageHeader, Skeleton } from "@/components/ui/Feedback";
import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AgentPage() {
  const [targetTitles, setTargetTitles] = useState("Software Engineer");
  const [locations, setLocations] = useState("Remote");
  const [minScore, setMinScore] = useState(70);
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY">("DAILY");

  const [discoveries, setDiscoveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await apiClient.get("/agent/config");
        const cfg = res.data.data;
        setTargetTitles((cfg.target_titles || []).join(", "));
        setLocations((cfg.locations || []).join(", "));
        setMinScore(cfg.min_match_score ?? 70);
        setFrequency(cfg.run_frequency || "DAILY");
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    await apiClient.put("/agent/config", {
      target_titles: targetTitles.split(",").map((s) => s.trim()).filter(Boolean),
      locations: locations.split(",").map((s) => s.trim()).filter(Boolean),
      min_match_score: minScore,
      run_frequency: frequency,
      is_active: true,
    });
    setSavedMsg("Agent preferences saved!");
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await handleSave();
      const res = await apiClient.post("/agent/run-now");
      setDiscoveries(res.data.data.discoveries || []);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Autonomous Job-Hunter Agent"
        badge={<Badge variant="indigo">Background Scout</Badge>}
        description="Configure your scout criteria and scan aggregated job portals for high-match opportunities."
      />

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate uppercase tracking-wider">
                Target Roles (comma-separated)
              </label>
              <input
                type="text"
                value={targetTitles}
                onChange={(e) => setTargetTitles(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate uppercase tracking-wider">
                Preferred Locations
              </label>
              <input
                type="text"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-brand-slate uppercase tracking-wider">
                  Minimum Best Match Threshold
                </label>
                <span className="text-xs font-extrabold text-brand-indigo tabular-nums">
                  {minScore}%
                </span>
              </div>
              <input
                type="range"
                min={40}
                max={95}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-brand-indigo cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate uppercase tracking-wider">
                Digest Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "DAILY" | "WEEKLY")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
              >
                <option value="DAILY">Daily (06:00 UTC)</option>
                <option value="WEEKLY">Weekly Digest</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Preferences
            </Button>
            <Button onClick={handleRunNow} loading={running}>
              <Play className={`w-4 h-4 ${running ? "hidden" : ""}`} />
              {running ? "Scanning Portals..." : "Run Scout Now"}
            </Button>
            {savedMsg && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {savedMsg}
              </span>
            )}
          </div>
        </Card>
      )}

      {discoveries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 px-1">
            <Bot className="w-4 h-4 text-brand-indigo" />
            High-Affinity Discoveries ({discoveries.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveries.map((job) => (
              <Card
                key={job.job_id}
                hoverable
                className="p-4 flex items-start justify-between gap-3"
              >
                <div className="space-y-2 min-w-0">
                  <h3 className="font-bold text-sm text-brand-slate truncate">
                    {job.title}
                  </h3>
                  <p className="text-xs text-brand-muted truncate">
                    {job.company_name} &bull; {job.location} &bull; {job.source_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <MatchScorePill score={job.best_match_score} />
                    <Badge variant="indigo" className="tabular-nums">
                      ATS: {Math.round(job.ats_score)}%
                    </Badge>
                  </div>
                </div>
                <a
                  href={job.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-brand-indigo text-xs font-semibold hover:bg-indigo-100 transition shrink-0"
                >
                  Apply <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
