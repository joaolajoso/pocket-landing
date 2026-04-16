import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

const CTABandSection = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  const t = isPt
    ? {
        title: "A sala está cheia de",
        titleEm: "futuros clientes.",
        subtitle: "Comece grátis hoje. Os seus primeiros 50 contactos são por nossa conta — para sempre, sem cartão necessário.",
        cta: "Comece grátis",
        demo: "Pedir uma demo",
      }
    : language === 'es'
    ? {
        title: "La sala está llena de",
        titleEm: "futuros clientes.",
        subtitle: "Empieza gratis hoy. Tus primeros 50 contactos son por nuestra cuenta — para siempre, sin tarjeta necesaria.",
        cta: "Empieza gratis",
        demo: "Pedir una demo",
      }
    : language === 'fr'
    ? {
        title: "La salle est pleine de",
        titleEm: "futurs clients.",
        subtitle: "Commencez gratuitement aujourd'hui. Vos 50 premiers contacts sont offerts — pour toujours, sans carte nécessaire.",
        cta: "Commencer gratuitement",
        demo: "Demander une démo",
      }
    : {
        title: "The room is full of",
        titleEm: "future clients.",
        subtitle: "Start free today. Your first 50 connections are on us — forever, no card required.",
        cta: "Get started free",
        demo: "Request a demo",
      };

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          {t.title} <br />
          <em className="text-purple-300 italic">{t.titleEm}</em>
        </h2>
        <p className="text-lg text-white/60 mb-10 max-w-lg mx-auto">
          {t.subtitle}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-xl px-7 py-3 text-base font-semibold bg-white text-gray-900 hover:bg-white/90 transition-all shadow-lg"
          >
            {t.cta}
          </Link>
          <a
            href="mailto:pocketcvnetworking@gmail.com?subject=Demo%20Request"
            className="inline-flex items-center justify-center rounded-xl px-7 py-3 text-base font-medium border border-white/30 text-white hover:border-white/60 transition-all"
          >
            {t.demo}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTABandSection;
