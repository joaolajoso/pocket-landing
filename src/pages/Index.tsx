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
const Index = () => {
  const {
    t
  } = useLanguage();
  return <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        <HowItWorks />
        {/* CTA after How It Works section */}
        
        
        <FeatureSection />
        
        {/* Networking Banner - Added after "Everything You Need" section */}
        <NetworkingBanner />
        
        {/* CTA after NetworkingBanner */}
        
        
        {/* FAQ Section */}
        <FAQ />

        {/* Final persuasive CTA */}
        <div className="py-16 bg-gradient-to-r from-pocketcv-purple/10 to-pocketcv-orange/10">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gradient">Join the new way of networking</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
              Stand out at career fairs, interviews, and networking events with your personal PocketCV card.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="bg-pocketcv-orange hover:bg-pocketcv-orange/90 text-white transform hover:scale-105 transition-all duration-300 shadow-lg text-lg px-8 py-6 h-auto" asChild>
                <Link to="/get-started">
                  Order Your PocketCV Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <ContactSection />
      </main>
      <Footer />
    </div>;
};
export default Index;