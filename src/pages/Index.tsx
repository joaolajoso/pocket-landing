
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Smartphone, Zap, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import FeatureSection from "@/components/FeatureSection";

const Index = () => {
  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main>
        <Hero />
        <FeatureSection />
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How It Works</h2>
              <p className="text-muted-foreground">
                Creating your professional digital identity has never been easier.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <RefreshCcw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">1. Create Account</h3>
                <p className="text-muted-foreground">
                  Sign up for PocketCV and set up your profile with your professional details.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">2. Add Your Links</h3>
                <p className="text-muted-foreground">
                  Add your LinkedIn, CV, portfolio, and any other professional links you want to share.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">3. Share Instantly</h3>
                <p className="text-muted-foreground">
                  Share your PocketCV profile via NFC, QR code, or direct link to simplify networking.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-16">
              <Button size="lg" className="group" asChild>
                <Link to="/login?signup=true">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-secondary/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Find answers to the most common questions about PocketCV.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "What is PocketCV?",
                  answer: "PocketCV is a digital platform that allows you to create a personal landing page where you can share your professional links, CV, portfolio, and contact information with just one tap using NFC technology."
                },
                {
                  question: "How does the NFC feature work?",
                  answer: "When you tap your PocketCV-enabled NFC card or tag on someone's smartphone, it instantly opens your personal landing page, allowing them to view and save your professional information."
                },
                {
                  question: "Do I need an NFC card to use PocketCV?",
                  answer: "No, you can use PocketCV without an NFC card. You'll still get a unique URL that you can share via text, email, QR code, or social media."
                },
                {
                  question: "Is PocketCV secure?",
                  answer: "Yes, PocketCV employs industry-standard security practices to protect your data. You control what information is visible on your profile and can update or remove it at any time."
                },
                {
                  question: "Can I customize how my profile looks?",
                  answer: "Yes, you can customize your profile with your name, photo, bio, and arrange your links in the order you prefer."
                },
                {
                  question: "Is there a limit to how many links I can add?",
                  answer: "The free plan allows you to add up to 5 links. Premium plans offer unlimited links and additional customization options."
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="bg-background rounded-lg p-6 shadow-sm border border-border transition-all duration-300"
                >
                  <h3 className="text-lg font-medium mb-2">{item.question}</h3>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.1)_100%)] z-0"></div>
              
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Simplify Your Networking?</h2>
                <p className="text-primary-foreground/80 mb-8">
                  Join thousands of professionals who use PocketCV to share their digital identity with a tap.
                </p>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-white/90"
                  asChild
                >
                  <Link to="/login?signup=true">
                    Create Your PocketCV
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
