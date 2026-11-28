"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  UploadCloud,
  X,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

const JOB_FUNCTION_GROUPS = [
  {
    category: "Software / Internet / AI",
    subgroups: [
      {
        title: "Engineering",
        roles: [
          "Software Engineer",
          "Full-Stack Engineer",
          "Frontend Engineer",
          "Backend Engineer",
          "AI / ML Engineer",
          "DevOps / Cloud Engineer",
          "QA / SDET Engineer",
        ],
      },
      {
        title: "Data & Product",
        roles: [
          "Data Scientist",
          "Data Analyst",
          "Data Engineer",
          "Product Manager",
          "UI/UX Designer",
        ],
      },
    ],
  },
  {
    category: "Consulting",
    subgroups: [
      {
        title: "IT & Strategy Consulting",
        roles: [
          "Business Analyst",
          "Data Consultant",
          "IT Consultant",
          "Cyber Security Consultant",
          "Business Strategy Consultant",
        ],
      },
    ],
  },
];

const JOB_TYPES = ["Full-time", "Contract", "Part-time", "Internship"] as const;

function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/explore";

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Software Engineer"]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(["Full-time"]);
  const [location, setLocation] = useState("Bengaluru / Remote");
  const [openToRemote, setOpenToRemote] = useState(true);
  const [yoe, setYoe] = useState("2");
  const [needsSponsorship, setNeedsSponsorship] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [openGroup, setOpenGroup] = useState<string>("Software / Internet / AI");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleJobType = (jt: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(jt) ? prev.filter((j) => j !== jt) : [...prev, jt]
    );
  };

  const handleFinish = async () => {
    setError(null);
    setLoading(true);
    try {
      let resumeId: string | undefined;
      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        const uploadRes = await apiClient.post("/resumes/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        resumeId = uploadRes.data?.data?.resume_id;
      }

      await apiClient.post("/auth/onboarding/complete", {
        target_role: selectedRoles.join(", ") || "Software Engineer",
        yoe: parseFloat(yoe) || 0,
        location: location || "Remote",
        remote_pref: openToRemote ? "REMOTE" : "HYBRID",
        resume_id: resumeId,
      });
      router.push(nextPath);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.detail ||
          "Could not save onboarding preferences."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-slate-50 to-slate-50 bg-grid-slate flex flex-col items-center py-10 px-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-indigo to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-brand-slate">
          Job<span className="text-brand-indigo">360</span>
        </span>
      </div>

      {/* Role Picker Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[82vh] flex flex-col border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-slate">Job Function</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Please select/enter your expected job function"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo"
              />

              {JOB_FUNCTION_GROUPS.map((group) => {
                const isOpen = openGroup === group.category || roleSearch.trim().length > 0;
                return (
                  <div
                    key={group.category}
                    className="rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroup(isOpen ? "" : group.category)
                      }
                      className="w-full px-4 py-3 bg-white flex items-center justify-between text-sm font-bold text-brand-slate hover:bg-slate-50 cursor-pointer"
                    >
                      <span>{group.category}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                        {group.subgroups.map((sg) => {
                          const filtered = sg.roles.filter((r) =>
                            r.toLowerCase().includes(roleSearch.toLowerCase())
                          );
                          if (filtered.length === 0) return null;
                          return (
                            <div key={sg.title} className="space-y-2">
                              <p className="text-xs font-semibold text-brand-slate">
                                {sg.title}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {filtered.map((role) => {
                                  const active = selectedRoles.includes(role);
                                  return (
                                    <button
                                      key={role}
                                      type="button"
                                      onClick={() => toggleRole(role)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                                        active
                                          ? "bg-indigo-50 border-brand-indigo text-brand-indigo font-semibold"
                                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                      }`}
                                    >
                                      {role}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-brand-muted">
                <strong>{selectedRoles.length}</strong> role(s) selected
              </span>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="px-5 py-2 rounded-xl bg-brand-indigo text-white text-sm font-semibold hover:bg-indigo-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-saas-lg p-7 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-lg font-extrabold text-brand-slate">
              Hi, I&apos;m Orion, your AI Copilot for job search.
            </h1>
            <p className="text-sm text-brand-muted mt-0.5">
              {step === 1
                ? "Now, what type of role are you looking for?"
                : "Upload your resume so we can compute Best Match % and ATS Score %."}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-brand-indigo text-xs font-bold border border-indigo-100 shrink-0 tabular-nums">
            Step {step} / 2
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-5">
            {/* Job Function */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-slate block">
                <span className="text-rose-500">*</span> Job Function{" "}
                <span className="text-brand-muted font-normal">
                  (select from drop-down for best results)
                </span>
              </label>

              {selectedRoles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-brand-indigo text-xs font-semibold"
                    >
                      {role}
                      <button type="button" onClick={() => toggleRole(role)} className="cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowRoleModal(true)}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-brand-slate flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Role
              </button>
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-slate block">
                <span className="text-rose-500">*</span> Job Type
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {JOB_TYPES.map((jt) => {
                  const checked = selectedJobTypes.includes(jt);
                  return (
                    <button
                      key={jt}
                      type="button"
                      onClick={() => toggleJobType(jt)}
                      className={`px-3.5 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2.5 transition cursor-pointer ${
                        checked
                          ? "border-emerald-400 bg-emerald-50/40 text-brand-slate"
                          : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          checked
                            ? "bg-emerald-500 text-white"
                            : "bg-white border border-slate-300"
                        }`}
                      >
                        {checked && <Check className="w-3 h-3" />}
                      </span>
                      {jt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-brand-slate block">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Anywhere in India / US"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50/70 focus:bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-slate block">
                  Experience (Yrs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={yoe}
                  onChange={(e) => setYoe(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50/70 focus:bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo"
                />
              </div>
            </div>

            {/* Open to Remote */}
            <button
              type="button"
              onClick={() => setOpenToRemote(!openToRemote)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm font-medium text-brand-slate flex items-center gap-2.5 cursor-pointer"
            >
              <span
                className={`w-4 h-4 rounded flex items-center justify-center ${
                  openToRemote
                    ? "bg-emerald-500 text-white"
                    : "bg-white border border-slate-300"
                }`}
              >
                {openToRemote && <Check className="w-3 h-3" />}
              </span>
              Open to Remote
            </button>

            {/* Work Authorization */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate block">
                Work Authorization
              </label>
              <button
                type="button"
                onClick={() => setNeedsSponsorship(!needsSponsorship)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm font-medium text-brand-slate flex items-center gap-2.5 cursor-pointer"
              >
                <span
                  className={`w-4 h-4 rounded flex items-center justify-center ${
                    needsSponsorship
                      ? "bg-emerald-500 text-white"
                      : "bg-white border border-slate-300"
                  }`}
                >
                  {needsSponsorship && <Check className="w-3 h-3" />}
                </span>
                H1B / Visa sponsorship
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-indigo text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <label className="block border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-indigo bg-slate-50/60 transition">
              <UploadCloud className="w-9 h-9 text-brand-indigo mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-slate">
                {resumeFile
                  ? resumeFile.name
                  : "Upload your Resume (PDF or DOCX)"}
              </p>
              <p className="text-xs text-brand-muted mt-1">
                Powers Best Match % and ATS Compatibility % across all Explore jobs
              </p>
              <input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
            </label>

            {resumeFile && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Ready to parse: {resumeFile.name}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-brand-slate hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-indigo text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {resumeFile
                  ? "Finish & Explore Jobs"
                  : "Skip Resume & Explore Jobs"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <OnboardingWizard />
    </Suspense>
  );
}
