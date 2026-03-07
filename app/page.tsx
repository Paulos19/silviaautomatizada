import { HeroScrollSequence } from "@/components/landing/hero-scroll-sequence";
import { LandingHeader } from "@/components/landing/landing-header";
import { AboutSection } from "@/components/landing/about-section";
import { VideoSection } from "@/components/landing/video-section";
import { CreatorSection } from "@/components/landing/creator-section";
import { ScrollMorphHero } from "@/components/landing/scroll-morph-hero";
import { DoctorsTimelineSection } from "@/components/landing/doctors-timeline";
import { SchedulingSimulation } from "@/components/landing/scheduling-simulation";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Hero3DSection } from "@/components/ui/3d-hero-section-boxes";
import { SuperFooter } from "@/components/landing/super-footer";
import { ContactSection } from "@/components/landing/contact-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black font-sans selection:bg-teal-500/30">

      {/* 0. Header Desconstruído (Fixo por cima de tudo) */}
      <LandingHeader />

      {/* 1. Secção Hero (Scroll/Flipbook de Vídeo) */}
      <HeroScrollSequence />

      {/* 2. Secção About (Brutalist Typography & Blur Transition) */}
      <div id="about">
        <AboutSection />
      </div>

      {/* 3. Secção Vídeo Cinemático */}
      <VideoSection />

      {/* 4. Secção Creator (White Theme) */}
      <CreatorSection />

      {/* 5. Secção Scroll Morph (Visão do Ecossistema) */}
      <ScrollMorphHero />

      {/* 6. Secção Timeline de Médicos (Client + Server Data Fetching) */}
      <div id="doctors">
        <DoctorsTimelineSection />
      </div>

      {/* 7. Simulação de Agendamento AI */}
      <div id="simulation">
        <SchedulingSimulation />
      </div>

      {/* 8. Depoimentos de Médicos e Gestores */}
      <div id="testimonials">
        <StaggerTestimonials />
      </div>

      {/* 9. Call to Action Final - Fale com a Silvia */}
      <BackgroundPaths />

      {/* 10. Nova Seção 3D Hero para Contato */}
      <Hero3DSection />

      {/* 11. Seção de Contato Zen */}
      <div id="contact">
        <ContactSection />
      </div>

      {/* 12. Super Footer Final */}
      <SuperFooter />
    </div>
  );
}
