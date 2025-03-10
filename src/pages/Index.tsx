import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeatureSection />

        {/* Example Profile Section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">See it in action</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Take a look at an example profile to see how PocketCV helps you share your professional identity with a simple tap.
              </p>
            </div>
            <div className="flex justify-center">
              <Link to="/example">
                <Button size="lg" className="gap-2">
                  View Example Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
