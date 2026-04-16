// Pricing data extracted from the HTML pricing documents

export interface SoloPlan {
  name: string;
  sub: string;
  price: number;
  annual: number;
  pop?: boolean;
  ctaClass: 'free' | 'solo';
  cta: string;
  feats: { t: string; on: boolean }[];
}

export interface TieredPlan {
  tier: string;
  sub: string;
  price: number;
  annual: number;
  pop?: boolean;
  cta: string;
  ctaClass: 'filled' | 'ghost';
  feats: string[];
}

export interface VisitorTier {
  min: number;
  max: number;
  ppu: number | null;
}

export const VISITOR_TIERS: VisitorTier[] = [
  { min: 100, max: 500, ppu: 0.25 },
  { min: 501, max: 2000, ppu: 0.20 },
  { min: 2001, max: 6000, ppu: 0.15 },
  { min: 6001, max: 15000, ppu: 0.11 },
  { min: 15001, max: 50000, ppu: 0.08 },
  { min: 50001, max: 1e9, ppu: null },
];

export function getPPU(n: number): number | null {
  const tier = VISITOR_TIERS.find(t => n >= t.min && n <= t.max);
  return tier ? tier.ppu : null;
}

export function fN(n: number): string {
  return Math.round(n).toLocaleString('en');
}

