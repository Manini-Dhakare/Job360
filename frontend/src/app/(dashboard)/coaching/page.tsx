"use client";

import React, { useState } from "react";
import { Loader2, MessageSquare, Send, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/ui/Feedback";
import { Badge, Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const TOPICS = [
  "Resume Review",
  "Career Transition",
  "Salary Negotiation",
  "Outreach Strategy",
];

export default function CoachingPage() {
  const [topic, setTopic] = useState("Resume Review");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Job360 AI Career Coach. Pick a topic above and ask me anything about your resume, skill gaps, or interview roadmap.",
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await apiClient.post("/coaching/chat", {
        topic,
        message: question,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to reach the coaching service right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        title="AI Career Coaching Hub"
        badge={<Badge variant="indigo">Personalized Strategy</Badge>}
        description="Personalized career guidance grounded in your profile and verified resume skills."
      />

      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
              topic === t
                ? "bg-brand-indigo text-white border-brand-indigo shadow-sm"
                : "bg-white text-brand-slate border-slate-200 hover:bg-slate-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <Card className="flex flex-col h-[540px] overflow-hidden">
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed shadow-2xs ${
                  m.role === "user"
                    ? "bg-brand-indigo text-white"
                    : "bg-white border border-slate-200/80 text-brand-slate"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-indigo mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Job360 Coach
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-brand-muted flex items-center gap-2 px-1">
              <Loader2 className="w-4 h-4 animate-spin text-brand-indigo" /> Thinking...
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="p-4 border-t border-slate-100 bg-white flex items-center gap-3"
        >
          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${topic}...`}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
          />
          <Button type="submit" loading={loading}>
            <Send className={`w-4 h-4 ${loading ? "hidden" : ""}`} />
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
