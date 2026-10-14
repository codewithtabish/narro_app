import { Container } from "@/components/site/general/layout/container";
import { AppNavbar } from "@/components/site/loged/general/app-navbar";
import { AppTabBar } from "@/components/site/loged/general/app-tab-bar";
import { OnboardingGate } from "@/components/site/loged/onboarding/onboarding-gate";
import { OnboardingGateFallback } from "@/components/site/loged/onboarding/onboarding-gate-fallback";
import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  App Layout                                                                 */
/* -------------------------------------------------------------------------- */
/**
 * Wraps every /app/* route.
 *
 * - Static chrome (navbar, main, tab bar) prerenders instantly.
 * - <OnboardingGate /> streams in via Suspense — it awaits auth + DB
 *   without blocking the shell.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <div className="flex min-h-screen w-full flex-col">
        {/* Top navbar */}
        <AppNavbar />

        {/* Main content — flex-1 so the tab bar stays at the bottom */}
        <main className="flex-1 pb-24 pt-4 sm:pb-24 sm:pt-6 lg:pb-10 lg:pt-8">
          {children}
        </main>

        {/* Bottom tab bar (mobile only — hidden on lg+ via its own classes) */}
        <AppTabBar />
      </div>

      {/* Onboarding gate — streams in, does NOT block the shell */}
      <React.Suspense fallback={<OnboardingGateFallback />}>
        <OnboardingGate />
      </React.Suspense>
    </Container>
  );
}