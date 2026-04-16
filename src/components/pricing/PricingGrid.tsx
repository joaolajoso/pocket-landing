import React, { useState, useMemo } from "react";
import { Check, ChevronDown, Shield, Calendar, CreditCard, Globe, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  getSoloPlans, getBizPlans, getOrgPlans,
  getComparisonCards, getFAQ, VISITOR_TIERS,
  getPPU, fN, fE,
  type SoloPlan, type TieredPlan,
} from "./pricingData";

type Segment = 'solo' | 'biz' | 'org';
type Billing = 'monthly' | 'annual';

interface PricingGridProps {
  isPt: boolean;
  organizerLink?: string;
}

const PricingGrid: React.FC<PricingGridProps> = ({ isPt, organizerLink }) => {
  const [segment, setSegment] = useState<Segment>('solo');
  const [billing, setBilling] = useState<Billing>('monthly');
  const [bizCredits, setBizCredits] = useState(1000);
  const [orgCredits, setOrgCredits] = useState(2000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isAnnual = billing === 'annual';

  const soloPlans = useMemo(() => getSoloPlans(isPt), [isPt]);
  const bizPlans = useMemo(() => getBizPlans(isPt), [isPt]);
  const orgPlans = useMemo(() => getOrgPlans(isPt), [isPt]);
  const comparison = useMemo(() => getComparisonCards(segment, isPt), [segment, isPt]);
  const faq = useMemo(() => getFAQ(isPt), [isPt]);

  const segmentConfig = {
    solo: { label: isPt ? 'Profissionais' : 'Solo professionals', accent: 'from-pocketcv-orange to-pink-500', accentSolid: 'bg-pocketcv-orange', accentText: 'text-pocketcv-orange', desc: isPt ? 'Para indivíduos que fazem networking a sério. Começa grátis — faz upgrade apenas quando quiseres follow-ups e acesso CRM.' : 'For individuals who network seriously. Start free — upgrade only when you want follow-ups and CRM access.' },
    biz: { label: isPt ? 'Business / expositores' : 'Business / exhibitors', accent: 'from-blue-500 to-blue-700', accentSolid: 'bg-blue-600', accentText: 'text-blue-600', desc: isPt ? 'Para equipas de vendas, marketing e comunicação. Uma licença fixa cobre toda a equipa e todos os eventos — sem taxas de ativação por evento.' : 'For sales, marketing, and communication teams. One flat license covers your whole team and every event — no per-event activation fees.' },
    org: { label: isPt ? 'Organizadores de eventos' : 'Event organizers', accent: 'from-purple-500 to-purple-800', accentSolid: 'bg-purple-600', accentText: 'text-purple-600', desc: isPt ? 'Para equipas que produzem e gerem eventos. Dimensionado pela equipa de organizadores — inclui todo o stack de gestão de eventos, analytics em tempo real e ferramentas de patrocinadores.' : 'For teams that produce and manage events. Sized by your organizer team — includes the full event management stack, real-time analytics, and sponsor tools.' },
  };

  const cfg = segmentConfig[segment];

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Hero Header */}
        <div className="text-center mb-8 md:mb-12">
          <Badge className="mb-4 bg-pocketcv-orange/10 text-pocketcv-orange border-pocketcv-orange/20 hover:bg-pocketcv-orange/20">
            {isPt ? 'Preços' : 'Pricing'}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-pocketcv-orange via-pocketcv-purple to-purple-800 bg-clip-text text-transparent">
              {isPt ? 'Paga pelo que precisas.' : 'Pay for what you need.'}
            </span>
            <br />
            <span className="text-foreground italic">
              {isPt ? 'Nada mais.' : 'Nothing more.'}
            </span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            {isPt
              ? 'Começa grátis. Escala quando estiveres pronto. Uma plataforma para todos os lados do networking profissional — sem penalizações por evento, nunca.'
              : 'Start free. Scale when you\'re ready. One platform for every side of professional networking — no per-event penalties, ever.'}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs md:text-sm text-muted-foreground">
            {[
              { icon: Shield, text: isPt ? 'Gratuito — para sempre' : 'Free tier — forever' },
              { icon: Calendar, text: isPt ? 'Sem taxas por evento' : 'No per-event fees' },
              { icon: CreditCard, text: isPt ? 'Cancela a qualquer momento' : 'Cancel anytime' },
              { icon: Globe, text: isPt ? 'Compatível com RGPD' : 'GDPR compliant' },
              { icon: Award, text: isPt ? 'Créditos nunca expiram' : 'Credits never expire' },
            ].map((g, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <g.icon className="h-3.5 w-3.5 text-green-500" />
                {g.text}
              </span>
            ))}
          </div>
        </div>

        {/* Segment Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-card border border-border rounded-xl p-1 gap-1">
            {(['solo', 'biz', 'org'] as Segment[]).map((seg) => (
              <button
                key={seg}
                onClick={() => { setSegment(seg); setBilling('monthly'); }}
                className={cn(
                  "px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200",
                  segment === seg
                    ? cn("text-white bg-gradient-to-r", segmentConfig[seg].accent)
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {segmentConfig[seg].label}
              </button>
            ))}
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="inline-flex bg-card border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                "px-4 py-1.5 text-xs md:text-sm font-medium transition-all",
                !isAnnual ? cn("text-white bg-gradient-to-r", cfg.accent) : "text-muted-foreground"
              )}
            >
              {isPt ? 'Mensal' : 'Monthly'}
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                "px-4 py-1.5 text-xs md:text-sm font-medium transition-all",
                isAnnual ? cn("text-white bg-gradient-to-r", cfg.accent) : "text-muted-foreground"
              )}
            >
              {isPt ? 'Anual' : 'Annual'}
            </button>
          </div>
          {isAnnual && (
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {isPt ? '15% desconto' : '15% off'}
            </span>
          )}
        </div>

        {/* Color accent bar */}
        <div className={cn("w-20 h-0.5 rounded-full mx-auto mb-4 bg-gradient-to-r", cfg.accent)} />

        {/* Segment description */}
        <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
          {cfg.desc}
        </p>

        {/* Plan Cards */}
        {segment === 'solo' && <SoloCards plans={soloPlans} isAnnual={isAnnual} isPt={isPt} />}
        {segment === 'biz' && <TieredCards plans={bizPlans} isAnnual={isAnnual} segment="biz" isPt={isPt} />}
        {segment === 'org' && <TieredCards plans={orgPlans} isAnnual={isAnnual} segment="org" isPt={isPt} />}

        {/* Visitor Credits Calculator */}
        {segment === 'org' && (
          <VisitorCreditsCalc
            credits={orgCredits}
            setCredits={setOrgCredits}
            segment="org"
            isPt={isPt}
            accent={cfg}
          />
        )}

        {/* Comparison section */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{comparison.title}</h2>
          <p className="text-sm text-muted-foreground text-center mb-8">{comparison.subtitle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparison.cards.map((card, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{
                  __html: card.text.replace(/€[\d.,]+\/m[oê]s?/g, '<strong class="text-pocketcv-orange">$&</strong>')
                    .replace(/€[\d.,]+/g, (m) => `<strong class="text-pocketcv-orange">${m}</strong>`)
                    .replace(/~€[\d.,]+\/user/g, '<strong class="text-pocketcv-orange">$&</strong>')
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Advantage strip for Solo */}
        {segment === 'solo' && (
          <div className="bg-muted/50 border border-border rounded-2xl p-5 md:p-6 mb-12">
            <h3 className="font-semibold text-sm mb-4">{isPt ? 'Porquê o PocketCV Gratuito é diferente' : 'Why PocketCV Free is different'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong className="text-sm">{isPt ? '50 contactos reais' : '50 real contacts'}</strong>
                <p className="text-xs text-muted-foreground mt-1">{isPt ? 'Generoso o suficiente para entregar valor genuíno — não um trial de 7 dias disfarçado de gratuito.' : 'Generous enough to deliver genuine value — not a 7-day trial disguised as free.'}</p>
              </div>
              <div>
                <strong className="text-sm">{isPt ? '€6/mês mensal' : '€6/mo monthly'}</strong>
                <p className="text-xs text-muted-foreground mt-1">{isPt ? 'Pro disponível mês-a-mês sem lock-in anual — uma flexibilidade que a maioria das plataformas não oferece.' : 'Pro is available month-to-month with no annual lock-in — a flexibility most platforms don\'t offer.'}</p>
              </div>
              <div>
                <strong className="text-sm">{isPt ? 'Follow-ups incluídos' : 'Follow-ups included'}</strong>
                <p className="text-xs text-muted-foreground mt-1">{isPt ? 'O principal problema do networking — follow-ups agendados — é o core do Pro. Não é um add-on premium.' : 'The #1 networking pain point — scheduled follow-ups — is the core Pro unlock. Not a premium add-on.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Advantage strip for Biz */}
        {segment === 'biz' && (
          <div className="bg-muted/50 border border-border rounded-2xl p-5 md:p-6 mb-12">
            <h3 className="font-semibold text-sm mb-4">{isPt ? 'O que torna isto diferente da abordagem habitual' : 'What makes this different from the usual approach'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong className="text-sm">{isPt ? 'Licença fixa, não por utilizador' : 'Flat license, not per-user'}</strong>
                <p className="text-xs text-muted-foreground mt-1">{isPt ? '€39/mês cobre 10 membros. Isso é ~€3.90/user — abaixo das taxas padrão (€5–€16/user/mês).' : '€39/mo covers 10 staff. That\'s ~€3.90/user — well below the per-user rates standard in this category.'}</p>
              </div>
              <div>
                <strong className="text-sm">{isPt ? 'Eventos ilimitados incluídos' : 'Unlimited events included'}</strong>
                <p className="text-xs text-muted-foreground mt-1">{isPt ? 'Todos os tiers Business incluem eventos ilimitados. Sem taxas de ativação por evento.' : 'Every Business tier includes unlimited events. No per-event activation fees.'}</p>
              </div>
              <div>
                <strong className="text-sm">{isPt ? 'Créditos, não taxas recorrentes' : 'Credits, not recurring fees'}</strong>
                <p className="text-xs text-muted-foreground mt-1">{isPt ? 'Créditos de visitantes são compra única. O custo mensal é fixo e previsível.' : 'Visitor credits are a one-time purchase. Your monthly cost is fixed and predictable.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Advantage strip for Org */}
        {segment === 'org' && (
          <div className="bg-muted/50 border border-border rounded-2xl p-5 md:p-6 mb-12">
            <h3 className="font-semibold text-sm mb-4">{isPt ? 'Um modelo de custos fundamentalmente diferente' : 'A fundamentally different cost model'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong className="text-sm">{isPt ? 'Sem taxas por registante' : 'No per-registrant fees'}</strong>
                <p className="text-xs text-muted-foreground mt-1">{isPt ? 'Um evento de 1.000 pessoas custa o mesmo que um de 50 em termos de licença. PocketCV recompensa eventos de sucesso.' : 'A 1,000-person event costs the same as a 50-person event in license terms. PocketCV rewards successful events.'}</p>
              </div>
              <div>
                <strong className="text-sm">{isPt ? 'Eventos ilimitados' : 'Unlimited events'}</strong>
                <p className="text-xs text-muted-foreground mt-1">{isPt ? 'Gere 1 evento ou 20. A licença mensal não muda. Apenas créditos de visitantes escalam com a utilização real.' : 'Run 1 event or 20. Your monthly license doesn\'t change. Only visitor credits scale with actual usage.'}</p>
              </div>
              <div>
                <strong className="text-sm">{isPt ? 'Créditos ficam mais baratos à escala' : 'Credits get cheaper at scale'}</strong>
                <p className="text-xs text-muted-foreground mt-1">{isPt ? 'De €0.25 até €0.08/crédito. Quanto mais os eventos crescem, menor o custo por participante.' : 'From €0.25 down to €0.08/credit. The more your events grow, the lower your per-attendee cost.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-pocketcv-orange/10 text-pocketcv-orange border-pocketcv-orange/20">FAQ</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">{isPt ? 'Perguntas frequentes' : 'Common questions'}</h2>
          </div>
          <div className="space-y-0">
            {faq.map((item, i) => (
              <div key={i} className="border-b border-border">
                <button
                  className="w-full py-4 flex items-center justify-between text-left gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-sm md:text-base">{item.q}</span>
                  <ChevronDown className={cn(
                    "h-5 w-5 text-pocketcv-orange flex-shrink-0 transition-transform duration-200",
                    openFaq === i && "rotate-180"
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  openFaq === i ? "max-h-96 pb-4" : "max-h-0"
                )}>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 py-12 border-t border-border">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {isPt ? 'Não tem a certeza de qual plano escolher?' : 'Not sure which plan fits?'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isPt ? 'Fale com alguém que realmente conhece o produto.' : 'Talk to someone who actually knows the product.'}
          </p>
          <Button size="lg" className="bg-gradient-to-r from-pocketcv-orange to-pocketcv-purple text-white" asChild>
            <a href="/contact">{isPt ? 'Agendar chamada de 20 min' : 'Book a 20-minute call'}</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

/* ──────────────────────── Solo Cards ──────────────────────── */
function SoloCards({ plans, isAnnual, isPt }: { plans: SoloPlan[]; isAnnual: boolean; isPt: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
      {plans.map((p, i) => {
        const shown = isAnnual && p.price > 0 ? p.annual : p.price;
        const orig = isAnnual && p.price > 0 ? p.price : null;
        const save = isAnnual && p.price > 0 ? `${isPt ? 'Poupa' : 'Save'} €${Math.round((p.price - p.annual) * 12)}/${isPt ? 'ano' : 'yr'}` : '';
        return (
          <div key={i} className={cn(
            "bg-card border rounded-2xl p-5 flex flex-col relative transition-all hover:shadow-lg",
            p.pop ? "border-2 border-pocketcv-orange pt-8" : "border-border"
          )}>
            {p.pop && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0 bg-pocketcv-orange text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-b-lg">
                {isPt ? 'Mais popular' : 'Most popular'}
              </span>
            )}
            <h3 className="text-xl font-bold mb-1">{p.name}</h3>
            <p className="text-xs text-muted-foreground mb-4 min-h-[30px]">{p.sub}</p>
            {orig && <p className="text-xs text-muted-foreground line-through">{fE(orig)}/{isPt ? 'mês' : 'mo'}</p>}
            <div className="flex items-baseline gap-0.5 mb-1">
              <span className="text-sm">€</span>
              <span className="text-4xl font-light">{shown === 0 ? '0' : (shown % 1 ? shown.toFixed(2) : shown)}</span>
              {p.price > 0 && <span className="text-xs text-muted-foreground ml-1">/{isPt ? 'mês' : 'mo'}</span>}
            </div>
            <p className="text-xs text-green-600 min-h-[16px] mb-4">{save}</p>
            <hr className="border-border mb-4" />
            <ul className="flex-1 space-y-2 mb-4">
              {p.feats.map((f, fi) => (
                <li key={fi} className={cn("flex items-start gap-2 text-xs", !f.on && "text-muted-foreground/40")}>
                  <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", f.on ? "bg-pocketcv-orange" : "bg-border")} />
                  {f.t}
                </li>
              ))}
            </ul>
            <Button
              className={cn(
                "w-full",
                p.ctaClass === 'free'
                  ? "bg-muted border border-border text-foreground hover:bg-muted/80"
                  : "bg-pocketcv-orange text-white hover:bg-pocketcv-orange/90"
              )}
              asChild
            >
              <a href="/login?signup=true">{p.cta}</a>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────── Tiered Cards ──────────────────────── */
function TieredCards({ plans, isAnnual, segment, isPt }: { plans: TieredPlan[]; isAnnual: boolean; segment: 'biz' | 'org'; isPt: boolean }) {
  const colors = {
    biz: { accent: 'bg-blue-600', accentLight: 'border-blue-600', dot: 'bg-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 text-white', ghost: 'border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent' },
    org: { accent: 'bg-purple-600', accentLight: 'border-purple-600', dot: 'bg-purple-600', btn: 'bg-purple-600 hover:bg-purple-700 text-white', ghost: 'border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent' },
  };
  const c = colors[segment];

  return (
    <div className="mb-8 overflow-x-auto -mx-4 px-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 min-w-[640px] md:min-w-0">
        {plans.map((p, i) => {
          const shown = isAnnual ? p.annual : p.price;
          const save = isAnnual ? `${isPt ? 'Poupa' : 'Save'} €${Math.round((p.price - p.annual) * 12)}/${isPt ? 'ano' : 'yr'}` : '';
          return (
            <div key={i} className={cn(
              "bg-card border rounded-2xl p-4 flex flex-col relative transition-all hover:shadow-lg",
              p.pop ? `border-2 ${c.accentLight} pt-7` : "border-border"
            )}>
              {p.pop && (
                <span className={cn("absolute top-0 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-b-lg", c.accent)}>
                  {isPt ? 'Mais popular' : 'Most popular'}
                </span>
              )}
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Tier {p.tier}</p>
              <p className="text-xs text-muted-foreground mb-3 min-h-[28px]">{p.sub}</p>
              {isAnnual && <p className="text-[10px] text-muted-foreground line-through">{fE(p.price)}/{isPt ? 'mês' : 'mo'}</p>}
              <div className="flex items-baseline gap-0.5 mb-0.5">
                <span className="text-xs">€</span>
                <span className="text-3xl font-light">{shown}</span>
                <span className="text-[10px] text-muted-foreground">/{isPt ? 'mês' : 'mo'}</span>
              </div>
              <p className="text-[10px] text-green-600 min-h-[14px] mb-3">{save}</p>
              <hr className="border-border mb-3" />
              <ul className="flex-1 space-y-1.5 mb-3">
                {p.feats.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-snug">
                    <span className={cn("w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0", c.dot)} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={cn("w-full text-xs h-9", p.ctaClass === 'ghost' ? cn("border", c.ghost) : c.btn)}
                variant={p.ctaClass === 'ghost' ? 'outline' : 'default'}
                asChild
              >
                <a href={p.ctaClass === 'ghost' ? '/contact' : '/login?signup=true'}>{p.cta}</a>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────── Visitor Credits Calculator ──────────────────────── */
function VisitorCreditsCalc({ credits, setCredits, segment, isPt, accent }: {
  credits: number;
  setCredits: (v: number) => void;
  segment: 'biz' | 'org';
  isPt: boolean;
  accent: { accentText: string; accent: string };
}) {
  const ppu = getPPU(credits);
  const cost = ppu ? Math.round(credits * ppu) : null;
  const mo12 = cost ? fE(Math.round(cost / 12)) : null;

  const accentColor = segment === 'biz' ? 'text-blue-600' : 'text-purple-600';

  return (
    <div className="bg-card border border-border rounded-2xl p-5 md:p-8 mb-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold mb-1">{isPt ? 'Créditos de visitantes' : 'Visitor credits'}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {segment === 'biz'
              ? (isPt ? 'Compra única, partilhada por todos os eventos. Créditos nunca expiram até serem usados.' : 'One-time purchase, shared across all events. Credits never expire until they\'re used.')
              : (isPt ? 'Cada visitante que faz check-in consome um crédito. Créditos transitam entre eventos — compra em bulk e usa ao longo do ano.' : 'Each visitor checking in consumes one credit. Credits carry across all your events — buy in bulk, use across the year.')}
          </p>
        </div>
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
          {isPt ? 'Compra uma vez. Usa para sempre.' : 'Buy once. Use forever.'}
        </span>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-4 mb-2">
        <label className="text-sm text-muted-foreground min-w-[140px]">{isPt ? 'Créditos a comprar' : 'Credits to purchase'}</label>
        <Slider
          value={[credits]}
          onValueChange={([v]) => setCredits(v)}
          min={100}
          max={50000}
          step={100}
          className="flex-1"
        />
        <span className="text-sm font-semibold min-w-[80px] text-right">{fN(credits)}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {segment === 'org'
          ? (isPt ? 'Um evento de 1.000 pessoas consome 1.000 créditos. A 2.001–6.000 créditos, cada custa apenas €0.15.' : 'A 1,000-person event consumes 1,000 credits. At 2,001–6,000 credits, each costs just €0.15.')
          : (isPt ? 'Créditos partilhados entre eventos ilimitados. Créditos não usados transitam — sem expiração, sem penalizações.' : 'Credits are shared across unlimited events. Unused credits carry over — no expiry, no penalties.')}
      </p>

      {/* Result */}
      <div className="bg-muted rounded-xl p-4 flex items-center justify-between mb-6 flex-wrap gap-3">
        <span className="text-sm text-muted-foreground">
          {fN(credits)} {isPt ? 'créditos' : 'credits'} × {ppu ? fE(ppu, 2) : 'custom'}/{isPt ? 'crédito' : 'credit'}
        </span>
        <div className="text-right">
          <span className={cn("text-2xl font-bold", accentColor)}>
            {cost ? fE(cost) + (isPt ? ' (único)' : ' once') : (isPt ? 'Contacte-nos' : 'Contact us')}
          </span>
          {mo12 && <p className="text-xs text-muted-foreground">~{mo12}/{isPt ? 'mês se distribuído em 12 meses' : 'mo if spread over 12 months'}</p>}
        </div>
      </div>

      {/* Volume table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">{isPt ? 'Pack' : 'Pack size'}</th>
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">{isPt ? 'Por crédito' : 'Per credit'}</th>
              <th className="text-left py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">{isPt ? 'Poupança' : 'Saving'}</th>
              <th className="text-right py-2 px-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">{isPt ? 'Total do pack' : 'Your pack total'}</th>
            </tr>
          </thead>
          <tbody>
            {VISITOR_TIERS.map((t, i) => {
              const active = credits >= t.min && credits <= t.max;
              const label = t.max === 1e9 ? fN(t.min) + '+' : fN(t.min) + '–' + fN(t.max);
              const ppuText = t.ppu ? fE(t.ppu, 2) : 'Custom';
              const pct = i > 0 && VISITOR_TIERS[i - 1].ppu && t.ppu ? '-' + Math.round((1 - t.ppu / VISITOR_TIERS[i - 1].ppu!) * 100) + '%' : '—';
              const total = t.ppu && active ? fE(Math.round(credits * t.ppu)) : '—';
              return (
                <tr key={i} className={cn("border-b border-border", active && "bg-pocketcv-orange/5")}>
                  <td className="py-2 px-3 text-sm">{label}</td>
                  <td className={cn("py-2 px-3 text-sm", active && cn("font-semibold", accentColor))}>{ppuText}</td>
                  <td className="py-2 px-3 text-xs text-green-600">{pct}</td>
                  <td className={cn("py-2 px-3 text-sm text-right", active && "font-semibold")}>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PricingGrid;
