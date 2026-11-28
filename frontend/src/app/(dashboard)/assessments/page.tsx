"use client";

import React, { useEffect, useState } from "react";
import { Award, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PageHeader, Skeleton } from "@/components/ui/Feedback";
import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Quiz {
  quiz_id: string;
  title: string;
  skill: string;
  questions: {
    id: string;
    question: string;
    options: string[];
  }[];
}

export default function AssessmentsPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get("/assessments/quizzes");
        const list: Quiz[] = res.data.data || [];
        setQuizzes(list);
        if (list.length > 0) setActiveQuiz(list[0]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    const res = await apiClient.post("/assessments/submit", {
      quiz_id: activeQuiz.quiz_id,
      answers,
    });
    setResult(res.data.data);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Skill Assessments & Badges"
        badge={<Badge variant="emerald">60%+ Pass Threshold</Badge>}
        description="Pass scenario-based technical quizzes (60%+) to earn Verified Skill Badges."
      />

      {loading ? (
        <Skeleton className="h-80 w-full rounded-2xl" />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {quizzes.map((q) => (
              <button
                key={q.quiz_id}
                onClick={() => {
                  setActiveQuiz(q);
                  setAnswers({});
                  setResult(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                  activeQuiz?.quiz_id === q.quiz_id
                    ? "bg-brand-indigo text-white border-brand-indigo shadow-sm"
                    : "bg-white text-brand-slate border-slate-200 hover:bg-slate-50"
                }`}
              >
                {q.title}
              </button>
            ))}
          </div>

          {activeQuiz && (
            <Card className="p-6 space-y-6">
              {activeQuiz.questions.map((item, idx) => (
                <div key={item.id} className="space-y-3">
                  <p className="text-sm font-bold text-brand-slate">
                    {idx + 1}. {item.question}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {item.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`p-3.5 rounded-xl border text-xs font-medium cursor-pointer flex items-center gap-2.5 transition ${
                          answers[item.id] === optIdx
                            ? "bg-indigo-50 border-brand-indigo text-brand-indigo font-semibold"
                            : "bg-slate-50/70 border-slate-200 text-brand-slate hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={item.id}
                          checked={answers[item.id] === optIdx}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [item.id]: optIdx }))
                          }
                          className="accent-brand-indigo"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-100">
                <Button onClick={handleSubmit}>Submit Assessment</Button>
              </div>

              {result && (
                <div
                  className={`p-4 rounded-2xl border text-sm flex items-center justify-between ${
                    result.passed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <div>
                    <p className="font-bold tabular-nums">
                      Score: {result.score}% ({result.correct}/{result.total} correct)
                    </p>
                    <p className="text-xs mt-0.5">
                      {result.passed
                        ? `Congratulations! Earned ${result.badge}`
                        : "Score 60%+ to earn the Verified Skill Badge."}
                    </p>
                  </div>
                  {result.passed ? (
                    <Award className="w-7 h-7 text-emerald-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
