import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LightModeWrapper } from "@/components/LightModeWrapper";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Helmet } from "react-helmet";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check, Play, Users, QrCode, BarChart3, Zap, Calendar, Target,
  Sparkles, TrendingUp, Globe, Shield, ArrowRight, ChevronDown,
  CreditCard, Award, MessageSquare, Megaphone, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrgPlans, VISITOR_TIERS, getPPU, fN, fE, type TieredPlan } from "@/components/pricing/pricingData";

/* ──────── i18n helper ──────── */
function t(lang: Language, pt: string, en: string, es?: string, fr?: string) {
  if (lang === 'pt') return pt;
  if (lang === 'es') return es || en;
  if (lang === 'fr') return fr || en;
  return en;
}

const EventsLanding = () => {
  const { language } = useLanguage();
  const { setTheme } = useTheme();
  const isPt = isPortuguese(language);

  useEffect(() => { setTheme('light'); }, [setTheme]);

  return (
    <LightModeWrapper>
      <div className="flex flex-col min-h-screen">
        <Helmet>
          <title>{t(language, 'PocketCV Events — Gestão de Eventos com Networking Inteligente', 'PocketCV Events — Smart Event Management & Networking')}</title>
          <meta name="description" content={t(language,
            'De meetups a congressos: credenciamento, networking para participantes e analytics em tempo real.',
            'From meetups to conferences: accreditation, participant networking and real-time analytics.'
          )} />
        </Helmet>

        <Navbar />

        <main className="flex-1">
          <HeroSection lang={language} />
          <SocialProof lang={language} />
          <KillerFeature lang={language} />
          <ImpactSection lang={language} />
          <FeaturesSection lang={language} />
          <PricingSection lang={language} isPt={isPt} />
          <FAQSection lang={language} />
          <FinalCTA lang={language} />
        </main>

        <Footer />
      </div>
    </LightModeWrapper>
  );
};

