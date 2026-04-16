import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

const MarqueeSection = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  const items = isPt
    ? [
        "Partilha instantânea de contactos",
        "Captura de leads em segundos",
        "Follow-ups automatizados",
        "Analítica de eventos em tempo real",
        "Exportações prontas para CRM",
        "Sem app necessário para quem recebe",
        "Eventos ilimitados",
        "Conforme RGPD",
        "Partilha via QR & NFC",
        "Dashboards de performance de equipa",
      ]
    : language === 'es'
    ? [
        "Intercambio instantáneo de contactos",
        "Captura de leads en segundos",
        "Seguimientos automatizados",
        "Analítica de eventos en tiempo real",
        "Exportaciones listas para CRM",
        "Sin app necesaria para el receptor",
        "Eventos ilimitados",
        "Compatible con RGPD",
        "Compartir vía QR & NFC",
        "Dashboards de rendimiento del equipo",
      ]
    : language === 'fr'
    ? [
        "Partage instantané de contacts",
        "Capture de leads en secondes",
        "Relances automatisées",
        "Analytique événementielle en temps réel",
        "Exports prêts pour le CRM",
        "Aucune app requise pour le destinataire",
        "Événements illimités",
        "Conforme RGPD",
        "Partage QR & NFC",
        "Tableaux de bord de performance",
      ]
    : [
        "Instant contact sharing",
        "Lead capture in seconds",
        "Automated follow-ups",
        "Real-time event analytics",
        "CRM-ready exports",
        "No app needed for recipients",
        "Unlimited events",
        "GDPR compliant",
        "QR & NFC sharing",
        "Team performance dashboards",
      ];

  // Duplicate for seamless loop
  const allItems = [...items, ...items];

  return (
    <div className="py-4 border-t border-b border-border/50 overflow-hidden bg-muted/30">
      <div className="flex gap-12 w-max animate-marquee-scroll">
        {allItems.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-pocketcv-purple/50 flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeSection;
