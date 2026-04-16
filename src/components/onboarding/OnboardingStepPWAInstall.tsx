import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple, Smartphone, Download, Check, ChevronRight, Share, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface OnboardingStepPWAInstallProps {
  onNext: () => void;
}

type Platform = 'ios' | 'android' | null;

const translations = {
  pt: {
    title: "Instale o PocketCV",
    subtitle: "Tenha acesso rápido ao seu perfil digital diretamente do ecrã inicial do seu telemóvel.",
    selectDevice: "Selecione o seu dispositivo",
    ios: "iPhone / iPad",
    android: "Android",
    installNow: "Instalar PocketCV",
    installing: "A instalar...",
    installed: "App instalada com sucesso!",
    skipForNow: "Saltar por agora",
    iosSteps: [
      "Toque no ícone de partilha na barra inferior do Safari",
      "Deslize para baixo e toque em \"Adicionar ao ecrã inicial\"",
      "Toque em \"Adicionar\" no canto superior direito",
      "O PocketCV aparecerá no seu ecrã inicial!"
    ],
    androidSteps: [
      "Toque no menu (⋮) no canto superior direito do Chrome",
      "Selecione \"Instalar aplicação\" ou \"Adicionar ao ecrã inicial\"",
      "Confirme a instalação tocando em \"Instalar\"",
      "O PocketCV aparecerá no seu ecrã inicial!"
    ],
    androidAutoInstall: "Toque no botão abaixo para instalar automaticamente:",
    tip: "A app funcionará offline e terá acesso instantâneo ao seu QR code.",
  },
  en: {
    title: "Install PocketCV",
    subtitle: "Get quick access to your digital profile directly from your phone's home screen.",
    selectDevice: "Select your device",
    ios: "iPhone / iPad",
    android: "Android",
    installNow: "Install PocketCV",
    installing: "Installing...",
    installed: "App installed successfully!",
    skipForNow: "Skip for now",
    iosSteps: [
      "Tap the Share icon in Safari's bottom bar",
      "Scroll down and tap \"Add to Home Screen\"",
      "Tap \"Add\" in the top right corner",
      "PocketCV will appear on your home screen!"
    ],
    androidSteps: [
      "Tap the menu (⋮) in Chrome's top right corner",
      "Select \"Install app\" or \"Add to Home Screen\"",
      "Confirm installation by tapping \"Install\"",
      "PocketCV will appear on your home screen!"
    ],
    androidAutoInstall: "Tap the button below to install automatically:",
    tip: "The app works offline and gives you instant access to your QR code.",
  }
};

export const OnboardingStepPWAInstall = ({ onNext }: OnboardingStepPWAInstallProps) => {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(null);
  const { installPWA, isInstallable, isInstalled, isInstalling } = usePWAInstall();

  // Auto-advance if already installed
  useEffect(() => {
    if (isInstalled) {
      const timer = setTimeout(onNext, 1500);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, onNext]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      toast.success(t.installed);
      setTimeout(onNext, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30">
          <Download className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t.title}</h2>
        <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">
          {t.subtitle}
        </p>
      </div>

      {/* Already installed state */}
      {isInstalled ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-green-400" />
          </div>
          <p className="text-green-300 font-medium">{t.installed}</p>
        </motion.div>
      ) : (
        <>
          {/* Platform Selector */}
          <div className="space-y-3">
            <p className="text-sm text-white/50 text-center">{t.selectDevice}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPlatform('ios')}
                className={`relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-3 ${
                  selectedPlatform === 'ios'
                    ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedPlatform === 'ios' ? 'bg-purple-500/20' : 'bg-white/10'
                }`}>
                  <Apple className={`h-6 w-6 ${selectedPlatform === 'ios' ? 'text-purple-300' : 'text-white/70'}`} />
                </div>
                <span className={`text-sm font-medium ${selectedPlatform === 'ios' ? 'text-white' : 'text-white/70'}`}>
                  {t.ios}
                </span>
              </button>

              <button
                onClick={() => setSelectedPlatform('android')}
                className={`relative p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-3 ${
                  selectedPlatform === 'android'
                    ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedPlatform === 'android' ? 'bg-purple-500/20' : 'bg-white/10'
                }`}>
                  <Smartphone className={`h-6 w-6 ${selectedPlatform === 'android' ? 'text-purple-300' : 'text-white/70'}`} />
                </div>
                <span className={`text-sm font-medium ${selectedPlatform === 'android' ? 'text-white' : 'text-white/70'}`}>
                  {t.android}
                </span>
              </button>
            </div>
          </div>

          {/* Platform Instructions */}
          <AnimatePresence mode="wait">
            {selectedPlatform && (
              <motion.div
                key={selectedPlatform}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 space-y-4">
                  {/* Android auto-install button */}
                  {selectedPlatform === 'android' && isInstallable && (
                    <div className="space-y-3">
                      <p className="text-sm text-white/60">{t.androidAutoInstall}</p>
                      <Button
                        onClick={handleInstall}
                        disabled={isInstalling}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-purple-500/30"
                      >
                        {isInstalling ? (
                          <>
                            <Download className="h-5 w-5 mr-2 animate-bounce" />
                            {t.installing}
                          </>
                        ) : (
                          <>
                            <Download className="h-5 w-5 mr-2" />
                            {t.installNow}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Manual steps */}
                  {(selectedPlatform === 'ios' || !isInstallable) && (
                    <ol className="space-y-3">
                      {(selectedPlatform === 'ios' ? t.iosSteps : t.androidSteps).map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-purple-300">{i + 1}</span>
                          </div>
                          <span className="text-sm text-white/80 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Visual hint for iOS share icon */}
                  {selectedPlatform === 'ios' && (
                    <div className="flex items-center gap-2 bg-purple-500/10 rounded-xl p-3">
                      <Share className="h-4 w-4 text-purple-400" />
                      <span className="text-xs text-purple-300">
                        {language === 'pt' ? 'Procure este ícone no Safari' : 'Look for this icon in Safari'}
                      </span>
                    </div>
                  )}

                  {/* Tip */}
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-white/50">
                      💡 {t.tip}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip */}
          <div className="text-center pt-2">
            <button
              onClick={onNext}
              className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              {t.skipForNow}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
