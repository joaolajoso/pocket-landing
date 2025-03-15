
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FeatureSection from "@/components/FeatureSection";
import OrderForm from "@/components/OrderForm";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeatureSection />

        {/* Order Form Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">{t.order?.title || "Ready to Order?"}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.order?.description || "Fill out the form below to place your order. We'll get back to you as soon as possible."}
              </p>
            </div>
            <OrderForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
