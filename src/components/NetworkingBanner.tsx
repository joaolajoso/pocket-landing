
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

    const elements = bannerRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section ref={bannerRef} className="py-16 md:py-24 overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="relative rounded-2xl pocketcv-gradient-bg p-6 md:p-10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-center">
            {/* Left text */}
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <h3 className="text-2xl md:text-3xl font-bold text-white text-center md:text-left">
                {t.leftText}
              </h3>
            </div>

            {/* Phone in the middle */}
            <div className="relative z-10 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100">
              <div className="max-w-[300px] mx-auto md:mx-0">
                <AspectRatio ratio={9/16} className="overflow-hidden">
                  <img
                    src="/lovable-uploads/42b53831-1939-4eb7-a19a-b64de8155c37.png"
                    alt="PocketCV Mobile Demo"
                    className="w-full h-full object-contain"
                  />
                </AspectRatio>
              </div>
            </div>

            {/* Right text */}
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
              <h3 className="text-2xl md:text-3xl font-bold text-white text-center md:text-right">
                {t.rightText}
              </h3>
            </div>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-white/10"></div>
        </div>
      </div>
    </section>
  );
};

export default NetworkingBanner;
