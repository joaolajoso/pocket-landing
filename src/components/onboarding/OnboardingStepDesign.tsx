import { Palette, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/translations/onboarding";

interface OnboardingStepDesignProps {
  selectedTheme: "wine" | "green" | "orange" | "gray" | "purple";
  userName: string;
  onChange: (theme: "wine" | "green" | "orange" | "gray" | "purple") => void;
  onNext: () => void;
  onBack: () => void;
}

const colorThemes = {
  wine: {
    gradient: "from-[#C41E5C] via-[#8B1E4B] to-[#1A1A1A]",
    swatch: "bg-[#C41E5C]",
    accent: "bg-pink-600",
    accentLight: "bg-pink-600/20",
  },
  green: {
    gradient: "from-[#059669] via-[#047857] to-[#1A1A1A]",
    swatch: "bg-[#059669]",
    accent: "bg-emerald-600",
    accentLight: "bg-emerald-600/20",
  },
  orange: {
    gradient: "from-[#EA580C] via-[#C2410C] to-[#1A1A1A]",
    swatch: "bg-[#EA580C]",
    accent: "bg-orange-600",
    accentLight: "bg-orange-600/20",
  },
  gray: {
    gradient: "from-[#4B5563] via-[#374151] to-[#1A1A1A]",
    swatch: "bg-[#4B5563]",
    accent: "bg-gray-600",
    accentLight: "bg-gray-600/20",
  },
  purple: {
    gradient: "from-[#7C3AED] via-[#6D28D9] to-[#1A1A1A]",
    swatch: "bg-[#7C3AED]",
    accent: "bg-violet-600",
    accentLight: "bg-violet-600/20",
  },
};

type ThemeKey = keyof typeof colorThemes;

const getThemeName = (key: ThemeKey, t: typeof onboardingTranslations.pt) => {
  const names: Record<ThemeKey, string> = {
    wine: t.themeWine,
    green: t.themeGreen,
    orange: t.themeOrange,
    gray: t.themeGray,
    purple: t.themePurple,
  };
  return names[key];
};

export const OnboardingStepDesign = ({
  selectedTheme,
  userName,
  onChange,
  onNext,
  onBack,
}: OnboardingStepDesignProps) => {
  const { language } = useLanguage();
  const t = onboardingTranslations[language] || onboardingTranslations.en;
  const theme = colorThemes[selectedTheme];

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 mx-auto">
        <Palette className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">{t.chooseStyle}</h1>
      <p className="text-white/60 text-center mb-6">{t.customizeColors}</p>

      <div className="flex justify-center gap-3 mb-6">
        {(Object.keys(colorThemes) as ThemeKey[]).map((key) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`w-12 h-12 rounded-full ${colorThemes[key].swatch} transition-all duration-300 flex items-center justify-center ${
              selectedTheme === key ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e] scale-110" : "hover:scale-105"
            }`}
            title={getThemeName(key, t)}
          >
            {selectedTheme === key && <Check className="w-5 h-5 text-white" />}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <p className="text-xs text-white/50 text-center mb-3">{t.livePreview}</p>
        <div className={`rounded-2xl overflow-hidden bg-gradient-to-b ${theme.gradient} p-6 transition-all duration-500`}>
          <div className="flex flex-col items-center">
            <Avatar className="w-20 h-20 border-2 border-white/30 mb-3">
              <AvatarFallback className={`${theme.accent} text-white font-bold text-xl`}>
                {userName ? userName[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            
            <Badge className={`${theme.accent} text-white text-xs px-3 py-1 rounded-full mb-2`}>
              Early Adopter
            </Badge>
            
            <h3 className="text-lg font-bold text-white mb-1">{userName || t.yourName}</h3>
            <p className="text-sm text-white/60 mb-4">{t.yourHeadline}</p>

            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-[#2A2A2A]/80 flex flex-col items-center justify-center gap-1">
                <div className={`w-8 h-8 rounded-full ${theme.accentLight} flex items-center justify-center`}>
                  <div className={`w-4 h-4 rounded-full ${theme.accent}`} />
                </div>
                <span className="text-xs text-white/70">Call</span>
              </div>
              <div className="w-16 h-16 rounded-xl bg-[#2A2A2A]/80 flex flex-col items-center justify-center gap-1">
                <div className={`w-8 h-8 rounded-full ${theme.accentLight} flex items-center justify-center`}>
                  <div className={`w-4 h-4 rounded-full ${theme.accent}`} />
                </div>
                <span className="text-xs text-white/70">Email</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="h-14 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button onClick={onNext} className="flex-1 h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl text-base">
          {t.finish}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
