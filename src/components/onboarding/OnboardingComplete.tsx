import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/translations/onboarding";

interface OnboardingCompleteProps {
  userName: string;
  onContinue: () => void;
}

export const OnboardingComplete = ({ userName, onContinue }: OnboardingCompleteProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const { language } = useLanguage();
  const t = onboardingTranslations[language] || onboardingTranslations.en;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center p-6">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ["#C41E5C", "#059669", "#EA580C", "#7C3AED", "#F59E0B"][i % 5],
              }}
              initial={{ top: -20, opacity: 1, scale: 1 }}
              animate={{ top: "100%", opacity: 0, scale: 0, rotate: Math.random() * 360 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: "easeOut" }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-emerald-500/30"
          >
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h1 className="text-3xl font-bold text-white">{t.allReady}</h1>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            
            <p className="text-white/60 text-lg mb-8">
              {userName ? `${userName}, ${t.profileConfigured}` : t.profileConfiguredNoName}<br />
              {t.shareAnyone}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-3 mb-8">
            {[t.featureColors, t.featureLinks, t.featureNetworking].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-left bg-white/5 rounded-xl p-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-white/80 text-sm">{feature}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Button
              onClick={onContinue}
              className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl text-base"
            >
              {t.goToDashboard}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
