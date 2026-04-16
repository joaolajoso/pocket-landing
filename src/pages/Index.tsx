import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { useTheme } from "@/contexts/ThemeContext";
import MarqueeSection from "@/components/MarqueeSection";
import ValuePropsSection from "@/components/ValuePropsSection";
import WhoIsItForSection from "@/components/WhoIsItForSection";
import HowItWorks from "@/components/HowItWorks";
import StatsSection from "@/components/StatsSection";
import TrustedBySection from "@/components/TrustedBySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CardShowcaseSection from "@/components/CardShowcaseSection";
import FoundersSection from "@/components/FoundersSection";
import ChooseRoleSection from "@/components/ChooseRoleSection";
import FAQ from "@/components/FAQ";
import CTABandSection from "@/components/CTABandSection";
import Footer from "@/components/Footer";
import SEOStructuredData from "@/components/SEOStructuredData";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Helmet } from "react-helmet";
import heroImage from "@/assets/hero-networking-final.webp";

const Index = () => {
  const { language } = useLanguage();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <html lang={language} />
        <link rel="preload" as="image" href={heroImage} />
        <title>
          {isPortuguese(language)
            ? 'PocketCV - Cartão de Visita Digital com NFC | Networking Profissional'
            : 'PocketCV - Digital Business Card with NFC | Professional Networking'}
        </title>
        <meta name="description" content={isPortuguese(language)
          ? 'Crie seu cartão de visita digital com tecnologia NFC. Compartilhe seu perfil profissional com um toque. Ideal para equipes de venda e captura de leads em eventos.'
          : 'Create your digital business card with NFC technology. Share your professional profile with a tap. Perfect for sales teams and lead capture at events.'} />
        <meta name="keywords" content={isPortuguese(language)
          ? 'cartão de visita digital, NFC, networking profissional, Portugal, cartão inteligente, perfil digital'
          : 'digital business card, NFC, professional networking, smart card, digital profile, networking'} />
        <link rel="canonical" href={window.location.origin} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="PocketCV" />
        <link rel="alternate" hrefLang="en" href={`${window.location.origin}?lang=en`} />
        <link rel="alternate" hrefLang="pt" href={`${window.location.origin}?lang=pt`} />
        <link rel="alternate" hrefLang="x-default" href={window.location.origin} />
        <meta property="og:title" content={isPortuguese(language) ? 'PocketCV - Cartão de Visita Digital com NFC' : 'PocketCV - Digital Business Card with NFC'} />
        <meta property="og:description" content={isPortuguese(language) ? 'Compartilhe seu perfil profissional com um toque usando nosso cartão NFC.' : 'Share your professional profile with a tap using our NFC card.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:locale" content={isPortuguese(language) ? 'pt_PT' : 'en_US'} />
        <meta property="og:site_name" content="PocketCV" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={isPortuguese(language) ? 'PocketCV - Cartão de Visita Digital' : 'PocketCV - Digital Business Card'} />
        <meta name="twitter:description" content={isPortuguese(language) ? 'Networking profissional simplificado com tecnologia NFC' : 'Professional networking simplified with NFC technology'} />
      </Helmet>

      <SEOStructuredData page="home" />

      <Navbar />
      <main className="flex-1">
        <Hero className="pb-0" />
        <MarqueeSection />
        <ValuePropsSection />
        <WhoIsItForSection />
        <HowItWorks />
        <StatsSection />
        <TrustedBySection />
        <CardShowcaseSection />
        <TestimonialsSection />
        <FoundersSection />
        <ChooseRoleSection />
        <FAQ />
        <CTABandSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
