import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { useEffect, useRef } from "react";

const ValuePropsSection = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
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
    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const t = isPt
    ? {
        label: "Porquê a PocketCV",
        title: "Networking que funciona",
        titleEm: "depois",
        titleEnd: "do evento",
        subtitle: "A maioria das conexões morre em 48 horas após o evento. A PocketCV mantém-nas vivas — automaticamente.",
        points: [
          {
            title: "Capture, instantaneamente",
            text: "Partilhe o seu perfil via QR ou NFC em menos de três segundos. Sem app necessário para a outra pessoa. Cada contacto fica organizado no seu dashboard.",
          },
          {
            title: "Veja o seu networking, claramente",
            text: "Saiba exatamente quem conheceu, quando e o que aconteceu depois. Visibilidade total para indivíduos, equipas e organizadores — em tempo real.",
          },
          {
            title: "Faça follow-up, automaticamente",
            text: "Lembretes agendados e sequências automáticas garantem que cada lead recebe a mensagem certa no momento certo — antes de esquecerem quem é.",
          },
        ],
        cards: [
          { icon: "📲", label: "Nova conexão", value: "Ana Costa · Product Manager, NovaTech", badge: "Agora", badgeType: "green" as const },
          { icon: "✅", label: "Follow-up agendado", value: "Lembrete para Quinta 10:00", badge: "Auto", badgeType: "coral" as const },
          { icon: "📊", label: "Evento de hoje — SIM Conference", value: "47 contactos capturados · 92% seguidos", badge: "Live", badgeType: "green" as const },
          { icon: "🎯", label: "Performance da equipa", value: "A sua equipa é #1 em leads esta semana", badge: "Top", badgeType: "coral" as const },
        ],
      }
    : language === 'es'
    ? {
        label: "Por qué PocketCV",
        title: "Networking que funciona",
        titleEm: "después",
        titleEnd: "del evento",
        subtitle: "La mayoría de las conexiones mueren en 48 horas tras el evento. PocketCV las mantiene vivas — automáticamente.",
        points: [
          { title: "Captura, al instante", text: "Comparte tu perfil vía QR o NFC en menos de tres segundos. Sin app necesaria para la otra persona. Cada contacto queda organizado en tu dashboard." },
          { title: "Ve tu networking, claramente", text: "Sabe exactamente a quién conociste, cuándo y qué pasó después. Visibilidad total para individuos, equipos y organizadores — en tiempo real." },
          { title: "Haz follow-up, automáticamente", text: "Recordatorios programados y secuencias automáticas aseguran que cada lead reciba el mensaje correcto en el momento adecuado." },
        ],
        cards: [
          { icon: "📲", label: "Nueva conexión", value: "Ana Costa · Product Manager, NovaTech", badge: "Ahora", badgeType: "green" as const },
          { icon: "✅", label: "Follow-up agendado", value: "Recordatorio para Jueves 10:00", badge: "Auto", badgeType: "coral" as const },
          { icon: "📊", label: "Evento de hoy — SIM Conference", value: "47 contactos capturados · 92% seguidos", badge: "Live", badgeType: "green" as const },
          { icon: "🎯", label: "Rendimiento del equipo", value: "Tu equipo es #1 en leads esta semana", badge: "Top", badgeType: "coral" as const },
        ],
      }
    : language === 'fr'
    ? {
        label: "Pourquoi PocketCV",
        title: "Le networking qui fonctionne",
        titleEm: "après",
        titleEnd: "l'événement",
        subtitle: "La plupart des connexions meurent dans les 48 heures suivant l'événement. PocketCV les maintient en vie — automatiquement.",
        points: [
          { title: "Capturez, instantanément", text: "Partagez votre profil via QR ou NFC en moins de trois secondes. Aucune app requise pour l'autre personne. Chaque contact est organisé dans votre dashboard." },
          { title: "Visualisez votre networking", text: "Savez exactement qui vous avez rencontré, quand, et ce qui s'est passé ensuite. Visibilité totale pour les individus, équipes et organisateurs — en temps réel." },
          { title: "Relancez, automatiquement", text: "Des rappels programmés et des séquences automatisées garantissent que chaque lead reçoit le bon message au bon moment." },
        ],
        cards: [
          { icon: "📲", label: "Nouvelle connexion", value: "Ana Costa · Product Manager, NovaTech", badge: "Maintenant", badgeType: "green" as const },
          { icon: "✅", label: "Relance programmée", value: "Rappel pour Jeudi 10:00", badge: "Auto", badgeType: "coral" as const },
          { icon: "📊", label: "Événement du jour — SIM Conference", value: "47 contacts capturés · 92% relancés", badge: "Live", badgeType: "green" as const },
          { icon: "🎯", label: "Performance de l'équipe", value: "Votre équipe est #1 en leads cette semaine", badge: "Top", badgeType: "coral" as const },
        ],
      }
    : {
        label: "Why PocketCV",
        title: "Networking that works",
        titleEm: "after",
        titleEnd: "the event",
        subtitle: "Most connections die within 48 hours of the event. PocketCV keeps them alive — automatically.",
        points: [
          {
            title: "Capture, instantly",
            text: "Share your profile via QR or NFC in under three seconds. No app required for the other person. Every contact lands organized in your dashboard.",
          },
          {
            title: "See your networking, clearly",
            text: "Know exactly who you met, when, and what happened next. Full visibility for individuals, teams, and event organizers — in real time.",
          },
          {
            title: "Follow up, automatically",
            text: "Scheduled reminders and automated sequences ensure every lead gets the right message at the right time — before they forget who you are.",
          },
        ],
        cards: [
          { icon: "📲", label: "New connection", value: "Ana Costa · Product Manager, NovaTech", badge: "Just now", badgeType: "green" as const },
          { icon: "✅", label: "Follow-up scheduled", value: "Reminder set for Thursday 10:00", badge: "Auto", badgeType: "coral" as const },
          { icon: "📊", label: "Today's event — SIM Conference", value: "47 contacts captured · 92% followed up", badge: "Live", badgeType: "green" as const },
          { icon: "🎯", label: "Team performance", value: "Your team is #1 for leads this week", badge: "Top", badgeType: "coral" as const },
        ],
      };

  return (
    <section ref={sectionRef} className="py-20 bg-background">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text side */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <span className="text-xs font-semibold uppercase tracking-widest text-pocketcv-purple mb-4 block">
              {t.label}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
              {t.title} <br />
              <em className="text-pocketcv-purple italic">{t.titleEm}</em> {t.titleEnd}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t.subtitle}
            </p>

            <div className="space-y-6">
              {t.points.map((point, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-pocketcv-purple/10 text-pocketcv-purple text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">{point.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual cards */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
            <div className="relative bg-muted/50 border border-border rounded-2xl p-5 space-y-3">
              {/* Top accent bar */}
              <div className="absolute -top-px left-10 right-10 h-[3px] bg-pocketcv-purple rounded-b-sm" />

              {t.cards.map((card, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
                      i === 0
                        ? "bg-pocketcv-purple/10"
                        : i === 1
                        ? "bg-green-100 dark:bg-green-900/30"
                        : i === 2
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-purple-100 dark:bg-purple-900/30"
                    }`}
                  >
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-muted-foreground">{card.label}</div>
                    <div className="text-sm font-semibold text-foreground truncate">{card.value}</div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${
                      card.badgeType === "green"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-pocketcv-purple/10 text-pocketcv-purple"
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuePropsSection;
