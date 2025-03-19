
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
    <div className="py-24 bg-gradient-to-r from-pocketcv-purple/5 to-pocketcv-orange/5" ref={bannerRef}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl font-bold mb-4">{t.leftText}</h2>
            <p className="text-lg text-muted-foreground">
              {language === 'en' 
                ? 'PocketCV card makes networking efficient and memorable.'
                : 'O cartão PocketCV torna o networking eficiente e memorável.'}
            </p>
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-300">
            <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden">
              <div className="h-full w-full flex items-center justify-center p-8 text-center">
                <h3 className="text-2xl font-semibold">{t.rightText}</h3>
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkingBanner;
