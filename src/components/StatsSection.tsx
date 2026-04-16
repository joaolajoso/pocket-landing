import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

const StatsSection = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  const stats = isPt
    ? [
        { value: "3s", label: "Tempo médio de troca de contacto" },
        { value: "92%", label: "Dos follow-ups concluídos a tempo" },
        { value: "∞", label: "Eventos incluídos em cada plano" },
        { value: "€0", label: "Para começar — grátis para sempre" },
      ]
    : language === 'es'
    ? [
        { value: "3s", label: "Tiempo medio de intercambio de contacto" },
        { value: "92%", label: "De los seguimientos completados a tiempo" },
        { value: "∞", label: "Eventos incluidos en cada plan" },
        { value: "€0", label: "Para empezar — gratis para siempre" },
      ]
    : language === 'fr'
    ? [
        { value: "3s", label: "Temps moyen d'échange de contact" },
        { value: "92%", label: "Des relances complétées à temps" },
        { value: "∞", label: "Événements inclus dans chaque plan" },
        { value: "€0", label: "Pour commencer — gratuit pour toujours" },
      ]
    : [
        { value: "3s", label: "Average contact exchange time" },
        { value: "92%", label: "Of follow-ups completed on time" },
        { value: "∞", label: "Events included in every plan" },
        { value: "€0", label: "To get started — forever free" },
      ];

  return (
    <section className="py-16 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 leading-none">
                {stat.value}
              </div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
