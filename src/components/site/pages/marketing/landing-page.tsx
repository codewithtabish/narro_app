import { Suspense } from "react";

import { CommunitySection } from "./public/community-section";
import { FeaturesRow } from "./public/features-row";
import { HomepageAgents } from "./public/homepage-agents"; // <-- Imported
import { HomepageCommunity, HomepageCommunitySkeleton } from "./public/homepage-community";
import { HomepageRooms, HomepageRoomsSkeleton } from "./public/homepage-rooms";
import { MobileAppSection } from "./public/mobile-app-section";
import { TestimonialsSection } from "./public/testimonials-section";

const LandingPage = () => {
  return (
    <main>
      <CommunitySection />
      <FeaturesRow />

      {/* ================================================================ */}
      {/* REAL DATA SECTIONS                                               */}
      {/* ================================================================ */}
      
      {/* 1. Community Users Preview (6 real users from DB) */}
      <Suspense fallback={<HomepageCommunitySkeleton />}>
        <HomepageCommunity />
      </Suspense>

      {/* 2. Live Rooms Preview (Mocked data) */}
      <Suspense fallback={<HomepageRoomsSkeleton />}>
        <HomepageRooms />
      </Suspense>

      {/* 3. AI Agents Preview (Static data - No Suspense needed) */}
      <HomepageAgents />

      <TestimonialsSection />
      <MobileAppSection />
    </main>
  );
};

export default LandingPage;