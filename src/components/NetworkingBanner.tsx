
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
    <div ref={bannerRef} className="py-16 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-gradient">{t.leftText}</h2>
            <div className="h-1 w-20 bg-pocketcv-purple mb-6"></div>
            <p className="text-lg text-muted-foreground">
              {t.rightText}
            </p>
          </div>
          
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300 md:w-1/2">
            <AspectRatio ratio={16/9} className="bg-pocketcv-purple/10 rounded-xl overflow-hidden shadow-lg">
              <div className="w-full h-full p-8 flex items-center justify-center bg-gradient-to-br from-pocketcv-purple/20 to-pocketcv-purple/5">
                <img 
                  src="/lovable-uploads/42b53831-1939-4eb7-a19a-b64de8155c37.png" 
                  alt="Networking illustration" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkingBanner;
