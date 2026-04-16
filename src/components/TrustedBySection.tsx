import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { AnimatedGroup } from "@/components/ui/animated-group";
import eneebLogo from "@/assets/partners/eneeb.png";
import aegiaLogo from "@/assets/partners/aegia.png";
import atualizateLogo from "@/assets/partners/atualizate.png";
import tedxLogo from "@/assets/partners/tedx-aveiro.png";

const partners = [
  { src: eneebLogo, alt: "ENEEB", height: 56 },
  { src: aegiaLogo, alt: "AEGIA", height: 56 },
  { src: atualizateLogo, alt: "Atualiza-te", height: 48 },
  { src: tedxLogo, alt: "TEDx Aveiro", height: 44 },
  { src: "/lovable-uploads/d43a5748-6bd1-4d38-8559-f2988dd53ee3.png", alt: "Century21 Confiança", height: 44 },
  { src: "/lovable-uploads/0f42d62d-9544-4dc1-8a77-bd397561ad41.png", alt: "Bella Casa", height: 44 },
  { src: "/lovable-uploads/1a6bda67-f22e-42f4-a5d7-b4029e13d63d.png", alt: "IAD", height: 44 },
  { src: "/lovable-uploads/cf16cd74-2405-4f13-a048-132f85b72e92.png", alt: "iTRecruiter", height: 40 },
];

const transitionVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  },
  item: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring", bounce: 0.3, duration: 1.5 },
    },
  },
};

const TrustedBySection = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto max-w-5xl px-4">
        <p className="text-center text-sm font-medium tracking-wider uppercase text-muted-foreground mb-10">
          {isPt ? "Parceiros que confiam em nós" : "Partners who trust us"}
        </p>

        <AnimatedGroup
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8"
          variants={transitionVariants}
        >
          {partners.map((logo) => (
            <div key={logo.alt} className="flex items-center justify-center grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img
                src={logo.src}
                alt={logo.alt}
                style={{ height: logo.height }}
                className="w-auto object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
};

export default TrustedBySection;
