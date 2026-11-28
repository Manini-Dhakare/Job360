"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/api";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingSections } from "@/components/landing/LandingSections";

export default function HomePage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(!!getStoredToken());
  }, []);

  const handleProtectedNav = (targetPath: string) => {
    if (getStoredToken()) {
      router.push(targetPath);
    } else {
      router.push(`/login?next=${encodeURIComponent(targetPath)}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-white text-brand-slate">
      <LandingNavbar hasSession={hasSession} />
      <HeroSection hasSession={hasSession} onProtectedNav={handleProtectedNav} />
      <LandingSections
        hasSession={hasSession}
        onProtectedNav={handleProtectedNav}
      />
    </main>
  );
}
