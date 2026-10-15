import { IrisGlobalCanvas } from "@/components/landing/IrisGlobalCanvas";
import { HeroIrisEditorial } from "@/components/landing/hero-iris-editorial";
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
      {/* 1. Canvas 3D Global em Fundo Branco/Gradiente: Fibras se destrançam ao longo de 100% do scroll da LP */}
      <IrisGlobalCanvas />

      {/* 2. Hero Editorial 100vh e 100% width em tons brancos e gradientes */}
      <HeroIrisEditorial />

      {/* 3. Recursos & Módulos Clínicos */}
      <div id="features" className="relative z-10">
        <DeconstructedFeatures />
      </div>

      {/* 4. Integrações n8n & Automação Inteligente */}
      <div id="n8n-features" className="relative z-10">
        <N8nFeaturesGrid />
      </div>

      {/* 5. Showcase de Inteligência Médica */}
      <div id="core" className="relative z-10">
        <ScrollDiveShowcase />
      </div>

      {/* 6. Vídeo & Demonstração do Produto */}
      <div className="relative z-10">
        <VideoSection />
      </div>

      {/* 7. Prova Social & Números do Hospital */}
      <div className="relative z-10">
        <ScrollMorphHero />
      </div>

      {/* 8. Chamada para Ação / Contato */}
      <div id="contact" className="relative z-10">
        <ContactSection />
      </div>

      {/* 9. Rodapé Oficial */}
      <div className="relative z-10">
        <SuperFooter />
      </div>
    </LandingScrollWrapper>
  );
}
