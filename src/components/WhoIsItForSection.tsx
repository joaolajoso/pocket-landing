import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const WhoIsItForSection = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Cards slide up sequentially — no opacity fade, just translateY
  // The section is tall (sticky) so scroll drives the card positions
  const card1Y = useTransform(scrollYProgress, [0.05, 0.3], [200, 0]);
  const card2Y = useTransform(scrollYProgress, [0.2, 0.5], [200, 0]);
  const card3Y = useTransform(scrollYProgress, [0.35, 0.65], [200, 0]);

  const cardYValues = [card1Y, card2Y, card3Y];

  const t = isPt
    ? {
        label: "Feito para todos na sala",
        headings: ["Participa.", "Gere.", "Organiza."],
        cards: [
          {
            icon: "🧑‍💼",
            title: "Profissionais individuais",
            description:
              "Vai a eventos para crescer a sua rede. A PocketCV garante que cada conversa se torna um contacto — e cada contacto se torna uma oportunidade.",
            features: [
              "Perfil digital partilhável em segundos",
              "50 contactos grátis, ilimitados no Pro",
              "Follow-ups que funcionam sozinhos",
              "Pronto para CRM, sempre",
            ],
            link: "/pricing/solo",
            linkText: "Para profissionais →",
          },
          {
            icon: "🏢",
            title: "Equipas & expositores",
            description:
              "A sua equipa está em cada evento para captar leads. A PocketCV transforma cada membro num gerador de leads proativo com visibilidade total.",
            features: [
              "Dashboard unificado de equipa",
              "Todos os eventos incluídos",
              "Sequências automáticas de follow-up",
              "Perfis white-label nos planos maiores",
            ],
            link: "/pricing",
            linkText: "Para equipas →",
          },
          {
            icon: "🎪",
            title: "Organizadores de eventos",
            description:
              "Reúne audiências. A PocketCV dá-lhe os dados para provar o valor — a patrocinadores, expositores e participantes do próximo ano.",
            features: [
              "Dados de engagement em tempo real",
              "Dashboards de patrocinadores",
              "Check-in de sessões e stands",
              "Relatórios de ROI pós-evento",
            ],
            link: "/pricing",
            linkText: "Para organizadores →",
          },
        ],
      }
    : language === "es"
    ? {
        label: "Hecho para todos en la sala",
        headings: ["Participa.", "Gestiona.", "Organiza."],
        cards: [
          {
            icon: "🧑‍💼",
            title: "Profesionales individuales",
            description:
              "Vas a eventos para crecer tu red. PocketCV asegura que cada conversación se convierte en un contacto — y cada contacto en una oportunidad.",
            features: [
              "Perfil digital compartible en segundos",
              "50 contactos gratis, ilimitados en Pro",
              "Seguimientos que funcionan solos",
              "Listo para CRM, siempre",
            ],
            link: "/pricing/solo",
            linkText: "Para profesionales →",
          },
          {
            icon: "🏢",
            title: "Equipos y expositores",
            description:
              "Tu equipo está en cada evento para captar leads. PocketCV transforma a cada miembro en un generador proactivo de leads.",
            features: [
              "Dashboard unificado de equipo",
              "Todos los eventos incluidos",
              "Secuencias automáticas de follow-up",
              "Perfiles white-label en planes mayores",
            ],
            link: "/pricing",
            linkText: "Para equipos →",
          },
          {
            icon: "🎪",
            title: "Organizadores de eventos",
            description:
              "Reúnes audiencias. PocketCV te da los datos para demostrar el valor — a patrocinadores, expositores y asistentes del próximo año.",
            features: [
              "Datos de engagement en tiempo real",
              "Dashboards de patrocinadores",
              "Check-in de sesiones y stands",
              "Informes de ROI post-evento",
            ],
            link: "/pricing",
            linkText: "Para organizadores →",
          },
        ],
      }
    : language === "fr"
    ? {
        label: "Conçu pour tous dans la salle",
        headings: ["Participe.", "Gère.", "Organise."],
        cards: [
          {
            icon: "🧑‍💼",
            title: "Professionnels individuels",
            description:
              "Vous allez aux événements pour développer votre réseau. PocketCV s'assure que chaque conversation devient un contact — et chaque contact une opportunité.",
            features: [
              "Profil digital partageable en secondes",
              "50 contacts gratuits, illimités en Pro",
              "Relances automatiques",
              "Prêt pour le CRM, toujours",
            ],
            link: "/pricing/solo",
            linkText: "Pour les professionnels →",
          },
          {
            icon: "🏢",
            title: "Équipes et exposants",
            description:
              "Votre équipe est à chaque événement pour capturer des leads. PocketCV transforme chaque membre en générateur de leads proactif.",
            features: [
              "Dashboard d'équipe unifié",
              "Tous les événements inclus",
              "Séquences de relance automatiques",
              "Profils en marque blanche",
            ],
            link: "/pricing",
            linkText: "Pour les équipes →",
          },
          {
            icon: "🎪",
            title: "Organisateurs d'événements",
            description:
              "Vous rassemblez les audiences. PocketCV vous donne les données pour prouver la valeur — aux sponsors, exposants et participants.",
            features: [
              "Données d'engagement en temps réel",
              "Tableaux de bord sponsors",
              "Check-in sessions et stands",
              "Rapports ROI post-événement",
            ],
            link: "/pricing",
            linkText: "Pour les organisateurs →",
          },
        ],
      }
    : {
        label: "Built for everyone in the room",
        headings: ["Attend.", "Manage.", "Organize."],
        cards: [
          {
            icon: "🧑‍💼",
            title: "Solo professionals",
            description:
              "You go to events to grow your network. PocketCV makes sure every conversation becomes a contact — and every contact becomes an opportunity.",
            features: [
              "Shareable digital profile in seconds",
              "50 contacts free, unlimited on Pro",
              "Follow-ups that run themselves",
              "CRM-ready, always",
            ],
            link: "/pricing/solo",
            linkText: "For solo professionals →",
          },
          {
            icon: "🏢",
            title: "Business teams & exhibitors",
            description:
              "Your team is at every event to capture leads. PocketCV turns each team member into a proactive lead generator with full visibility for the manager.",
            features: [
              "Unified team dashboard",
              "Every event included, no extra fees",
              "Automated follow-up sequences",
              "White-label profiles on larger plans",
            ],
            link: "/pricing",
            linkText: "For business teams →",
          },
          {
            icon: "🎪",
            title: "Event organizers",
            description:
              "You bring the audience together. PocketCV gives you the data to prove its worth — to sponsors, exhibitors, and next year's attendees.",
            features: [
              "Real-time attendee engagement data",
              "Sponsor & exhibitor dashboards",
              "Session and booth check-in",
              "Post-event ROI reports",
            ],
            link: "/pricing",
            linkText: "For event organizers →",
          },
        ],
      };

  return (
    <section
      ref={sectionRef}
      id="who"
      className="relative bg-muted/30"
      // Tall section to create scroll room for the sticky animation
      style={{ height: "300vh" }}
    >
      {/* Sticky container — stays fixed while user scrolls through the tall section */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-clip">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl w-full pb-8">
          {/* Section label — centered */}
          <div className="text-center mb-6 md:mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-pocketcv-purple block">
              {t.label}
            </span>
          </div>

          {/* 3-column layout: headings aligned to card tops */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5">
            {t.cards.map((card, i) => (
              <div key={i} className="flex flex-col items-center md:items-start">
                {/* Large heading — centered in column */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-5 md:mb-6 text-center md:text-left w-full">
                  {t.headings[i]}
                </h2>

                {/* Card that slides up driven by scroll — no opacity change */}
                <motion.div
                  style={{ y: cardYValues[i] }}
                  className="bg-background border border-border rounded-2xl p-5 w-full flex flex-col hover:border-pocketcv-purple/30 transition-colors duration-300 group"
                >
                  {/* Illustration area */}
                  <div className="h-28 md:h-32 rounded-xl bg-muted/50 mb-4 flex items-center justify-center overflow-hidden relative">
                    <div className="text-4xl md:text-5xl">{card.icon}</div>
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-pocketcv-purple/10" />
                    <div className="absolute bottom-4 left-4 w-5 h-5 rounded-full bg-pocketcv-purple/5" />
                  </div>

                  {/* Title & description */}
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {card.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-5">
                    {card.features.map((f, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-pocketcv-purple flex-shrink-0 mt-1.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA link */}
                  <Link
                    to={card.link}
                    className="text-sm font-semibold text-foreground hover:text-pocketcv-purple transition-colors inline-flex items-center gap-1 group-hover:gap-2"
                  >
                    {card.linkText}
                  </Link>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoIsItForSection;
