"use client";

import React from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Database, Shield, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/Feedback";
import { Badge, Card } from "@/components/ui/Card";

const GOVERNANCE_MODULES = [
  {
    icon: Activity,
    title: "Job Source Health",
    desc: "Monitor Adzuna, Jooble, Greenhouse, and Lever ingestion rate limits and circuit breakers.",
    status: "Configured",
  },
  {
    icon: Database,
    title: "Credit Ledger Audits",
    desc: "Inspect atomic credit transactions, idempotency keys, and failed-generation refunds.",
    status: "Active",
  },
  {
    icon: Users,
    title: "User & RBAC Governance",
    desc: "Admin-only role checks and candidate account lifecycle controls.",
    status: "RBAC Protected",
  },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-indigo transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Link>
        </div>

        <PageHeader
          title="Admin Governance & Telemetry"
          badge={
            <Badge variant="slate">
              <Shield className="w-3.5 h-3.5" />
              Platform Governance
            </Badge>
          }
          description="Multi-source job ingestion health, credit audits, and platform telemetry."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {GOVERNANCE_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card key={mod.title} className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-indigo flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="indigo">{mod.status}</Badge>
                </div>
                <h3 className="text-base font-bold text-brand-slate">
                  {mod.title}
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {mod.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
