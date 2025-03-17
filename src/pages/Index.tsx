
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FeatureSection from "@/components/FeatureSection";
import NetworkingBanner from "@/components/NetworkingBanner";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeatureSection />
        
        {/* Networking Banner - Added after "Everything You Need" section */}
        <NetworkingBanner />
        
        {/* FAQ Section */}
        <FAQ />

        {/* Contact Section */}
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
