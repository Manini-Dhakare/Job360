export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-2xl w-full p-8 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-brand-slate text-center">Candidate Onboarding Wizard</h1>
        <p className="text-xs text-brand-muted text-center">
          Step 1: Personal info | Step 2: Instant Resume Upload | Step 3: Target Role & Location
        </p>
      </div>
    </div>
  );
}
