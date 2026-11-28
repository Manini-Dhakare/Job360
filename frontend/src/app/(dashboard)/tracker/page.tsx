"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  Building2,
  ExternalLink,
  Kanban,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader, Skeleton } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Card";

interface TrackerCard {
  app_id: string;
  job_id: string;
  title: string;
  company_name: string;
  source_name: string;
  source_url: string;
  location: string;
  status: string;
  notes?: string | null;
  applied_at: string;
}

type KanbanColumns = Record<
  "WISHLIST" | "APPLIED" | "INTERVIEWING" | "OFFERED" | "REJECTED",
  TrackerCard[]
>;

const COLUMN_META: {
  key: keyof KanbanColumns;
  label: string;
  badgeColor: string;
}[] = [
  { key: "WISHLIST", label: "Wishlist", badgeColor: "bg-slate-100 text-slate-700 border-slate-200" },
  { key: "APPLIED", label: "Applied", badgeColor: "bg-indigo-50 text-brand-indigo border-indigo-200" },
  { key: "INTERVIEWING", label: "Interviewing", badgeColor: "bg-amber-50 text-amber-800 border-amber-200" },
  { key: "OFFERED", label: "Offered", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "REJECTED", label: "Rejected", badgeColor: "bg-rose-50 text-rose-700 border-rose-200" },
];

export default function TrackerPage() {
  const router = useRouter();
  const [columns, setColumns] = useState<KanbanColumns>({
    WISHLIST: [],
    APPLIED: [],
    INTERVIEWING: [],
    OFFERED: [],
    REJECTED: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchKanban = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/applications/kanban");
      setColumns(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    await apiClient.patch(`/applications/${appId}/status`, { status: newStatus });
    await fetchKanban();
  };

  const handleDelete = async (appId: string) => {
    await apiClient.delete(`/applications/${appId}`);
    await fetchKanban();
  };

  const totalCount = Object.values(columns).reduce(
    (sum, list) => sum + (list?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Tracker"
        badge={
          <Badge variant="indigo">
            <Kanban className="w-3.5 h-3.5" />
            {totalCount} Tracked
          </Badge>
        }
        description="Track every job from Wishlist to Offer and jump directly into Company Interview Prep."
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {COLUMN_META.map((col) => {
            const cards = columns[col.key] || [];
            return (
              <div
                key={col.key}
                className="rounded-2xl bg-slate-100/75 border border-slate-200/80 p-3.5 space-y-3 min-h-[340px]"
              >
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-slate">
                    {col.label}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border tabular-nums ${col.badgeColor}`}
                  >
                    {cards.length}
                  </span>
                </div>

                {cards.length === 0 ? (
                  <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center text-xs text-brand-muted bg-white/40">
                    No applications
                  </div>
                ) : (
                  cards.map((card) => (
                    <div
                      key={card.app_id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-saas transition space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-brand-slate leading-snug">
                            {card.title}
                          </h3>
                          <p className="text-xs text-brand-muted mt-1 flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{card.company_name}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(card.app_id)}
                          title="Remove"
                          aria-label="Remove application"
                          className="text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {card.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 p-2 rounded-lg leading-relaxed">
                          {card.notes}
                        </p>
                      )}

                      <select
                        value={col.key}
                        onChange={(e) => handleStatusChange(card.app_id, e.target.value)}
                        className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
                      >
                        <option value="WISHLIST">Move to Wishlist</option>
                        <option value="APPLIED">Move to Applied</option>
                        <option value="INTERVIEWING">Move to Interviewing</option>
                        <option value="OFFERED">Move to Offered</option>
                        <option value="REJECTED">Move to Rejected</option>
                      </select>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <a
                          href={card.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-muted hover:text-brand-slate"
                        >
                          Portal <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() =>
                            router.push(
                              `/interview?company=${encodeURIComponent(card.company_name)}`
                            )
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-indigo hover:underline cursor-pointer"
                        >
                          <BrainCircuit className="w-3 h-3" />
                          Prep
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
