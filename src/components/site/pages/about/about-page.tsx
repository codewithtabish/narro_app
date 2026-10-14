import { CollageSection } from "./collage"
import { AboutHero } from "./hero"
import { StorySection } from "./story"
import { TeamSection } from "./team"

const AboutFullPage = () => {
  return (
    <main>
        <AboutHero/>
        <StorySection/>
        <TeamSection/>
        <CollageSection/>
    
      
    </main>
  )
}

export default AboutFullPage
