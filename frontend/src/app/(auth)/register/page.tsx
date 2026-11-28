"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showPasswordPopup, setShowPasswordPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setShowPasswordPopup(true);
      setErrorMessage("Password must contain at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/register", {
        full_name: fullName.trim(),
        email: email.trim(),
        password: password,
        confirm_password: confirmPassword,
        role: "CANDIDATE",
      });

      if (response.data?.success) {
        setSuccessMessage(
          "Account created successfully! 5 free credits granted. Redirecting to login..."
        );
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 1500);
      } else {
        setErrorMessage(
          response.data?.error?.message || "Registration failed. Please try again."
        );
      }
    } catch (err: any) {
      if (err.message === "Network Error" || err.code === "ERR_NETWORK") {
        setErrorMessage(
          "Network Error: Unable to reach Job360 backend on port 8000. Please make sure the backend is running."
        );
      } else {
        const serverError =
          err.response?.data?.error?.message ||
          err.response?.data?.detail ||
          err.message ||
          "An unexpected error occurred.";
        setErrorMessage(serverError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/40 via-slate-50 to-slate-50 bg-grid-slate flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-100 selection:text-indigo-900 relative">
      {showPasswordPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200 relative">
            <button
              onClick={() => setShowPasswordPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-slate">Invalid Password</h3>
            <p className="mt-2 text-sm text-brand-slate font-medium bg-amber-50 py-2 px-3 rounded-xl border border-amber-200">
              Password must contain at least 8 characters
            </p>
            <button
              type="button"
              onClick={() => setShowPasswordPopup(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-brand-indigo hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition cursor-pointer"
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-indigo to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-brand-slate">
            Job<span className="text-brand-indigo">360</span>
          </span>
        </Link>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-brand-slate">
          Create Your Candidate Account
        </h1>
        <p className="mt-1.5 text-sm text-brand-muted">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-brand-indigo hover:text-indigo-700 transition">
            Sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-saas-lg border border-slate-200/90 rounded-3xl sm:px-10">
          <div className="mb-6 flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-900">
            <CheckCircle2 className="w-4 h-4 text-brand-indigo shrink-0" />
            <span>
              <strong>Welcome Bonus:</strong> New accounts automatically receive{" "}
              <strong>5 free credits</strong> for resume tailoring and AI features.
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-slate">
                Full Name
              </label>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-slate">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-slate">
                  Password
                </label>
                <span className="text-[11px] text-brand-muted">Min. 8 characters</span>
              </div>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => {
                    if (password.length > 0 && password.length < 8) {
                      setShowPasswordPopup(true);
                    }
                  }}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-slate">
                Confirm Password
              </label>
              <div className="mt-1.5 relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo transition"
                />
              </div>
            </div>

            <p className="text-[11px] text-brand-muted leading-relaxed pt-1">
              By creating an account, you agree to Job360&apos;s Terms of Service
              and Privacy Policy. All applications remain candidate-controlled.
            </p>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Up &amp; Claim 5 Credits</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <Link href="/" className="text-xs font-medium text-brand-muted hover:text-brand-indigo transition">
              &larr; Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
