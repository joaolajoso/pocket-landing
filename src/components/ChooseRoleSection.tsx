import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { User, Building2, CalendarCheck } from "lucide-react";
import { Language } from "@/contexts/LanguageContext";

const getRoles = (lang: Language) => {
  const isPt = isPortuguese(lang);
  const isEs = lang === 'es';
  const isFr = lang === 'fr';

  return [
    {
      key: "solo",
      icon: User,
      title: isPt ? "Profissional Solo" : isEs ? "Profesional Solo" : isFr ? "Professionnel Solo" : "Solo Professional",
      description: isPt
        ? "Crie o seu perfil digital, partilhe com um toque e faça crescer a sua rede de contactos."
        : isEs
        ? "Crea tu perfil digital, comparte con un toque y haz crecer tu red de contactos."
        : isFr
        ? "Créez votre profil numérique, partagez d'un geste et développez votre réseau."
        : "Create your digital profile, share with a tap and grow your network effortlessly.",
      cta: isPt ? "Começar Agora" : isEs ? "Empezar Ahora" : isFr ? "Commencer" : "Get Started",
      href: "/login",
    },
    {
      key: "business",
      icon: Building2,
      title: isPt ? "Empresas & Equipas" : isEs ? "Empresas y Equipos" : isFr ? "Entreprises & Équipes" : "Business & Teams",
      description: isPt
        ? "Equipe a sua equipa com cartões inteligentes, capture leads e meça resultados em tempo real."
        : isEs
        ? "Equipa a tu equipo con tarjetas inteligentes, captura leads y mide resultados en tiempo real."
        : isFr
        ? "Équipez votre équipe de cartes intelligentes, capturez des leads et mesurez les résultats en temps réel."
        : "Equip your team with smart cards, capture leads and measure results in real time.",
      cta: isPt ? "Saber Mais" : isEs ? "Saber Más" : isFr ? "En Savoir Plus" : "Learn More",
      href: "/forbusinesses",
    },
    {
      key: "organizer",
      icon: CalendarCheck,
      title: isPt ? "Organizadores de Eventos" : isEs ? "Organizadores de Eventos" : isFr ? "Organisateurs d'Événements" : "Event Organizers",
      description: isPt
        ? "Digitalize os seus eventos, conecte participantes e obtenha métricas de engagement detalhadas."
        : isEs
        ? "Digitaliza tus eventos, conecta participantes y obtén métricas de engagement detalladas."
        : isFr
        ? "Digitalisez vos événements, connectez les participants et obtenez des métriques d'engagement détaillées."
        : "Digitalize your events, connect attendees and get detailed engagement metrics.",
      cta: isPt ? "Saber Mais" : isEs ? "Saber Más" : isFr ? "En Savoir Plus" : "Learn More",
      href: "/eventspocketcv",
    },
  ];
};

export default function ChooseRoleSection() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const roles = getRoles(language);
  const isPt = isPortuguese(language);
  const isEs = language === 'es';
  const isFr = language === 'fr';

  const heading = isPt ? "Quem é você?" : isEs ? "¿Quién eres?" : isFr ? "Qui êtes-vous ?" : "Who are you?";
  const subheading = isPt
    ? "Escolha o seu papel e comece a sua revolução no networking"
    : isEs
    ? "Elige tu rol y comienza tu revolución en el networking"
    : isFr
    ? "Choisissez votre rôle et lancez votre révolution networking"
    : "Choose your role and start your own networking revolution";

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-pocketcv-purple bg-pocketcv-purple/10 px-4 py-2 rounded-full border border-pocketcv-purple/20">
            {isPt ? "Comece Aqui" : isEs ? "Empieza Aquí" : isFr ? "Commencez Ici" : "Start Here"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 text-foreground">
            {heading}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            {subheading}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.key}
                onClick={() => navigate(role.href)}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-border bg-card hover:border-pocketcv-purple/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-pocketcv-purple/10 flex items-center justify-center mb-5 group-hover:bg-pocketcv-purple/20 transition-colors">
                  <Icon className="w-7 h-7 text-pocketcv-purple" />
                </div>

                {/* Text */}
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-pocketcv-purple transition-colors">
                  {role.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {role.description}
                </p>

                {/* CTA */}
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-pocketcv-purple">
                  {role.cta} →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
