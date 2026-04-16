import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { LightModeWrapper } from "@/components/LightModeWrapper";
import PricingGrid from "@/components/pricing/PricingGrid";
import EarlyAdopterSection from "@/components/pricing/EarlyAdopterSection";

const Pricing = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  const organizerLink = "";

  return (
    <LightModeWrapper>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {/* Pricing Section */}
          <PricingGrid isPt={isPt} organizerLink={organizerLink || undefined} />

          {/* Early Adopter Section */}
          <EarlyAdopterSection isPt={isPt} />
        </main>
        <Footer />
      </div>
    </LightModeWrapper>
  );
};

export default Pricing;
