// src/app/community/layout.tsx
import { Footer } from "@/components/site/general/footers/footer";
import { Container } from "@/components/site/general/layout/container";
import { PublicNavbar } from "@/components/site/general/navbar/public-navbar";
import { ClientOnly } from "@/components/site/loged/general/push/client-only";
import { EnablePushBanner } from "@/components/site/loged/general/push/enable-push-banner";
import { OnboardingGate } from "@/components/site/loged/onboarding/onboarding-gate";
import { OnboardingGateFallback } from "@/components/site/loged/onboarding/onboarding-gate-fallback";
import { CallListenerMount } from "@/components/site/pages/community/calling/call-listener-mount";

// ✅ 1. Import the sound listener
import React, { Suspense } from "react";
import { RoomSoundListener } from "../actions/rooms/room-sound-listener";

type CommunityLayoutProps = {
  children: React.ReactNode;
};

const CommunityLayout = ({ children }: CommunityLayoutProps) => {
  return (
    <div>
      {/* ✅ 2. Mount it globally here */}
      <RoomSoundListener />

      <Container>
        {/* Navbar Suspense for usePathname */}
        <Suspense fallback={<div className="h-[72px] w-full border-b border-border bg-background/85" />}>
          <PublicNavbar />
        </Suspense>

        {/* ✅ ADDED: Push Notification Banner */}
        <ClientOnly>
          <div className="mx-auto my-4 w-full max-w-3xl px-4 sm:px-6 lg:px-8">
            <EnablePushBanner />
          </div>
        </ClientOnly>
        
        {children}
        
        <Footer />
      </Container>

      {/* GLOBAL ONBOARDING GATE */}
      <Suspense fallback={<OnboardingGateFallback />}>
        <OnboardingGate />
      </Suspense>

      {/* GLOBAL INCOMING CALL LISTENER */}
      <Suspense fallback={null}>
        <CallListenerMount />
      </Suspense>
    </div>
  );
};

export default CommunityLayout;