export function fE(n: number, d = 0): string {
  return '€' + (+n).toLocaleString('en', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function getSoloPlans(isPt: boolean): SoloPlan[] {
  return [
    {
      name: isPt ? 'Gratuito' : 'Free',
      sub: isPt ? 'Sem cartão. Sem compromisso.' : 'No card. No catch.',
      price: 0, annual: 0,
      cta: isPt ? 'Começar grátis' : 'Start free',
      ctaClass: 'free',
      feats: [
        { t: isPt ? 'Perfil digital + QR & NFC' : 'Digital profile + QR & NFC', on: true },
        { t: isPt ? 'Até 50 contactos' : 'Up to 50 contacts', on: true },
        { t: isPt ? 'Notas e etiquetas de leads' : 'Lead notes & tags', on: true },
        { t: isPt ? 'Lembretes manuais' : 'Manual reminders', on: true },
        { t: isPt ? 'Follow-ups agendados' : 'Scheduled follow-ups', on: false },
        { t: isPt ? 'Integrações CRM' : 'CRM integrations', on: false },
        { t: isPt ? 'Contactos ilimitados' : 'Unlimited contacts', on: false },
      ],
    },
    {
      name: 'Pro',
      sub: isPt ? 'Networking sério, sem lock-in.' : 'Serious networking, zero lock-in.',
      price: 6, annual: 5.10, pop: true,
      cta: isPt ? 'Obter Pro' : 'Get Pro',
      ctaClass: 'solo',
      feats: [
        { t: isPt ? 'Tudo do Gratuito' : 'Everything in Free', on: true },
        { t: isPt ? 'Contactos ilimitados' : 'Unlimited contacts', on: true },
        { t: isPt ? 'Follow-ups agendados e lembretes' : 'Scheduled follow-ups & reminders', on: true },
        { t: isPt ? 'Exportação e integrações CRM' : 'CRM export & integrations', on: true },
        { t: isPt ? 'Suporte email prioritário' : 'Priority email support', on: true },
      ],
    },
  ];
}

export function getBizPlans(isPt: boolean): TieredPlan[] {
  return [
    { tier: 'XS', sub: isPt ? '2–10 membros' : '2–10 staff', price: 39, annual: 33, cta: isPt ? 'Começar' : 'Get started', ctaClass: 'filled',
      feats: isPt ? ['Até 10 contas','Dashboard de leads','Captura QR & NFC','Analytics básico','Exportação CRM'] : ['Up to 10 accounts','Lead dashboard','QR & NFC capture','Basic analytics','CRM export'] },
    { tier: 'S', sub: isPt ? '11–30 membros' : '11–30 staff', price: 79, annual: 67, pop: true, cta: isPt ? 'Começar' : 'Get started', ctaClass: 'filled',
      feats: isPt ? ['Até 30 contas','Dashboard de equipa','Agendamento de follow-ups','Integrações CRM','Relatórios de eventos'] : ['Up to 30 accounts','Team dashboard','Follow-up scheduling','CRM integrations','Event reporting'] },
    { tier: 'M', sub: isPt ? '31–100 membros' : '31–100 staff', price: 149, annual: 127, cta: isPt ? 'Começar' : 'Get started', ctaClass: 'filled',
      feats: isPt ? ['Até 100 contas','Analytics avançado','Follow-ups automatizados','Acesso baseado em funções','Suporte prioritário'] : ['Up to 100 accounts','Advanced analytics','Automated follow-ups','Role-based access','Priority support'] },
    { tier: 'L', sub: isPt ? '101–300 membros' : '101–300 staff', price: 269, annual: 229, cta: isPt ? 'Começar' : 'Get started', ctaClass: 'filled',
      feats: isPt ? ['Até 300 contas','Perfis white-label','Leaderboards de equipa','Campos CRM personalizados','Suporte dedicado'] : ['Up to 300 accounts','White-label profiles','Team leaderboards','Custom CRM fields','Dedicated support'] },
    { tier: 'XL', sub: isPt ? '301+ membros' : '301+ staff', price: 399, annual: 339, cta: isPt ? 'Contactar vendas' : 'Contact sales', ctaClass: 'ghost',
      feats: isPt ? ['Contas ilimitadas','CSM dedicado','Integrações personalizadas','SSO & RBAC','99.9% SLA'] : ['Unlimited accounts','Dedicated CSM','Custom integrations','SSO & RBAC','99.9% SLA'] },
  ];
}

export function getOrgPlans(isPt: boolean): TieredPlan[] {
  return [
    { tier: 'XS', sub: isPt ? '1–3 staff' : '1–3 staff', price: 79, annual: 67, cta: isPt ? 'Começar' : 'Get started', ctaClass: 'filled',
      feats: isPt ? ['Até 3 membros','Eventos ilimitados','Check-in QR','Analytics básico','Exportação de leads'] : ['Up to 3 team members','Unlimited events','QR check-in','Basic analytics','Lead export'] },
    { tier: 'S', sub: isPt ? '4–10 staff' : '4–10 staff', price: 149, annual: 127, pop: true, cta: isPt ? 'Começar' : 'Get started', ctaClass: 'filled',
      feats: isPt ? ['Até 10 membros','Analytics em tempo real','Módulos de patrocinadores','Dashboards de expositores','Inquéritos de satisfação'] : ['Up to 10 team members','Real-time analytics','Sponsor modules','Exhibitor dashboards','Satisfaction surveys'] },
    { tier: 'M', sub: isPt ? '11–30 staff' : '11–30 staff', price: 279, annual: 237, cta: isPt ? 'Começar' : 'Get started', ctaClass: 'filled',
      feats: isPt ? ['Até 30 membros','Tracking de sessões/stands','Relatórios pós-evento','Plataforma white-label','Suporte prioritário'] : ['Up to 30 team members','Session/booth tracking','Post-event reports','White-label platform','Priority support'] },
    { tier: 'L', sub: isPt ? '31–80 staff' : '31–80 staff', price: 449, annual: 382, cta: isPt ? 'Começar' : 'Get started', ctaClass: 'filled',
      feats: isPt ? ['Até 80 membros','Branding personalizado','Relatórios ROI avançados','Acesso API','Suporte dedicado'] : ['Up to 80 team members','Custom branding','Advanced ROI reports','API access','Dedicated support'] },
    { tier: 'XL', sub: isPt ? '81+ staff' : '81+ staff', price: 649, annual: 552, cta: isPt ? 'Contactar vendas' : 'Contact sales', ctaClass: 'ghost',
      feats: isPt ? ['Membros ilimitados','CSM dedicado','Integrações personalizadas','SLA Enterprise','Suporte on-site opcional'] : ['Unlimited team members','Dedicated CSM','Custom integrations','Enterprise SLA','On-site support option'] },
  ];
}

export function getComparisonCards(segment: 'solo' | 'biz' | 'org', isPt: boolean) {
  if (segment === 'solo') {
    return {
      title: isPt ? 'Porquê o PocketCV Pro?' : 'Why PocketCV Pro?',
      subtitle: isPt ? 'Mais barato que a concorrência. Mais incluído. Sem lock-in.' : 'Cheaper than the competition. More included. No lock-in.',
      cards: [
        { title: 'vs. Blinq Pro', text: isPt ? 'Blinq Pro custa €7.33/mês — apenas anual. PocketCV Pro é €6/mês mensal ou €5.10/mês anual, com follow-ups e CRM incluídos.' : 'Blinq Pro is €7.33/mo — annual only, no monthly option. PocketCV Pro is €6/mo monthly or €5.10/mo annual, with follow-ups and CRM included.' },
        { title: 'vs. Popl Pro', text: isPt ? 'Popl Pro custa €6.49/mês — apenas anual. PocketCV oferece uma opção mensal genuína e inclui follow-ups agendados.' : 'Popl Pro is €6.49/mo — annual only. PocketCV gives you a genuine monthly option and includes scheduled follow-ups that Popl gates behind higher plans.' },
        { title: isPt ? 'Gratuito, a sério' : 'Free, and meaning it', text: isPt ? 'A maioria dos planos gratuitos expira ou limita o produto. PocketCV Free é permanentemente gratuito — 50 contactos, QR completo, notas e etiquetas. Sem truques.' : 'Most free tiers expire or cripple the product. PocketCV Free is permanently free — 50 contacts, full QR sharing, real notes and tags. No gotchas.' },
      ],
    };
  }
  if (segment === 'biz') {
    return {
      title: isPt ? 'Feito para toda a tua equipa' : 'Built for your whole team',
      subtitle: isPt ? 'Eventos ilimitados em todos os planos. Sem taxas por evento. Nunca.' : 'Unlimited events in every plan. No per-event fees. Ever.',
      cards: [
        { title: 'vs. Popl Teams', text: isPt ? 'Popl Teams começa em ~€16/user/mês sem gestão de eventos. PocketCV Business XS é €39/mês para 10 membros — ~€3.90/user.' : 'Popl Teams starts at ~€16/user/mo with no event management. PocketCV Business XS is €39/mo for up to 10 staff — ~€3.90/user.' },
        { title: 'vs. Blinq Business', text: isPt ? 'Blinq Business custa €5/user/mês, mas cobra €199/mês extra só para captura de leads em eventos. PocketCV inclui tudo.' : 'Blinq Business is €5/user/mo, but charges a separate €199/mo add-on just to access event lead capture. PocketCV bundles it.' },
        { title: isPt ? 'Eventos ilimitados, um preço' : 'Unlimited events, one price', text: isPt ? 'Todos os planos Business incluem eventos ilimitados. Gere 1 ou 100 eventos — a sua licença não muda.' : 'Every Business plan includes unlimited events. Run 1 event or 100 — your license doesn\'t change. Visitor credits are the only usage-based cost.' },
      ],
    };
  }
  return {
    title: isPt ? 'O ROI que os teus patrocinadores querem' : 'The ROI your sponsors actually want',
    subtitle: isPt ? 'Dados em tempo real. Sem penalizações por registante. Feito para escalar.' : 'Real-time data. No per-registrant penalties. Built to scale.',
    cards: [
      { title: 'vs. Cvent', text: isPt ? 'Cvent cobra €3–€12 por registante sobre uma licença anual grande. Um evento de 1.000 pessoas custa milhares em taxas. PocketCV: uma licença fixa.' : 'Cvent charges €3–€12 per registrant on top of a large annual license. A 1,000-person event costs thousands in fees alone. PocketCV: one flat license.' },
      { title: 'vs. vFairs', text: isPt ? 'vFairs cobra por evento sem desconto de volume. PocketCV Organizer XL é €649/mês para eventos ilimitados.' : 'vFairs prices per event with no volume discount. PocketCV Organizer XL is €649/mo for unlimited events — comparable vFairs starts at €1,999+/event.' },
      { title: isPt ? 'Sucesso não deve custar mais' : 'Success shouldn\'t cost more', text: isPt ? 'Quanto mais visitantes o teu evento atrair, mais barato fica cada crédito. PocketCV recompensa eventos bem-sucedidos.' : 'The more visitors your event attracts, the cheaper each credit becomes. PocketCV rewards successful events — it doesn\'t penalise them.' },
    ],
  };
}

export function getFAQ(isPt: boolean) {
  return [
    {
      q: isPt ? 'O plano Gratuito é realmente gratuito — para sempre?' : 'Is the Free plan really free — forever?',
      a: isPt ? 'Sim. PocketCV Free é permanentemente gratuito, sem limite de tempo, sem cartão de crédito, e sem degradação de funcionalidades. Recebes 50 contactos, partilha QR e NFC completa, notas de leads e etiquetas — um produto genuinamente utilizável, não uma demo.' : 'Yes. PocketCV Free is permanently free, with no time limit, no credit card required, and no feature degradation over time. You get 50 contacts, full QR and NFC sharing, lead notes, and tags — a genuinely usable product, not a demo.',
    },
    {
      q: isPt ? 'O que são créditos de visitantes?' : 'What exactly are visitor credits?',
      a: isPt ? 'Créditos de visitantes são uma compra única usada por clientes Business e Organizadores de Eventos. Cada crédito é consumido quando um visitante faz check-in ou interage com o seu evento via PocketCV. Créditos nunca expiram — uma vez comprados, ficam na sua conta até serem usados.' : 'Visitor credits are a one-time purchase used by Business and Event Organizer clients. Each credit is consumed when a visitor checks in to or interacts with your event via PocketCV. Credits never expire — once purchased, they stay in your account until used.',
    },
    {
      q: isPt ? 'Preciso pagar por evento?' : 'Do I need to pay per event?',
      a: isPt ? 'Não. Todos os planos Business e Organizador incluem eventos ilimitados. A sua licença mensal ou anual cobre todos. O único custo baseado em utilização são créditos de visitantes.' : 'No. Every Business and Event Organizer plan includes unlimited events. Your monthly or annual license covers all of them. The only usage-based cost is visitor credits, which you purchase once and draw down across any number of events.',
    },
    {
      q: isPt ? 'Posso alternar entre mensal e anual?' : 'Can I switch between monthly and annual?',
      a: isPt ? 'Sim. Pode mudar de mensal para anual a qualquer momento e beneficiar imediatamente dos 15% de desconto. A mudança de anual para mensal entra em vigor no final do período anual atual.' : 'Yes. You can switch from monthly to annual at any time and immediately lock in the 15% saving. Switching from annual back to monthly takes effect at the end of your current annual period.',
    },
    {
      q: isPt ? 'Com que CRMs o PocketCV integra?' : 'What CRMs does PocketCV integrate with?',
      a: isPt ? 'PocketCV integra nativamente com Salesforce, HubSpot e Pipedrive no Pro e superior. Todos os planos incluem exportação CSV/XLS. Zapier e acesso API nativo estão disponíveis nos planos Business e Organizador maiores.' : 'PocketCV integrates with Salesforce, HubSpot, and Pipedrive natively on Pro and above. All plans include CSV/XLS export. Zapier and native API access are available on larger Business and Organizer plans.',
    },
    {
      q: isPt ? 'Os destinatários precisam de descarregar uma app?' : 'Do recipients need to download an app?',
      a: isPt ? 'Não. Quando alguém digitaliza o seu código QR ou toca no seu cartão NFC, vai diretamente ao seu perfil PocketCV no navegador — sem download, sem registo necessário.' : 'No. When someone scans your QR code or taps your NFC card, they go directly to your PocketCV profile in their browser — no app download, no sign-up required.',
    },
    {
      q: isPt ? 'O PocketCV é compatível com o RGPD?' : 'Is PocketCV GDPR compliant?',
      a: isPt ? 'Sim. PocketCV inclui captura de contacto baseada em consentimento (opt-in RGPD), eliminação de dados a pedido, armazenamento encriptado e um framework de privacidade claro.' : 'Yes. PocketCV includes consent-based contact capture (GDPR-compliant opt-in confirmation), data deletion on request, encrypted storage, and a clear privacy framework.',
    },
  ];
}
