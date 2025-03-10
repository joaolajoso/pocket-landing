
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Smartphone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div 
      ref={heroRef} 
      className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute top-0 inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-pocketcv-purple/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-pocketcv-orange/10 blur-3xl" />
      </div>

      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-8 mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight md:leading-tight tracking-tight animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            Your Digital Identity, <br />
            <span className="text-gradient">Simplified</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100">
            Create your professional landing page in minutes. Share your links, CV, 
            and contact information with a single tap through NFC.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
            <Button size="lg" className="group pocketcv-gradient-bg text-white hover:opacity-90" asChild>
              <Link to="/login?signup=true">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-pocketcv-purple/30 hover:bg-pocketcv-purple/5" asChild>
              <a href="#how-it-works">
                Learn More
              </a>
            </Button>
          </div>
        </div>

        {/* Device showcase */}
        <div className="relative mx-auto max-w-5xl animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300">
          <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border shadow-2xl">
            <div className="relative h-full w-full bg-background">
              {/* Mockup profile page */}
              <div className="absolute inset-0 flex flex-col">
                <div className="h-16 border-b border-border flex items-center px-6">
                  <div className="w-40 h-8 bg-muted rounded-md"></div>
                  <div className="ml-auto flex gap-3">
                    <div className="w-8 h-8 bg-muted rounded-md"></div>
                    <div className="w-8 h-8 bg-muted rounded-md"></div>
                  </div>
                </div>
                <div className="flex-1 flex">
                  <div className="flex-1 p-8 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-muted rounded-full mb-4"></div>
                    <div className="w-40 h-6 bg-muted rounded-md mb-2"></div>
                    <div className="w-64 h-4 bg-muted/60 rounded-md mb-8"></div>
                    
                    <div className="w-full max-w-sm space-y-4">
                      <div className="h-14 bg-muted/80 rounded-md flex items-center px-4">
                        <Globe className="text-pocketcv-purple/60 mr-3" />
                        <div className="w-full">
                          <div className="w-24 h-3 bg-muted-foreground/30 rounded-sm"></div>
                        </div>
                      </div>
                      <div className="h-14 bg-muted/80 rounded-md flex items-center px-4">
                        <Smartphone className="text-pocketcv-purple/60 mr-3" />
                        <div className="w-full">
                          <div className="w-32 h-3 bg-muted-foreground/30 rounded-sm"></div>
                        </div>
                      </div>
                      <div className="h-14 bg-muted/80 rounded-md flex items-center px-4">
                        <Share2 className="text-pocketcv-purple/60 mr-3" />
                        <div className="w-full">
                          <div className="w-28 h-3 bg-muted-foreground/30 rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-2 bg-foreground/10 blur-md rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
