import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

const HowItWorks = () => {
  const { language } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach((el) => observer.observe(el));
    return () => { elements?.forEach((el) => observer.unobserve(el)); };
  }, []);

  const isPt = isPortuguese(language);

  const t = isPt
    ? {
        label: "Como funciona",
        title: "Do aperto de mão",
        titleEm: "ao negócio fechado",
        subtitle: "Quatro passos. Menos de trinta segundos para os três primeiros.",
        steps: [
          { title: "Configure o seu perfil", text: "Crie o seu perfil PocketCV uma vez. Nome, cargo, empresa, links — tudo o que alguém precisa para se lembrar de si." },
          { title: "Partilhe num toque", text: "Mostre o seu QR code ou toque o seu cartão NFC. Acesso instantâneo ao seu perfil — sem app, sem fricção." },
          { title: "Capture e organize", text: "Cada conexão fica etiquetada, com data e pesquisável no seu dashboard. Notas, contexto, evento — tudo anexado." },
          { title: "Faça follow-up e converta", text: "Lembretes agendados, sequências automáticas e exportação para CRM mantêm os leads quentes após o evento." },
        ],
      }
    : language === 'es'
    ? {
        label: "Cómo funciona",
        title: "Del apretón de manos",
        titleEm: "al negocio cerrado",
        subtitle: "Cuatro pasos. Menos de treinta segundos para los tres primeros.",
        steps: [
          { title: "Configura tu perfil", text: "Crea tu perfil PocketCV una vez. Nombre, cargo, empresa, enlaces — todo lo que alguien necesita para recordarte." },
          { title: "Comparte con un toque", text: "Muestra tu QR code o toca tu tarjeta NFC. Acceso instantáneo a tu perfil — sin app, sin fricción." },
          { title: "Captura y organiza", text: "Cada conexión queda etiquetada, con fecha y buscable en tu dashboard. Notas, contexto, evento — todo adjunto." },
          { title: "Haz follow-up y convierte", text: "Recordatorios programados, secuencias automáticas y exportación a CRM mantienen los leads calientes." },
        ],
      }
    : language === 'fr'
    ? {
        label: "Comment ça marche",
        title: "De la poignée de main",
        titleEm: "au deal conclu",
        subtitle: "Quatre étapes. Moins de trente secondes pour les trois premières.",
        steps: [
          { title: "Configurez votre profil", text: "Créez votre profil PocketCV une fois. Nom, poste, entreprise, liens — tout ce dont quelqu'un a besoin pour se souvenir de vous." },
          { title: "Partagez d'un geste", text: "Montrez votre QR code ou touchez avec votre carte NFC. Accès instantané à votre profil — sans app, sans friction." },
          { title: "Capturez et organisez", text: "Chaque connexion est étiquetée, datée et recherchable dans votre dashboard. Notes, contexte, événement — tout est rattaché." },
          { title: "Relancez et convertissez", text: "Rappels programmés, séquences automatisées et export CRM gardent les leads au chaud après l'événement." },
        ],
      }
    : {
        label: "How it works",
        title: "From handshake",
        titleEm: "to closed deal",
        subtitle: "Four steps. Under thirty seconds for the first three.",
        steps: [
          { title: "Set up your profile", text: "Build your PocketCV profile once. Your name, role, company, links — everything someone needs to remember you." },
          { title: "Share in a tap", text: "Show your QR code or tap your NFC card. They visit your profile instantly — no app, no friction, no fumbling." },
          { title: "Capture and organize", text: "Every connection lands tagged, timestamped, and searchable in your dashboard. Notes, context, event — all attached." },
          { title: "Follow up and convert", text: "Scheduled reminders, automated sequences, and CRM export keep leads warm long after the event energy fades." },
        ],
      };

  return (
    <section ref={sectionRef} id="how-it-works" className={cn("py-24 bg-background relative overflow-hidden")}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <span className="text-xs font-semibold uppercase tracking-widest text-pocketcv-purple mb-4 block">
            {t.label}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
            {t.title} <br />
            <em className="text-pocketcv-purple italic">{t.titleEm}</em>
          </h2>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {t.steps.map((step, i) => (
              <div
                key={i}
                className="text-center relative animate-on-scroll opacity-0 translate-y-8 transition-all duration-700"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-background border-2 border-border flex items-center justify-center mx-auto mb-5 relative z-10">
                  <span className="text-xl font-bold text-pocketcv-purple">{i + 1}</span>
                </div>
                <h4 className="text-base font-semibold text-foreground mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
