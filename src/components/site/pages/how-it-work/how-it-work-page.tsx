import { TestimonialsSection } from "../marketing/testimonials"
import { FAQSection } from "./faq"
import { FinalCtaSection } from "./final-cta"
import { HowItWorksHero } from "./hero-section"
import { ProgressPreviewSection } from "./progress-preview"
import { Step1Section } from "./step-1"
import { Step2Section } from "./step-2"
import { Step3Section } from "./step-3"
import { WhatYouGetSection } from "./what-you-get"

const HowITWorkPage = () => {
  return (
    <main>
    <HowItWorksHero/>
    <Step1Section/>
    <Step2Section/>
    <Step3Section/>
    <WhatYouGetSection/>
    <ProgressPreviewSection/>
    <TestimonialsSection/>
    <FAQSection/>
    <FinalCtaSection/>
    </main>
  )
}

export default HowITWorkPage
