
import React, { useEffect, useRef } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useLanguage } from "@/contexts/LanguageContext";

// Define translations
const translations = {
  en: {
    leftText: "Have all your networking needs in one place",
    rightText: "And be ready whenever you need it"
  },
  pt: {
    leftText: "Tenha todas as suas necessidades de networking em um só lugar",
    rightText: "E esteja pronto sempre que precisar"
  }
};

const NetworkingBanner = () => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100");
          entry.target.classList.remove("opacity-0", "translate-y-8");
        }
      });
    }, {
      threshold: 0.1
    });
    
    const elements = bannerRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach(el => observer.observe(el));
    
    return () => {
      elements?.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div ref={bannerRef} className="py-20 bg-gradient-to-r from-purple-50 to-purple-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2">
            <div className="space-y-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <h2 className="text-3xl font-bold tracking-tight">{t.leftText}</h2>
              <p className="text-xl text-muted-foreground">{t.rightText}</p>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300">
            <AspectRatio ratio={16/9} className="bg-muted overflow-hidden rounded-lg border shadow-lg">
              <img 
                src="/lovable-uploads/4511e201-5978-47b7-a6b1-999b88226b1d.png" 
                alt="PocketCV networking demonstration" 
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkingBanner;
