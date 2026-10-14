import { FinalCtaSection } from "../how-it-work/final-cta"
import { CallsSection } from "../marketing/calls"
import { FeatureAIPractice } from "./ai-practice"
import { FeaturesHero } from "./hero"
import { FeatureProgress } from "./progress"
import { FeatureRooms } from "./rooms"

const FeaturesPage = () => {
  return (
    <main>
        <FeaturesHero/>
        <FeatureAIPractice/>
        <CallsSection/>
        <FeatureRooms/>
        <FeatureProgress/>
        <FinalCtaSection/>
      
    </main>
  )
}

export default FeaturesPage