/* ────────────────────────── HERO ────────────────────────── */
function HeroSection({ lang }: { lang: Language }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50 py-16 md:py-28 px-4">
      {/* decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-pocketcv-purple/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-pocketcv-orange/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        <Badge className="bg-pocketcv-purple/10 text-pocketcv-purple border-pocketcv-purple/20 hover:bg-pocketcv-purple/20">
          <Sparkles className="w-4 h-4 mr-2" />
          {t(lang, 'Eventos Ilimitados · Uma Única Assinatura', 'Unlimited Events · One Subscription', 'Eventos Ilimitados · Una Suscripción', 'Événements Illimités · Un Abonnement')}
        </Badge>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          {t(lang, 'A plataforma completa para', 'The complete platform to', 'La plataforma completa para', 'La plateforme complète pour')}{" "}
          <span className="bg-gradient-to-r from-pocketcv-purple to-pocketcv-orange bg-clip-text text-transparent">
            {t(lang, 'gerir, conectar e medir', 'manage, connect and measure', 'gestionar, conectar y medir', 'gérer, connecter et mesurer')}
          </span>{" "}
          {t(lang, 'os seus eventos', 'your events', 'tus eventos', 'vos événements')}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          {t(lang,
            'De meetups a congressos: credenciamento ágil, app de networking para os participantes e dados em tempo real. Crie eventos ilimitados com uma única assinatura.',
            'From meetups to conferences: smooth accreditation, networking app for attendees and real-time data. Create unlimited events with one subscription.',
            'De meetups a congresos: acreditación ágil, app de networking para participantes y datos en tiempo real.',
            'Des meetups aux congrès : accréditation fluide, app de networking pour les participants et données en temps réel.'
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link to="/login">
            <Button size="lg" className="h-14 text-lg px-8 gap-3 bg-pocketcv-purple hover:bg-pocketcv-purple/90">
              {t(lang, 'Começar Grátis', 'Start Free', 'Empezar Gratis', 'Commencer Gratuitement')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <a href="mailto:pocketcvnetworking@gmail.com?subject=Demo%20Request">
            <Button size="lg" variant="outline" className="h-14 text-lg px-8 gap-3">
              <Play className="w-5 h-5" />
              {t(lang, 'Pedir Demo', 'Request Demo', 'Pedir Demo', 'Demander une Démo')}
            </Button>
          </a>
        </div>

        <p className="text-sm text-muted-foreground">
          {t(lang,
            'Sem taxas por registante · Sem cartão de crédito · Cancele quando quiser',
            'No per-registrant fees · No credit card · Cancel anytime',
            'Sin tasas por registrante · Sin tarjeta · Cancela en cualquier momento',
            'Sans frais par inscrit · Sans carte · Annulez à tout moment'
          )}
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────── SOCIAL PROOF ────────────────────────── */
function SocialProof({ lang }: { lang: Language }) {
  return (
    <section className="py-12 border-y border-border bg-white">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-pocketcv-purple">10.000+</div>
            <div className="text-sm text-muted-foreground">{t(lang, 'Conexões Facilitadas', 'Connections Made', 'Conexiones Facilitadas', 'Connexions Facilitées')}</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-pocketcv-purple">500kg</div>
            <div className="text-sm text-muted-foreground">{t(lang, 'Papel Economizado', 'Paper Saved', 'Papel Ahorrado', 'Papier Économisé')}</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-pocketcv-purple">2025</div>
            <div className="text-sm text-muted-foreground">{t(lang, 'Ano de Impacto', 'Year of Impact', 'Año de Impacto', 'Année d\'Impact')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── KILLER FEATURE ────────────────────────── */
function KillerFeature({ lang }: { lang: Language }) {
  const cards = [
    { icon: Users, color: 'text-pocketcv-purple', bg: 'bg-pocketcv-purple/10',
      title: t(lang, 'Talentos ↔ Recrutadores', 'Talents ↔ Recruiters', 'Talentos ↔ Reclutadores', 'Talents ↔ Recruteurs'),
      desc: t(lang, 'Profissionais em busca de oportunidades conectam-se com empresas que estão a contratar', 'Professionals seeking opportunities connect with hiring companies', 'Profesionales buscando oportunidades se conectan con empresas contratando', 'Les professionnels en recherche se connectent avec les entreprises qui recrutent') },
    { icon: TrendingUp, color: 'text-pocketcv-orange', bg: 'bg-pocketcv-orange/10',
      title: t(lang, 'Founders ↔ Investidores', 'Founders ↔ Investors', 'Founders ↔ Inversores', 'Fondateurs ↔ Investisseurs'),
      desc: t(lang, 'Startups à procura de capital encontram investidores interessados no sector', 'Startups seeking funding find investors interested in their sector', 'Startups buscando capital encuentran inversores interesados', 'Les startups en recherche de fonds trouvent des investisseurs intéressés') },
    { icon: Sparkles, color: 'text-green-600', bg: 'bg-green-100',
      title: t(lang, 'Compradores ↔ Vendedores', 'Buyers ↔ Sellers', 'Compradores ↔ Vendedores', 'Acheteurs ↔ Vendeurs'),
      desc: t(lang, 'Empresas à procura de soluções conectam-se com fornecedores relevantes', 'Companies looking for solutions connect with relevant suppliers', 'Empresas buscando soluciones se conectan con proveedores relevantes', 'Les entreprises trouvent des fournisseurs pertinents') },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-pocketcv-purple/10 text-pocketcv-purple border-pocketcv-purple/20">
            <Target className="w-4 h-4 mr-2" />
            Killer Feature
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold">
            {t(lang, 'Adeus networking aleatório.', 'Goodbye random networking.', 'Adiós networking aleatorio.', 'Adieu networking aléatoire.')}{" "}
            <span className="bg-gradient-to-r from-pocketcv-purple to-pocketcv-orange bg-clip-text text-transparent">
              {t(lang, 'Olá conexões estratégicas.', 'Hello strategic connections.', 'Hola conexiones estratégicas.', 'Bonjour connexions stratégiques.')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t(lang,
              'O PocketCV não é apenas uma lista de nomes, mas um motor de recomendação que conecta pessoas com objetivos complementares automaticamente.',
              'PocketCV isn\'t just a name list, but a recommendation engine that automatically connects people with complementary goals.',
              'PocketCV no es solo una lista de nombres, sino un motor de recomendación que conecta personas con objetivos complementarios automáticamente.',
              'PocketCV n\'est pas qu\'une liste de noms, mais un moteur de recommandation qui connecte automatiquement les personnes aux objectifs complémentaires.'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <Card key={c.title} className="border-2 hover:border-pocketcv-purple/40 transition-all">
              <CardHeader>
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", c.bg)}>
                  <c.icon className={cn("w-6 h-6", c.color)} />
                </div>
                <CardTitle className="text-lg">{c.title}</CardTitle>
                <CardDescription>{c.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── IMPACT ────────────────────────── */
function ImpactSection({ lang }: { lang: Language }) {
  const stats = [
    { val: '+20', label: t(lang, 'Pontos de NPS', 'NPS Points', 'Puntos de NPS', 'Points NPS'), desc: t(lang, 'Aumento médio em eventos que priorizaram networking estruturado', 'Average increase in events that prioritised structured networking', 'Aumento medio en eventos que priorizaron networking estructurado', 'Augmentation moyenne dans les événements qui ont priorisé le networking structuré'), color: 'text-pocketcv-purple border-pocketcv-purple' },
    { val: '80%', label: t(lang, 'Mais ROI', 'More ROI', 'Más ROI', 'Plus de ROI'), desc: t(lang, 'Impacto potencial de coffee breaks estratégicos em conversões', 'Potential impact of strategic coffee breaks on conversions', 'Impacto potencial de coffee breaks estratégicos en conversiones', 'Impact potentiel des pauses-café stratégiques sur les conversions'), color: 'text-pocketcv-orange border-pocketcv-orange' },
    { val: '2x', label: t(lang, 'Taxa de Retorno', 'Return Rate', 'Tasa de Retorno', 'Taux de Retour'), desc: t(lang, 'Participantes que fizeram conexões relevantes voltam ao evento', 'Attendees who made relevant connections return to the event', 'Participantes que hicieron conexiones relevantes vuelven al evento', 'Les participants ayant fait des connexions pertinentes reviennent'), color: 'text-green-600 border-green-600' },
  ];

  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-purple-50/50 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <Badge className="bg-pocketcv-purple/10 text-pocketcv-purple border-pocketcv-purple/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t(lang, 'Comprovado por Dados', 'Data-Driven Proof', 'Comprobado por Datos', 'Prouvé par les Données')}
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold">
            {t(lang, 'Networking estruturado não é extra.', 'Structured networking isn\'t extra.', 'El networking estructurado no es extra.', 'Le networking structuré n\'est pas un extra.')}{" "}
            <span className="bg-gradient-to-r from-pocketcv-purple to-pocketcv-orange bg-clip-text text-transparent">
              {t(lang, 'É o coração do evento.', 'It\'s the heart of the event.', 'Es el corazón del evento.', 'C\'est le cœur de l\'événement.')}
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <Card key={s.val} className={cn("border-2 text-center p-6 hover:shadow-lg transition-all", s.color.split(' ')[1] ? `hover:${s.color.split(' ')[1]}/40` : '')}>
              <div className={cn("text-5xl font-bold mb-3", s.color.split(' ')[0])}>{s.val}</div>
              <div className="text-lg font-semibold mb-2">{s.label}</div>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── FEATURES TABS ────────────────────────── */
function FeaturesSection({ lang }: { lang: Language }) {
  const tabs = [
    {
      key: 'pre', label: t(lang, 'Pré-Evento', 'Pre-Event', 'Pre-Evento', 'Pré-Événement'),
      icon: Calendar, title: t(lang, 'Gestão Pré-Evento', 'Pre-Event Management', 'Gestión Pre-Evento', 'Gestion Pré-Événement'),
      desc: t(lang, 'Configure e promova o seu evento em minutos', 'Set up and promote your event in minutes', 'Configura y promueve tu evento en minutos', 'Configurez et promouvez votre événement en minutes'),
      items: [
        t(lang, 'Landing page automática com formulário de inscrição', 'Automatic landing page with registration form', 'Landing page automática con formulario de inscripción', 'Landing page automatique avec formulaire d\'inscription'),
        t(lang, 'Gestão de inscritos com filtros e segmentação', 'Attendee management with filters and segmentation', 'Gestión de inscritos con filtros y segmentación', 'Gestion des inscrits avec filtres et segmentation'),
        t(lang, 'Disparo automático de emails de confirmação', 'Automatic confirmation email dispatch', 'Envío automático de emails de confirmación', 'Envoi automatique d\'emails de confirmation'),
        t(lang, 'Importação e exportação de participantes via CSV', 'CSV participant import/export', 'Importación y exportación de participantes via CSV', 'Import/export des participants en CSV'),
      ],
    },
    {
      key: 'checkin', label: 'Check-in',
      icon: QrCode, title: t(lang, 'Check-in Ultrarrápido', 'Ultra-Fast Check-in', 'Check-in Ultrarrápido', 'Check-in Ultra-Rapide'),
      desc: t(lang, 'Sem filas, sem atritos', 'No queues, no friction', 'Sin colas, sin fricciones', 'Sans files, sans friction'),
      items: [
        t(lang, 'App de staff para leitura de QR Code em segundos', 'Staff app for QR code scanning in seconds', 'App de staff para lectura de QR Code en segundos', 'App staff pour scanner les QR codes en secondes'),
        t(lang, 'Check-in funciona offline e sincroniza automaticamente', 'Check-in works offline and auto-syncs', 'Check-in funciona offline y sincroniza automáticamente', 'Check-in fonctionne hors-ligne et se synchronise automatiquement'),
        t(lang, 'Estatísticas de entrada em tempo real', 'Real-time entry statistics', 'Estadísticas de entrada en tiempo real', 'Statistiques d\'entrée en temps réel'),
        t(lang, 'Múltiplos pontos de entrada simultâneos', 'Multiple simultaneous entry points', 'Múltiples puntos de entrada simultáneos', 'Multiples points d\'entrée simultanés'),
      ],
    },
    {
      key: 'experience', label: t(lang, 'Experiência', 'Experience', 'Experiencia', 'Expérience'),
      icon: Sparkles, title: t(lang, 'WebApp do Participante', 'Participant WebApp', 'WebApp del Participante', 'WebApp du Participant'),
      desc: t(lang, 'Networking inteligente na palma da mão', 'Smart networking at your fingertips', 'Networking inteligente en la palma de la mano', 'Networking intelligent au bout des doigts'),
      items: [
        t(lang, 'Agenda digital com notificações de sessões', 'Digital schedule with session notifications', 'Agenda digital con notificaciones de sesiones', 'Agenda numérique avec notifications de sessions'),
        t(lang, 'Perfil digital com QR Code e NFC para troca de contactos', 'Digital profile with QR & NFC for contact exchange', 'Perfil digital con QR Code y NFC para intercambio de contactos', 'Profil numérique avec QR & NFC pour échange de contacts'),
        t(lang, 'Matchmaking com sugestões de pessoas para conhecer', 'Matchmaking with people suggestions', 'Matchmaking con sugerencias de personas para conocer', 'Matchmaking avec suggestions de personnes à rencontrer'),
        t(lang, 'Chat em tempo real e pedidos de reunião', 'Real-time chat and meeting requests', 'Chat en tiempo real y solicitudes de reunión', 'Chat en temps réel et demandes de réunion'),
      ],
    },
    {
      key: 'post', label: t(lang, 'Pós-Evento', 'Post-Event', 'Post-Evento', 'Post-Événement'),
      icon: BarChart3, title: t(lang, 'Analytics em Tempo Real', 'Real-Time Analytics', 'Analytics en Tiempo Real', 'Analytics en Temps Réel'),
      desc: t(lang, 'Dados para melhorar os próximos eventos', 'Data to improve future events', 'Datos para mejorar tus próximos eventos', 'Données pour améliorer vos prochains événements'),
      items: [
        t(lang, 'Relatórios de presença e engajamento', 'Attendance and engagement reports', 'Informes de asistencia y engagement', 'Rapports de présence et engagement'),
        t(lang, 'Métricas de conexões realizadas', 'Connections metrics', 'Métricas de conexiones realizadas', 'Métriques des connexions réalisées'),
        t(lang, 'Event Recap partilhável para participantes', 'Shareable Event Recap for attendees', 'Event Recap compartible para participantes', 'Event Recap partageable pour les participants'),
        t(lang, 'Exportação de dados para análise externa', 'Data export for external analysis', 'Exportación de datos para análisis externo', 'Export de données pour analyse externe'),
      ],
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 px-4 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-2xl md:text-4xl font-bold">
            {t(lang, 'O Sistema Operacional dos seus eventos', 'The Operating System for your events', 'El Sistema Operativo de tus eventos', 'Le Système d\'Exploitation de vos événements')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t(lang, 'Tudo o que precisa, do cadastro ao relatório final', 'Everything you need, from registration to final report', 'Todo lo que necesitas, del registro al informe final', 'Tout ce dont vous avez besoin, de l\'inscription au rapport final')}
          </p>
        </div>

        <Tabs defaultValue="pre" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pocketcv-purple/10 rounded-lg flex items-center justify-center">
                      <tab.icon className="w-6 h-6 text-pocketcv-purple" />
                    </div>
                    <div>
                      <CardTitle>{tab.title}</CardTitle>
                      <CardDescription>{tab.desc}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tab.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

/* ────────────────────────── PRICING ────────────────────────── */
function PricingSection({ lang, isPt }: { lang: Language; isPt: boolean }) {
  const [billing, setBilling] = React.useState<'monthly' | 'annual'>('monthly');
  const [credits, setCredits] = React.useState(2000);
  const isAnnual = billing === 'annual';
  const plans = React.useMemo(() => getOrgPlans(isPt), [isPt]);

  const ppu = getPPU(credits);
  const total = ppu ? credits * ppu : null;

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-10">
          <Badge className="bg-pocketcv-purple/10 text-pocketcv-purple border-pocketcv-purple/20">
            {t(lang, 'Preços', 'Pricing', 'Precios', 'Tarifs')}
          </Badge>
          <h2 className="text-2xl md:text-4xl font-bold">
            {t(lang, 'Pague uma vez, organize o ano todo', 'Pay once, organize all year', 'Paga una vez, organiza todo el año', 'Payez une fois, organisez toute l\'année')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t(lang,
              'Dimensionado pela equipa de staff — inclui eventos ilimitados, analytics em tempo real e ferramentas de patrocinadores.',
              'Sized by your staff team — includes unlimited events, real-time analytics and sponsor tools.',
              'Dimensionado por tu equipo de staff — incluye eventos ilimitados, analytics en tiempo real y herramientas de patrocinadores.',
              'Dimensionné par votre équipe — inclut événements illimités, analytics en temps réel et outils sponsors.'
            )}
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="inline-flex bg-card border border-border rounded-lg overflow-hidden">
              <button onClick={() => setBilling('monthly')} className={cn("px-4 py-1.5 text-sm font-medium transition-all", !isAnnual ? "text-white bg-pocketcv-purple" : "text-muted-foreground")}>{t(lang, 'Mensal', 'Monthly', 'Mensual', 'Mensuel')}</button>
              <button onClick={() => setBilling('annual')} className={cn("px-4 py-1.5 text-sm font-medium transition-all", isAnnual ? "text-white bg-pocketcv-purple" : "text-muted-foreground")}>{t(lang, 'Anual', 'Annual', 'Anual', 'Annuel')}</button>
            </div>
            {isAnnual && <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">{t(lang, '15% desconto', '15% off', '15% descuento', '15% de réduction')}</span>}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {plans.map((p, i) => {
            const shown = isAnnual ? p.annual : p.price;
            return (
              <div key={i} className={cn("bg-card border rounded-2xl p-5 flex flex-col relative transition-all hover:shadow-lg", p.pop ? "border-2 border-pocketcv-purple ring-2 ring-pocketcv-purple/20" : "border-border")}>
                {p.pop && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-pocketcv-purple text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-b-lg">
                    {t(lang, 'Mais popular', 'Most popular', 'Más popular', 'Le plus populaire')}
                  </span>
                )}
                <h3 className="text-xl font-bold mb-0.5 mt-2">{p.tier}</h3>
                <p className="text-xs text-muted-foreground mb-3">{p.sub}</p>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="text-sm">€</span>
                  <span className="text-3xl font-light">{shown}</span>
                  <span className="text-xs text-muted-foreground ml-1">/{t(lang, 'mês', 'mo', 'mes', 'mois')}</span>
                </div>
                {isAnnual && <p className="text-xs text-muted-foreground line-through mb-2">{fE(p.price)}/{t(lang, 'mês', 'mo', 'mes', 'mois')}</p>}
                <ul className="space-y-2 mt-3 mb-4 flex-1">
                  {p.feats.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className={cn("w-full", p.pop ? "bg-pocketcv-purple hover:bg-pocketcv-purple/90" : "")} variant={p.pop ? "default" : "outline"} asChild>
                  <Link to={p.ctaClass === 'ghost' ? '/contact' : '/login'}>{p.cta}</Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Visitor Credits Calculator */}
        <div className="bg-gradient-to-br from-purple-50 to-white border border-border rounded-2xl p-6 md:p-8 mb-10">
          <h3 className="text-lg font-bold mb-1">{t(lang, 'Calculador de Créditos de Visitante', 'Visitor Credits Calculator', 'Calculadora de Créditos de Visitante', 'Calculateur de Crédits Visiteur')}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t(lang,
              'Créditos são consumidos quando um visitante faz check-in. Compra única — nunca expiram.',
              'Credits are consumed when a visitor checks in. One-time purchase — never expire.',
              'Los créditos se consumen cuando un visitante hace check-in. Compra única — nunca expiran.',
              'Les crédits sont consommés quand un visiteur fait le check-in. Achat unique — n\'expirent jamais.'
            )}
          </p>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full accent-pocketcv-purple"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>100</span>
                <span>50.000</span>
              </div>
            </div>
            <div className="text-center min-w-[200px]">
              <div className="text-3xl font-bold text-pocketcv-purple">{fN(credits)} {t(lang, 'créditos', 'credits', 'créditos', 'crédits')}</div>
              {ppu ? (
                <>
                  <div className="text-sm text-muted-foreground">{fE(ppu, 2)}/{t(lang, 'crédito', 'credit', 'crédito', 'crédit')}</div>
                  <div className="text-lg font-semibold mt-1">{t(lang, 'Total', 'Total', 'Total', 'Total')}: {fE(total || 0)}</div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">{t(lang, 'Contactar vendas', 'Contact sales', 'Contactar ventas', 'Contacter les ventes')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Zero ticket fees */}
        <div className="relative overflow-hidden rounded-2xl border border-pocketcv-purple/20 bg-gradient-to-br from-purple-50 via-white to-purple-50 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pocketcv-purple/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pocketcv-orange/5 rounded-full blur-3xl" />
          <div className="relative z-10 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pocketcv-purple/10">
              <Check className="w-7 h-7 text-pocketcv-purple" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold">
              {t(lang, 'Zero taxas sobre bilhetes', 'Zero ticket fees', 'Cero tasas sobre tickets', 'Zéro frais sur les billets')}
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <span className="text-foreground font-semibold">
                {t(lang, '100% da receita fica consigo.', '100% of revenue stays with you.', '100% de los ingresos se quedan contigo.', '100% des revenus restent avec vous.')}
              </span>{" "}
              {t(lang,
                'Não cobramos taxas sobre venda de bilhetes ou inscrições.',
                'We charge no fees on ticket sales or registrations.',
                'No cobramos tasas sobre venta de tickets o inscripciones.',
                'Nous ne facturons aucun frais sur les ventes de billets ou inscriptions.'
              )}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-sm text-muted-foreground">
              {[
                t(lang, 'Sem taxas escondidas', 'No hidden fees', 'Sin tasas ocultas', 'Sans frais cachés'),
                t(lang, 'Sem comissões por venda', 'No sales commissions', 'Sin comisiones por venta', 'Sans commissions'),
                t(lang, '100% transparente', '100% transparent', '100% transparente', '100% transparent'),
              ].map((txt) => (
                <span key={txt} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />{txt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── FAQ ────────────────────────── */
function FAQSection({ lang }: { lang: Language }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const items = [
    { q: t(lang, 'Posso fazer vários eventos no mesmo plano?', 'Can I run multiple events on one plan?', '¿Puedo hacer varios eventos en el mismo plan?', 'Puis-je organiser plusieurs événements sur un même plan ?'),
      a: t(lang, 'Sim! Todos os planos incluem eventos ilimitados. O limite é pela equipa de staff, não pela quantidade de eventos.', 'Yes! All plans include unlimited events. The limit is by staff team size, not event count.', '¡Sí! Todos los planes incluyen eventos ilimitados. El límite es por equipo de staff, no por cantidad de eventos.', 'Oui ! Tous les plans incluent des événements illimités. La limite est par taille d\'équipe, pas par nombre d\'événements.') },
    { q: t(lang, 'O que são créditos de visitantes?', 'What are visitor credits?', '¿Qué son los créditos de visitantes?', 'Que sont les crédits visiteurs ?'),
      a: t(lang, 'Créditos de visitantes são uma compra única — cada crédito é consumido quando um visitante faz check-in no evento. Nunca expiram.', 'Visitor credits are a one-time purchase — each credit is consumed when a visitor checks in. They never expire.', 'Los créditos de visitantes son una compra única — cada crédito se consume cuando un visitante hace check-in. Nunca expiran.', 'Les crédits visiteurs sont un achat unique — chaque crédit est consommé quand un visiteur fait le check-in. Ils n\'expirent jamais.') },
    { q: t(lang, 'Os dados dos participantes ficam seguros?', 'Is attendee data secure?', '¿Los datos de los participantes son seguros?', 'Les données des participants sont-elles sécurisées ?'),
      a: t(lang, 'Sim. Somos 100% compatíveis com RGPD. Dados encriptados e armazenados em servidores europeus.', 'Yes. We are 100% GDPR compliant. Data is encrypted and stored on European servers.', 'Sí. Somos 100% compatibles con RGPD. Datos encriptados y almacenados en servidores europeos.', 'Oui. Nous sommes 100% conformes au RGPD. Les données sont chiffrées et stockées sur des serveurs européens.') },
    { q: t(lang, 'Preciso de cartão de crédito para começar?', 'Do I need a credit card to start?', '¿Necesito tarjeta de crédito para empezar?', 'Ai-je besoin d\'une carte de crédit pour commencer ?'),
      a: t(lang, 'Não! Pode criar a sua conta e configurar eventos sem método de pagamento.', 'No! You can create your account and set up events without any payment method.', '¡No! Puedes crear tu cuenta y configurar eventos sin método de pago.', 'Non ! Vous pouvez créer votre compte et configurer des événements sans moyen de paiement.') },
    { q: t(lang, 'Posso cancelar a qualquer momento?', 'Can I cancel anytime?', '¿Puedo cancelar en cualquier momento?', 'Puis-je annuler à tout moment ?'),
      a: t(lang, 'Sim. Cancele quando quiser — continuará a ter acesso até ao final do período pago.', 'Yes. Cancel anytime — you\'ll keep access until the end of your paid period.', 'Sí. Cancela cuando quieras — mantendrás acceso hasta el final del periodo pagado.', 'Oui. Annulez quand vous voulez — vous garderez l\'accès jusqu\'à la fin de la période payée.') },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 px-4 bg-gray-50/50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-pocketcv-purple/10 text-pocketcv-purple border-pocketcv-purple/20">FAQ</Badge>
          <h2 className="text-2xl md:text-3xl font-bold">{t(lang, 'Perguntas Frequentes', 'Frequently Asked Questions', 'Preguntas Frecuentes', 'Questions Fréquentes')}</h2>
        </div>
        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={i} className="border-b border-border">
              <button className="w-full py-4 flex items-center justify-between text-left gap-4" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-sm md:text-base">{item.q}</span>
                <ChevronDown className={cn("h-5 w-5 text-pocketcv-purple flex-shrink-0 transition-transform duration-200", open === i && "rotate-180")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", open === i ? "max-h-96 pb-4" : "max-h-0")}>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── FINAL CTA ────────────────────────── */
function FinalCTA({ lang }: { lang: Language }) {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-br from-pocketcv-purple/10 to-pocketcv-orange/10 rounded-3xl p-10 md:p-16">
        <h2 className="text-2xl md:text-4xl font-bold">
          {t(lang, 'Comece o seu primeiro evento em 2 minutos', 'Start your first event in 2 minutes', 'Empieza tu primer evento en 2 minutos', 'Lancez votre premier événement en 2 minutes')}
        </h2>
        <p className="text-lg text-muted-foreground">
          {t(lang,
            'Junte-se a centenas de organizadores que já transformaram os seus eventos com o PocketCV',
            'Join hundreds of organizers who have already transformed their events with PocketCV',
            'Únete a cientos de organizadores que ya transformaron sus eventos con PocketCV',
            'Rejoignez des centaines d\'organisateurs qui ont déjà transformé leurs événements avec PocketCV'
          )}
        </p>
        <Link to="/login">
          <Button size="lg" className="h-14 text-lg px-8 gap-3 bg-pocketcv-purple hover:bg-pocketcv-purple/90">
            {t(lang, 'Começar Grátis Agora', 'Start Free Now', 'Empezar Gratis Ahora', 'Commencer Gratuitement')}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          {t(lang, 'Sem cartão de crédito · Setup em minutos · Cancele quando quiser', 'No credit card · Setup in minutes · Cancel anytime', 'Sin tarjeta · Setup en minutos · Cancela cuando quieras', 'Sans carte · Configuration en minutes · Annulez à tout moment')}
        </p>
      </div>
    </section>
  );
}

export default EventsLanding;
