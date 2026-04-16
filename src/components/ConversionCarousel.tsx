import React, { useState, useEffect, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Users, TrendingUp, BarChart3, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import iconLeadCapture from "@/assets/icon-leadcapture.png";
import iconEvent from "@/assets/icon-event.png";

const ThreeLavaLamp = lazy(() => import("@/components/ui/ThreeLavaLamp"));


const ConversionCarousel = () => {
  const { language } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const slides = [
    {
      icon: iconLeadCapture,
      headline: {
        en: "Are you losing your leads?",
        pt: "Está a perder os seus leads?",
      },
      statTag: {
        en: "79% of event leads never get a follow-up",
        pt: "79% dos leads de eventos nunca recebem follow-up",
      },
      statBold: {
        en: "Did you know that 79% of event leads never get a follow-up? PocketCV ensures yours do.",
        pt: "Sabia que 79% dos leads de eventos nunca recebem follow-up? A PocketCV garante que os seus recebem.",
      },
      bodyRest: {
        en: "Stop juggling business cards, notes, and spreadsheets. With one tap, capture every new connection, organize contacts automatically, and trigger personalized follow-ups that turn conversations into measurable conversions.",
        pt: "Pare de fazer malabarismos com cartões de visita, notas e folhas de cálculo. Com um toque, capture cada nova conexão, organize os contactos automaticamente e acione follow-ups personalizados que transformam conversas em conversões mensuráveis.",
      },
      features: [
        {
          icon: Zap,
          label: { en: "Instant Capture", pt: "Captura Instantânea" },
        },
        {
          icon: Users,
          label: { en: "Automated Follow-Up", pt: "Follow-Up Automatizado" },
        },
        {
          icon: TrendingUp,
          label: { en: "Measurable ROI", pt: "ROI Mensurável" },
        },
      ],
    },
    {
      icon: iconEvent,
      headline: {
        en: "Can you track your event's engagement?",
        pt: "Consegue rastrear o engagement do seu evento?",
      },
      statTag: {
        en: "1 in 3 organizers can't prove event performance",
        pt: "1 em 3 organizadores não consegue provar o desempenho",
      },
      statBold: {
        en: "Did you know that 1 in 3 organizers can't properly prove their event's performance?",
        pt: "Sabia que 1 em cada 3 organizadores não consegue provar adequadamente o desempenho do seu evento?",
      },
      bodyRest: {
        en: "Stop being in the dark about the success rate of your events. With us, you can now track in real time your event's engagement rate. PocketCV will be your guiding light.",
        pt: "Deixe de estar às escuras sobre a taxa de sucesso dos seus eventos. Connosco, pode agora acompanhar em tempo real a taxa de engagement do seu evento. A PocketCV será a sua luz guia.",
      },
      features: [
        {
          icon: BarChart3,
          label: { en: "Real-Time Analytics", pt: "Análise em Tempo Real" },
        },
        {
          icon: Activity,
          label: { en: "Engagement Tracking", pt: "Rastreamento de Engagement" },
        },
        {
          icon: TrendingUp,
          label: { en: "Performance Proof", pt: "Prova de Desempenho" },
        },
      ],
    },
  ];

  const ctaText = isPortuguese(language)
    ? "Conheça os Nossos Planos"
    : "Get to Know Our Plans";

  return (
    <section className="relative py-8 md:py-12 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-purple-950" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <Carousel setApi={setApi} opts={{ loop: true }} className="relative">
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="grid md:grid-cols-[2fr,3fr] gap-0 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Left Panel - Lava Lamp Background */}
                  <div className="relative p-8 md:p-12 flex flex-col justify-between text-white min-h-[400px] md:min-h-[500px] overflow-hidden">
                    {/* Three.js Lava Lamp Background - lazy loaded for performance */}
                    <div className="absolute inset-0">
                      <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-purple-700 to-orange-500" />}>
                        <ThreeLavaLamp
                          colors={
                            index === 0
                              ? ["#7c3aed", "#a855f7", "#f97316", "#ea580c"]
                              : ["#fb923c", "#fdba74", "#a855f7", "#7c3aed"]
                          }
                        />
                      </Suspense>
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 mb-auto">
                      <img
                        src={slide.icon}
                        alt="Icon"
                        loading="lazy"
                        decoding="async"
                        className="w-16 h-16 md:w-20 md:h-20"
                      />
                    </div>

                    <div className="relative z-10 space-y-6">
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                        {isPortuguese(language)
                          ? slide.headline.pt
                          : slide.headline.en}
                      </h2>
                      
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                        <span className="text-white/90 font-medium">
                          {isPortuguese(language)
                            ? slide.statTag.pt
                            : slide.statTag.en}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Light Background */}
                  <div className="bg-white p-8 md:p-12 flex flex-col justify-between">
                    <div className="space-y-6">
                      {/* Stat - Bold */}
                      <p className="text-gray-900 text-lg md:text-xl font-semibold leading-relaxed">
                        {isPortuguese(language)
                          ? slide.statBold.pt
                          : slide.statBold.en}
                      </p>
                      
                      {/* Body Text */}
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                        {isPortuguese(language)
                          ? slide.bodyRest.pt
                          : slide.bodyRest.en}
                      </p>

                      {/* CTA Button */}
                      <Link to="/login" className="mt-8 inline-block">
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                        >
                          {ctaText}
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-3 mt-8">
                      {slide.features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-2 text-sm"
                          >
                            <Icon className="w-4 h-4 text-purple-600" />
                            <span className="text-purple-900 font-medium">
                              {isPortuguese(language)
                                ? feature.label.pt
                                : feature.label.en}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          <CarouselPrevious className="left-4 md:-left-12" />
          <CarouselNext className="right-4 md:-right-12" />

          {/* Dot Indicators */}
          <div className="flex justify-center items-center gap-3 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === index
                    ? "w-8 bg-purple-600"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default ConversionCarousel;
