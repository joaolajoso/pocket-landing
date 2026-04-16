import { Link, Linkedin, Instagram, Globe, ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingData } from "./OnboardingWizard";
import { SocialShortcuts } from "@/components/ui/SocialShortcuts";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/translations/onboarding";

interface OnboardingStepLinksProps {
  linkedinUrl: string;
  instagramUrl: string;
  otherUrl: string;
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const OnboardingStepLinks = ({
  linkedinUrl,
  instagramUrl,
  otherUrl,
  onChange,
  onNext,
  onBack,
  onSkip,
}: OnboardingStepLinksProps) => {
  const { language } = useLanguage();
  const t = onboardingTranslations[language] || onboardingTranslations.en;

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 mx-auto">
        <Link className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">{t.shareLinks}</h1>
      <p className="text-white/60 text-center mb-6">{t.connectSocials}</p>

      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0A66C2] flex items-center justify-center">
              <Linkedin className="w-4 h-4 text-white" />
            </div>
            LinkedIn
          </label>
          <Input
            type="url"
            placeholder="linkedin.com/in/your-profile"
            value={linkedinUrl}
            onChange={(e) => onChange({ linkedinUrl: e.target.value })}
            className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center">
              <Instagram className="w-4 h-4 text-white" />
            </div>
            Instagram
          </label>
          <Input
            type="url"
            placeholder="instagram.com/your-profile"
            value={instagramUrl}
            onChange={(e) => onChange({ instagramUrl: e.target.value })}
            className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            {t.otherLink}
          </label>
          <Input
            type="url"
            placeholder={t.otherLinkPlaceholder}
            value={otherUrl}
            onChange={(e) => onChange({ otherUrl: e.target.value })}
            className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
          />
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <SocialShortcuts variant="onboarding" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="h-14 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button onClick={onNext} className="flex-1 h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl text-base">
            {t.continue}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        <button onClick={onSkip} className="text-sm text-white/50 hover:text-white/70 transition-colors flex items-center justify-center gap-1">
          {t.skipStep}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
