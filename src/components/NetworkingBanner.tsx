
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
    <section className="py-20 bg-white" ref={bannerRef}>
      <div className="container px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl font-bold mb-4 text-gradient">{t.leftText}</h2>
            <p className="text-muted-foreground">{t.rightText}</p>
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300">
            <AspectRatio ratio={16/9} className="bg-purple-50 rounded-xl overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-xl font-medium text-primary">PocketCV Banner</div>
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NetworkingBanner;
