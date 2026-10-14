import { CollageSection } from "../about/collage"
import { TestimonialsSection } from "../marketing/testimonials"
import { PricingPlans } from "./plans"

const PricingPage = () => {
  return (
    <main>
        <PricingPlans/>
        <TestimonialsSection/>
        <CollageSection/>
      
    </main>
  )
}

export default PricingPage
