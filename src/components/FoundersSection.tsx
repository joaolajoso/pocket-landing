import { Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";


const getFounders = (isPt: boolean, lang: string) => [
  {
    name: "Victor De Julio",
    role: isPt ? "Fundador / Marketer & Empreendedor" :
          lang === 'es' ? "Fundador / Marketer & Emprendedor" :
          lang === 'fr' ? "Fondateur / Marketer & Entrepreneur" :
          "Founder / Marketer & Entrepreneur",
    image: "/lovable-uploads/15c2aa2b-d4e7-4cc0-8b6d-45d3f5302353.png",
    linkedinUrl: "https://www.linkedin.com/in/victor-de-julio-2209bb1b2/",
  },
  {
    name: "Simão Pedro Sil",
    role: isPt ? "Marketing & Estratégia" :
          lang === 'es' ? "Marketing y Estrategia" :
          lang === 'fr' ? "Marketing & Stratégie" :
          "Marketing & Strategy",
    image: "/lovable-uploads/803ac0c9-a174-41d0-ba72-de53113ec883.png",
    linkedinUrl: "https://www.linkedin.com/in/sim%C3%A3o-pedro-sil/",
  },
  {
    name: "João Pedro Lajoso",
    role: isPt ? "Engenheiro de Dados" :
          lang === 'es' ? "Ingeniero de Datos" :
          lang === 'fr' ? "Ingénieur de Données" :
          "Data Engineer",
    image: "/lovable-uploads/b1e6179e-8a36-4c7e-90a8-ffdee8af1e6b.png",
    linkedinUrl: "https://www.linkedin.com/in/joaolajoso/",
  },
];

export default function FoundersSection() {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const founders = getFounders(isPt, language);

  const sectionTitle = isPt ? "Quem Somos" :
    language === 'es' ? "Quiénes Somos" :
    language === 'fr' ? "Qui Sommes-Nous" :
    "Meet the Team";

  const sectionSubtitle = isPt ? "As pessoas por trás da inovação" :
    language === 'es' ? "Las personas detrás de la innovación" :
    language === 'fr' ? "Les personnes derrière l'innovation" :
    "The people behind the innovation";

  const viewMore = isPt ? "Saber mais sobre nós" :
    language === 'es' ? "Saber más sobre nosotros" :
    language === 'fr' ? "En savoir plus sur nous" :
    "Learn more about us";

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-pocketcv-purple bg-pocketcv-purple/10 px-4 py-2 rounded-full border border-pocketcv-purple/20">
            Team
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 text-foreground">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground mt-2">{sectionSubtitle}</p>
        </div>

        {/* Founders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {founders.map((founder) => (
            <a
              key={founder.name}
              href={founder.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center"
            >
              <div className="relative mb-4 w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-lg">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pocketcv-purple/20 to-[#ff5757]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-pocketcv-purple transition-colors flex items-center gap-1.5">
                {founder.name}
                <Linkedin className="w-4 h-4 text-[#0077b5]" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{founder.role}</p>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-pocketcv-purple font-semibold hover:underline transition-all"
          >
            {viewMore} →
          </Link>
        </div>
      </div>
    </section>
  );
}
