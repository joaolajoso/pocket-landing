import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { useEffect, useRef } from "react";

const TestimonialsSection = () => {
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
    return () => { elements?.forEach((el) => observer.unobserve(el)); };
  }, []);

  const t = isPt
    ? {
        label: "Early adopters",
        title: "O que os networkers",
        titleEm: "dizem",
        testimonials: [
          {
            text: "\"Costumava sair de eventos com uma pilha de cartões e sem plano. A PocketCV mudou isso completamente — cada contacto está organizado antes de eu sair da sala.\"",
            initials: "MF",
            name: "Miguel F.",
            role: "Consultor imobiliário, Century21 Aveiro",
          },
          {
            text: "\"Usámos na última feira com uma equipa de oito. O dashboard do gestor, por si só, valeu a pena — conseguíamos ver quem estava a gerar leads em tempo real.\"",
            initials: "SC",
            name: "Sara C.",
            role: "Diretora de Vendas, Startup Tech",
          },
          {
            text: "\"Como organizador, finalmente tenho números para mostrar aos patrocinadores. Taxas de conexão, engagement por expositor, scores de satisfação — dados que nunca tinha.\"",
            initials: "RP",
            name: "Ricardo P.",
            role: "Diretor de eventos, Conferência empresarial",
          },
        ],
      }
    : language === 'es'
    ? {
        label: "Early adopters",
        title: "Lo que dicen los",
        titleEm: "networkers",
        testimonials: [
          { text: "\"Solía salir de eventos con una pila de tarjetas y sin plan. PocketCV cambió eso por completo — cada contacto está organizado antes de salir de la sala.\"", initials: "MF", name: "Miguel F.", role: "Consultor inmobiliario, Century21 Aveiro" },
          { text: "\"Lo usamos en nuestra última feria con un equipo de ocho. El dashboard del gestor valió la pena — podíamos ver quién generaba leads en tiempo real.\"", initials: "SC", name: "Sara C.", role: "Directora de Ventas, Startup Tech" },
          { text: "\"Como organizador, finalmente tengo números para mostrar a los patrocinadores. Tasas de conexión, engagement por expositor — datos que nunca tenía.\"", initials: "RP", name: "Ricardo P.", role: "Director de eventos" },
        ],
      }
    : language === 'fr'
    ? {
        label: "Early adopters",
        title: "Ce que les networkers",
        titleEm: "disent",
        testimonials: [
          { text: "\"Je quittais les événements avec une pile de cartes et aucun plan. PocketCV a tout changé — chaque contact est organisé avant même de quitter la salle.\"", initials: "MF", name: "Miguel F.", role: "Consultant immobilier, Century21 Aveiro" },
          { text: "\"Nous l'avons utilisé lors de notre dernier salon avec une équipe de huit. Le dashboard manager valait le coup — on voyait qui générait des leads en temps réel.\"", initials: "SC", name: "Sara C.", role: "Directrice des Ventes, Startup Tech" },
          { text: "\"En tant qu'organisateur, j'ai enfin des chiffres à montrer aux sponsors. Taux de connexion, engagement par exposant — des données que je n'avais jamais eues.\"", initials: "RP", name: "Ricardo P.", role: "Directeur d'événements" },
        ],
      }
    : {
        label: "Early adopters",
        title: "What networkers",
        titleEm: "are saying",
        testimonials: [
          {
            text: "\"I used to leave events with a pile of cards and no plan. PocketCV changed that completely — every contact is organized before I even leave the room.\"",
            initials: "MF",
            name: "Miguel F.",
            role: "Real estate consultant, Century21 Aveiro",
          },
          {
            text: "\"We used it at our last trade show with a team of eight. The manager dashboard alone was worth it — we could see exactly who was generating leads in real time.\"",
            initials: "SC",
            name: "Sara C.",
            role: "Sales Director, Tech startup",
          },
          {
            text: "\"As an organizer, I finally have numbers to show sponsors. Connection rates, engagement per exhibitor, satisfaction scores — data I never had before.\"",
            initials: "RP",
            name: "Ricardo P.",
            role: "Event director, Business conference",
          },
        ],
      };

  return (
    <section ref={sectionRef} className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="text-center mb-12 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <span className="text-xs font-semibold uppercase tracking-widest text-pocketcv-purple mb-4 block">
            {t.label}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {t.title} <br />
            <em className="text-pocketcv-purple italic">{t.titleEm}</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.testimonials.map((item, i) => (
            <div
              key={i}
              className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 bg-background border border-border rounded-2xl p-6"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="text-pocketcv-purple text-sm mb-4 tracking-widest">★★★★★</div>
              <p className="text-foreground text-[15px] leading-relaxed mb-6 italic">
                {item.text}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pocketcv-purple/10 flex items-center justify-center text-sm font-bold text-pocketcv-purple">
                  {item.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
