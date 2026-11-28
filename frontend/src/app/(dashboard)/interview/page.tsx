"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Send,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui/Feedback";
import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface InterviewQ {
  q_id: string;
  company_name: string;
  role_category: string;
  question_type: "BEHAVIORAL" | "TECHNICAL" | "CODING";
  question_text: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  star_answer: {
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
  };
}

interface EvalFeedback {
  score: number;
  word_count: number;
  star_check: { situation: boolean; action: boolean; result: boolean };
  feedback: string[];
}

function InterviewStudioContent() {
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get("company") || "";

  const [mode, setMode] = useState<"company" | "overall">(
    initialCompany ? "company" : "overall"
  );
  const [selectedCompany, setSelectedCompany] = useState(initialCompany);
  const [questionType, setQuestionType] = useState<string>("ALL");
  const [companies, setCompanies] = useState<string[]>([]);
  const [questions, setQuestions] = useState<InterviewQ[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [evalResults, setEvalResults] = useState<Record<string, EvalFeedback>>({});
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (mode === "overall") {
        params.company = "overall";
      } else if (selectedCompany) {
        params.company = selectedCompany;
      }
      if (questionType !== "ALL") {
        params.question_type = questionType;
      }

      const res = await apiClient.get("/interview/questions", { params });
      const data = res.data.data;
      setCompanies(data.companies || []);
      setQuestions(data.questions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [mode, selectedCompany, questionType]);

  const handleEvaluate = async (q: InterviewQ) => {
    const answer = practiceAnswers[q.q_id] || "";
    if (!answer.trim()) return;
    setEvaluatingId(q.q_id);
    try {
      const res = await apiClient.post("/interview/evaluate-answer", {
        question_text: q.question_text,
        answer,
        company_name: q.company_name,
      });
      setEvalResults((prev) => ({ ...prev, [q.q_id]: res.data.data }));
    } finally {
      setEvaluatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Preparation Studio"
        badge={<Badge variant="indigo">STAR Rubric</Badge>}
        description="Switch between Company-Specific questions and Overall engineering prep with STAR model answers & practice feedback."
        actions={
          <div className="inline-flex rounded-xl bg-white border border-slate-200 p-1 shadow-2xs">
            <button
              onClick={() => setMode("overall")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === "overall"
                  ? "bg-brand-indigo text-white shadow-sm"
                  : "text-brand-slate hover:bg-slate-50"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Overall Prep
            </button>
            <button
              onClick={() => setMode("company")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                mode === "company"
                  ? "bg-brand-indigo text-white shadow-sm"
                  : "text-brand-slate hover:bg-slate-50"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Company-Specific
            </button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
        {mode === "company" ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Company:
            </span>
            <button
              onClick={() => setSelectedCompany("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                selectedCompany === ""
                  ? "bg-indigo-50 border-brand-indigo text-brand-indigo"
                  : "border-slate-200 text-brand-slate hover:bg-slate-50"
              }`}
            >
              All Companies
            </button>
            {companies.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  selectedCompany.toLowerCase() === c.toLowerCase()
                    ? "bg-indigo-50 border-brand-indigo text-brand-indigo"
                    : "border-slate-200 text-brand-slate hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-medium text-brand-muted">
            Showing core Overall Behavioral, System Design &amp; Coding questions
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "BEHAVIORAL", "TECHNICAL", "CODING"].map((cat) => (
            <button
              key={cat}
              onClick={() => setQuestionType(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                questionType === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-brand-slate hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<BrainCircuit className="w-6 h-6" />}
          title="No questions found for this filter"
          description="Try switching to All Companies or Overall Prep."
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const isOpen = expandedId === q.q_id;
            const evalData = evalResults[q.q_id];

            return (
              <Card key={q.q_id} className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="indigo">{q.company_name}</Badge>
                      <Badge variant="default">{q.question_type}</Badge>
                      <Badge variant="amber">{q.difficulty}</Badge>
                      <span className="text-xs text-brand-muted font-medium">
                        {q.role_category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-brand-slate">
                      {q.question_text}
                    </h3>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(isOpen ? null : q.q_id)}
                  >
                    {isOpen ? (
                      <>
                        Hide STAR &amp; Practice <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        View STAR Answer &amp; Practice <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {isOpen && (
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* STAR Model Answer */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-indigo flex items-center gap-1.5">
                        <BrainCircuit className="w-4 h-4" />
                        STAR Model Answer
                      </h4>
                      <div className="text-xs space-y-2 text-slate-700 leading-relaxed">
                        <p>
                          <strong>Situation:</strong> {q.star_answer.situation}
                        </p>
                        <p>
                          <strong>Task:</strong> {q.star_answer.task}
                        </p>
                        <p>
                          <strong>Action:</strong> {q.star_answer.action}
                        </p>
                        <p>
                          <strong>Result:</strong> {q.star_answer.result}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Practice */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-brand-slate block">
                        Practice Your Answer (STAR Rubric)
                      </label>
                      <textarea
                        rows={4}
                        value={practiceAnswers[q.q_id] || ""}
                        onChange={(e) =>
                          setPracticeAnswers((prev) => ({
                            ...prev,
                            [q.q_id]: e.target.value,
                          }))
                        }
                        placeholder="Draft your Situation, Task, Action, and measurable Result..."
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEvaluate(q)}
                        loading={evaluatingId === q.q_id}
                      >
                        <Send className={`w-3.5 h-3.5 ${evaluatingId === q.q_id ? "hidden" : ""}`} />
                        {evaluatingId === q.q_id ? "Evaluating..." : "Evaluate Answer"}
                      </Button>

                      {evalData && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                          <div className="font-bold text-emerald-800 flex items-center gap-1.5 tabular-nums">
                            <CheckCircle2 className="w-4 h-4" />
                            STAR Readiness Score: {evalData.score}/100 ({evalData.word_count} words)
                          </div>
                          <ul className="list-disc pl-4 text-emerald-900 space-y-0.5">
                            {evalData.feedback.map((f, idx) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <InterviewStudioContent />
    </Suspense>
  );
}
