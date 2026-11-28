"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Coins, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { PageHeader } from "@/components/ui/Feedback";
import { Badge, Card } from "@/components/ui/Card";

const PLANS = [
  {
    name: "Free Starter",
    price: "$0",
    period: "forever",
    credits: "5 Free Credits",
    features: [
      "5 AI credits on signup",
      "Explore Jobs & Tri-Score matching",
      "Kanban Application Tracker",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    credits: "50 Credits / mo",
    features: [
      "50 monthly AI credits",
      "2-Panel Resume Customizer & export",
      "Autonomous Job-Hunter Agent",
    ],
    current: false,
  },
  {
    name: "Unlimited",
    price: "$39",
    period: "/ month",
    credits: "Unlimited Credits",
    features: [
      "Unlimited customizations & prep",
      "AI Career Coaching & Interview Studio",
      "Skill Assessments & badges",
    ],
    current: false,
  },
];

export default function BillingPage() {
  const credits = useUserStore((s) => s.credits);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Ledger & Subscriptions"
        badge={<Badge variant="amber">Atomic Ledger</Badge>}
        description="View your current AI credit balance and subscription tiers."
      />

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Available Balance
            </p>
            <p className="text-3xl font-extrabold text-brand-slate tabular-nums mt-1">
              {credits.balance}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-brand-amber flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Lifetime Granted
            </p>
            <p className="text-3xl font-extrabold text-emerald-700 tabular-nums mt-1">
              {credits.lifetime_granted}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Credits Used
            </p>
            <p className="text-3xl font-extrabold text-brand-indigo tabular-nums mt-1">
              {credits.lifetime_consumed}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-brand-indigo flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`p-6 flex flex-col justify-between space-y-5 ${
              plan.current ? "border-brand-indigo ring-1 ring-brand-indigo/20" : ""
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-brand-slate">{plan.name}</h3>
                {plan.current && <Badge variant="indigo">Current Plan</Badge>}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-brand-slate tabular-nums">
                  {plan.price}
                </span>
                <span className="text-xs text-brand-muted">{plan.period}</span>
              </div>
              <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 inline-block px-2.5 py-0.5 rounded-full">
                {plan.credits}
              </p>
              <ul className="space-y-2 pt-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100">
              {plan.current ? (
                <Link
                  href="/customizer"
                  className="block w-full text-center py-2.5 rounded-xl bg-slate-100 text-brand-slate text-xs font-semibold hover:bg-slate-200 transition"
                >
                  Use Credits in Customizer
                </Link>
              ) : (
                <span className="block w-full text-center py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-brand-muted">
                  Stripe Checkout Ready (Configure Keys)
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-brand-muted flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Failed AI generations automatically restore deducted credits via atomic
          database transactions.
        </span>
      </div>
    </div>
  );
}
