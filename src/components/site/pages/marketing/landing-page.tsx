import { AgentsSection } from "./agents"
import { AIPracticeSection } from "./ai-practice"
import { CallsSection } from "./calls"
import { FinalCtaSection } from "./final-cta"
import { HeroSection } from "./hero-section"
import { RoomsSection } from "./rooms"
import { TestimonialsSection } from "./testimonials"

const LandingPage = () => {
  return (
    <main>
      <HeroSection/>
      <AIPracticeSection/>
      <CallsSection/>
      <RoomsSection/>
      <AgentsSection/>
      <TestimonialsSection/>
      <FinalCtaSection/>
      
    </main>
  )
}

export default LandingPage
