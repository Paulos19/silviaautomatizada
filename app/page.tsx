import { LandingHeader } from "@/components/landing/landing-header";
import { HeroFuturistic } from "@/components/landing/hero-futuristic";
import { DeconstructedFeatures } from "@/components/landing/deconstructed-features";
import { N8nFeaturesGrid } from "@/components/landing/n8n-features-grid";
import { ScrollDiveShowcase } from "@/components/landing/scroll-dive-showcase";
import { VideoSection } from "@/components/landing/video-section";
import { ScrollMorphHero } from "@/components/landing/scroll-morph-hero";
import { ContactSection } from "@/components/landing/contact-section";
import { SuperFooter } from "@/components/landing/super-footer";
import { LandingScrollWrapper } from "@/components/landing/landing-scroll-wrapper";

export default function Home() {
  return (
    <LandingScrollWrapper>
      {/* Dynamic Header */}
      <LandingHeader />

      {/* 1. Light Theme Hero */}
      <HeroFuturistic />

      {/* 2. Deconstructed Modules - Light */}
      <div id="features">
        <DeconstructedFeatures />
      </div>

      {/* 3. n8n Integrations - Light Bento Grid */}
      <div id="n8n-features">
        <N8nFeaturesGrid />
      </div>

      {/* 4. The Dive - Dark Cinematic Showcase */}
      <div id="core">
        <ScrollDiveShowcase />
      </div>

      {/* 5. Product — Cinematic Video Section */}
      <VideoSection />

      {/* 6. Trust Strip — Stats & Social Proof */}
      <ScrollMorphHero />

      {/* 7. CTA — Final Call to Action */}
      <div id="contact">
        <ContactSection />
      </div>

      {/* 8. Footer */}
      <SuperFooter />
    </LandingScrollWrapper>
  );
}
