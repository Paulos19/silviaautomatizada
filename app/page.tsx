import { IrisScrollytellingExperience } from "@/components/landing/IrisScrollytellingExperience";
import { LandingScrollWrapper } from "@/components/landing/landing-scroll-wrapper";

export default function Home() {
  return (
    <LandingScrollWrapper>
      {/* Experiência Flagship de Scrollytelling 3D com GSAP */}
      {/* Zero cards, textos saindo das cordas para os lados, sem sobreposição, vídeo removido e footer desobstruído */}
      <IrisScrollytellingExperience />
    </LandingScrollWrapper>
  );
}
