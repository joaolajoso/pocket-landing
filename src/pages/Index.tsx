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
import { ArrowRight } from "lucide-react";
import ComparisonTable from "@/components/ComparisonTable";
import BusinessSection from "@/components/BusinessSection";
const Index = () => {
  const {
    t,
    language
  } = useLanguage();
  return <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        <HowItWorks />
        {/* CTA after How It Works section */}
        <div className="py-10 bg-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <Button size="lg" className="bg-pocketcv-orange hover:bg-pocketcv-orange/90 text-white transform hover:scale-105 transition-all duration-300 shadow-lg" asChild>
              <Link to="/get-started">
                {language === 'en' ? 'Get Your PocketCV Card – Only €5' : 'Peça Seu Cartão PocketCV – Apenas €5'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        
        <FeatureSection />
        
        {/* Add new Comparison Table */}
        <ComparisonTable />
        
        {/* CTA after Comparison Table */}
        <div className="py-10 bg-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <Button size="lg" className="bg-pocketcv-orange hover:bg-pocketcv-orange/90 text-white transform hover:scale-105 transition-all duration-300 shadow-lg" asChild>
              <Link to="/get-started">
                {language === 'en' ? 'Order Your PocketCV Now' : 'Peça Seu PocketCV Agora'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Add new Business Section */}
        <BusinessSection />
        
        {/* Networking Banner */}
        <NetworkingBanner />
        
        {/* FAQ Section */}
        <FAQ />

        {/* Final persuasive CTA */}
        

        {/* Contact Section */}
        <ContactSection />
      </main>
      <Footer />
    </div>;
};
export default Index;