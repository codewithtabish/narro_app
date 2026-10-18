// src/app/(loged)/app/layout.tsx
import { Container } from "@/components/site/general/layout/container";
import { AppNavbar } from "@/components/site/loged/general/app-navbar";
import { AppTabBar } from "@/components/site/loged/general/app-tab-bar";
import { ClientOnly } from "@/components/site/loged/general/push/client-only";
import { EnablePushBanner } from "@/components/site/loged/general/push/enable-push-banner";
import { OnboardingGate } from "@/components/site/loged/onboarding/onboarding-gate";
import { OnboardingGateFallback } from "@/components/site/loged/onboarding/onboarding-gate-fallback";
import { CallListenerMount } from "@/components/site/pages/community/calling/call-listener-mount";
import * as React from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <div className="flex min-h-screen w-full flex-col">
        <AppNavbar />

        <main className="flex-1 pb-24 pt-4 sm:pb-24 sm:pt-6 lg:pb-10 lg:pt-8">
          <ClientOnly>
            <div className="mx-auto mb-4 w-full max-w-3xl px-4 sm:px-6 lg:px-8">
              <EnablePushBanner />
            </div>
          </ClientOnly>

          {children}
        </main>

        <React.Suspense fallback={<AppTabBarFallback />}>
          <AppTabBar />
        </React.Suspense>
      </div>

      <React.Suspense fallback={<OnboardingGateFallback />}>
        <OnboardingGate />
      </React.Suspense>

      {/* Incoming call listener — remounts per route via key={pathname},
          so state is always fresh. Wrapped in Suspense because usePathname()
          is a runtime hook. */}
      <React.Suspense fallback={null}>
        <CallListenerMount />
      </React.Suspense>
    </Container>
  );
}

function AppTabBarFallback() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-border bg-card/80 backdrop-blur-xl lg:hidden"
    />
  );
}