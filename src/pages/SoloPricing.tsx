import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Check, X, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SoloPricing = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");

  const isAnnual = billing === "annual";

  const plans = [
    {
      name: isPt ? "Gratuito" : "Free",
      price: 0,
      annualPrice: 0,
      badge: isPt ? "Ativo" : "Active",
      badgeColor: "bg-green-100 text-green-700",
      description: isPt
        ? "Comece sem compromisso. Tudo o que precisa para criar o seu perfil digital e começar a fazer networking."
        : "Get started with no commitment. Everything you need to create your digital profile and start networking.",
      cta: isPt ? "Começar grátis" : "Start free",
      ctaStyle: "border border-border text-foreground hover:bg-muted",
      features: [
        { text: isPt ? "Perfil digital + QR & NFC" : "Digital profile + QR & NFC", included: true },
        { text: isPt ? "Até 50 contactos" : "Up to 50 contacts", included: true },
        { text: isPt ? "Notas e etiquetas de leads" : "Lead notes & tags", included: true },
        { text: isPt ? "Lembretes manuais" : "Manual reminders", included: true },
        { text: isPt ? "Follow-ups agendados" : "Scheduled follow-ups", included: false },
        { text: isPt ? "Integrações CRM" : "CRM integrations", included: false },
        { text: isPt ? "Contactos ilimitados" : "Unlimited contacts", included: false },
        { text: isPt ? "Suporte prioritário" : "Priority support", included: false },
        { text: isPt ? "Exportação de dados" : "Data export", included: false },
      ],
    },
    {
      name: "Pro",
      price: 6,
      annualPrice: 5.10,
      badge: isPt ? "Popular" : "Popular",
      badgeColor: "bg-pocketcv-purple/10 text-pocketcv-purple",
      description: isPt
        ? "Para quem leva o networking a sério. Contactos ilimitados, follow-ups automáticos e integrações CRM."
        : "For serious networkers. Unlimited contacts, automated follow-ups, and CRM integrations.",
      cta: isPt ? "Obter Pro" : "Get Pro",
      ctaStyle: "bg-foreground text-background hover:bg-foreground/90",
      features: [
        { text: isPt ? "Perfil digital + QR & NFC" : "Digital profile + QR & NFC", included: true },
        { text: isPt ? "Contactos ilimitados" : "Unlimited contacts", included: true },
        { text: isPt ? "Notas e etiquetas de leads" : "Lead notes & tags", included: true },
        { text: isPt ? "Follow-ups agendados e lembretes" : "Scheduled follow-ups & reminders", included: true },
        { text: isPt ? "Exportação e integrações CRM" : "CRM export & integrations", included: true },
        { text: isPt ? "Suporte email prioritário" : "Priority email support", included: true },
        { text: isPt ? "Modos de cartão avançados" : "Advanced card modes", included: true },
        { text: isPt ? "Analytics de perfil" : "Profile analytics", included: true },
        { text: isPt ? "Exportação de dados" : "Data export", included: true },
      ],
    },
  ];

  const currentPrice = (plan: typeof plans[0]) =>
    isAnnual ? plan.annualPrice : plan.price;

  const annualTotal = (plan: typeof plans[0]) =>
    Math.round(plan.annualPrice * 12);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-5 py-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>

          {/* Billing toggle */}
          <div className="flex items-center bg-muted rounded-full p-0.5 text-sm">
            <button
              onClick={() => setBilling("annual")}
              className={`px-4 py-1.5 rounded-full font-medium transition-all text-xs ${
                isAnnual
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isPt ? "Anual" : "Annual"}
            </button>
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-full font-medium transition-all text-xs ${
                !isAnnual
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isPt ? "Mensal" : "Monthly"}
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-8">
          Pricing
        </h1>

        {/* Plan cards */}
        <div className="space-y-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`rounded-2xl border overflow-hidden ${
                plan.name === "Pro"
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-border"
              }`}
            >
              <div className="p-6">
                {/* Plan name + badge */}
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className={`text-lg font-semibold ${
                      plan.name === "Pro" ? "text-background" : "text-foreground"
                    }`}
                  >
                    {plan.name}
                  </h2>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      plan.name === "Pro"
                        ? "bg-background/15 text-background"
                        : plan.badgeColor
                    }`}
                  >
                    {plan.badge} {plan.name === "Pro" && isAnnual && (
                      <>{isPt ? "Poupe 15%" : "Save 15%"}</>
                    )}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-1">
                  {isAnnual && plan.price > 0 && (
                    <span
                      className={`text-2xl font-bold line-through ${
                        plan.name === "Pro"
                          ? "text-background/40"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      €{plan.price}
                    </span>
                  )}
                  <span
                    className={`text-4xl font-bold tracking-tight ${
                      plan.name === "Pro" ? "text-background" : "text-foreground"
                    }`}
                  >
                    €{currentPrice(plan).toFixed(plan.price === 0 ? 0 : 2)}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.name === "Pro"
                        ? "text-background/60"
                        : "text-muted-foreground"
                    }`}
                  >
                    / {isPt ? "mês" : "month"} (EUR)
                  </span>
                </div>

                {isAnnual && plan.price > 0 && (
                  <p
                    className={`text-xs mb-4 ${
                      plan.name === "Pro"
                        ? "text-background/50"
                        : "text-muted-foreground"
                    }`}
                  >
                    €{annualTotal(plan)} {isPt ? "cobrado anualmente" : "billed yearly"}
                  </p>
                )}

                {plan.price === 0 && <div className="mb-4" />}

                {/* Description */}
                <p
                  className={`text-sm leading-relaxed mb-6 ${
                    plan.name === "Pro"
                      ? "text-background/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>

                {/* Separator */}
                <div
                  className={`border-t mb-5 border-dashed ${
                    plan.name === "Pro" ? "border-background/20" : "border-border"
                  }`}
                />

                {/* Features */}
                <ul className="space-y-3.5">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3">
                      {feat.included ? (
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.name === "Pro"
                              ? "bg-green-400/20"
                              : "bg-green-100 dark:bg-green-900/30"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${
                              plan.name === "Pro"
                                ? "text-green-300"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X
                            className={`w-3.5 h-3.5 ${
                              plan.name === "Pro"
                                ? "text-background/30"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feat.included
                            ? plan.name === "Pro"
                              ? "text-background/90"
                              : "text-foreground"
                            : plan.name === "Pro"
                            ? "text-background/35"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to="/auth"
                  className={`mt-6 w-full h-12 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                    plan.name === "Pro"
                      ? "bg-background text-foreground hover:bg-background/90"
                      : plan.ctaStyle
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-8 text-center">
          <Link
            to="/pricing"
            className="text-sm text-muted-foreground hover:text-pocketcv-purple transition-colors"
          >
            {isPt ? "Ver todos os planos →" : "View all plans →"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SoloPricing;
