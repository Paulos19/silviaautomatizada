import { HeroScrollSequence } from "@/components/landing/hero-scroll-sequence";
import { LandingHeader } from "@/components/landing/landing-header";
import { AboutSection } from "@/components/landing/about-section";
import { VideoSection } from "@/components/landing/video-section";
import { CreatorSection } from "@/components/landing/creator-section";
import { ScrollMorphHero } from "@/components/landing/scroll-morph-hero";
import { ContactSection } from "@/components/landing/contact-section";
import { SuperFooter } from "@/components/landing/super-footer";
import { ForceDarkTheme } from "@/components/force-dark-theme";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black font-sans selection:bg-teal-500/30">

      <ForceDarkTheme />

      {/* Fixed Header */}
      <LandingHeader />

      {/* 1. Hero — Dive Scroll Video Frames */}
      <HeroScrollSequence />

      {/* 2. Manifesto — "Inteligência que cuida." */}
      <div id="about">
        <AboutSection />
      </div>

      {/* 3. Features — 4 Funções da Silvia */}
      <div id="features">
        <CreatorSection />
      </div>

      {/* 4. Product — Cinematic Video Section */}
      <VideoSection />

      {/* 5. Trust Strip — Stats & Social Proof */}
      <ScrollMorphHero />

      {/* 6. CTA — Final Call to Action */}
      <div id="contact">
        <ContactSection />
      </div>

      {/* 7. Footer */}
      <SuperFooter />
    </div>
  );
}
