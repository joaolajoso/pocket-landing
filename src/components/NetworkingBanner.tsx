
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
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6" ref={bannerRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gradient">
              {t.leftText}
            </h3>
            <p className="text-gray-600 mb-6">
              {t.rightText}
            </p>
          </div>
          
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
            <AspectRatio ratio={16/9} className="bg-gradient-to-r from-pocketcv-purple to-pocketcv-orange rounded-lg shadow-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center p-6 text-white">
                <div className="w-full max-w-md bg-black/30 backdrop-blur-sm p-8 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-white/20 mb-4"></div>
                  <div className="h-6 w-3/4 bg-white/20 rounded-md mb-4"></div>
                  <div className="h-4 w-full bg-white/20 rounded-md mb-2"></div>
                  <div className="h-4 w-5/6 bg-white/20 rounded-md mb-2"></div>
                  <div className="h-4 w-4/6 bg-white/20 rounded-md mb-4"></div>
                  <div className="h-10 w-full bg-white/20 rounded-md"></div>
                </div>
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkingBanner;
