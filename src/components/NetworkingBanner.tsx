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
const NetworkingBanner = (): JSX.Element => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const {
    language
  } = useLanguage();
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
  return;
};
export default NetworkingBanner;