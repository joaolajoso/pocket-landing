import { Smartphone, Download, QrCode, ChevronRight, Check, Monitor, Apple } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePWAInstall, type PlatformType } from "@/hooks/usePWAInstall";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";

const PWAInstallGuide = () => {
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const [showInstructions, setShowInstructions] = useState(false);
  const { installPWA, isInstallable, isInstalled, isInstalling, platform } = usePWAInstall();

  const getPlatformIcon = (platformType: PlatformType) => {
    switch (platformType) {
      case 'ios':
        return <Apple className="h-6 w-6" />;
      case 'android':
        return <Smartphone className="h-6 w-6" />;
      case 'desktop':
        return <Monitor className="h-6 w-6" />;
      default:
        return <Smartphone className="h-6 w-6" />;
    }
  };

  const getPlatformName = (platformType: PlatformType) => {
    switch (platformType) {
      case 'ios':
        return 'iOS (iPhone/iPad)';
      case 'android':
        return 'Android';
      case 'desktop':
        return 'Desktop';
      default:
        return 'Mobile';
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await installPWA();
      if (success) {
        toast.success("PocketCV instalado com sucesso! Agora pode aceder através do seu ecrã inicial.");
      }
    } else {
      // Show instructions if install prompt is not available
      setShowInstructions(true);
    }
  };

  const renderPlatformInstructions = () => {
    switch (platform) {
      case 'ios':
        return (
          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal list-inside">
            <li>{t.overview.installPWA.iosStep1}</li>
            <li>{t.overview.installPWA.iosStep2}</li>
            <li>{t.overview.installPWA.iosStep3}</li>
            <li>{t.overview.installPWA.iosStep4}</li>
          </ol>
        );
      case 'android':
        return (
          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal list-inside">
            <li>{t.overview.installPWA.androidStep1}</li>
            <li>{t.overview.installPWA.androidStep2}</li>
            <li>{t.overview.installPWA.androidStep3}</li>
            <li>{t.overview.installPWA.androidStep4}</li>
          </ol>
        );
      case 'desktop':
        return (
          <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal list-inside">
            <li>Clique no ícone de instalação na barra de endereços do navegador</li>
            <li>Ou aceda ao menu do navegador (⋮) e selecione "Instalar PocketCV"</li>
            <li>Confirme a instalação na janela que aparece</li>
            <li>A aplicação será adicionada às suas aplicações</li>
          </ol>
        );
      default:
        return (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Aceda ao menu do seu navegador e procure pela opção "Instalar aplicação" ou "Adicionar ao ecrã inicial".
          </p>
        );
    }
  };

  return (
    <div className="relative overflow-hidden mb-4 md:mb-6 rounded-2xl bg-purple-500/10 border border-purple-500/20">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10" />
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
              {getPlatformIcon(platform)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t.overview.installPWA.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {t.overview.installPWA.description}
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                {t.overview.installPWA.enhancedQR}
              </span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {!isInstalled && (
                <Button
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30"
                >
                  {isInstalling ? (
                    <>
                      <Download className="h-4 w-4 mr-2 animate-bounce" />
                      {t.overview.installPWA.installing}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {isInstallable ? t.overview.installPWA.installNow : "Ver instruções"}
                    </>
                  )}
                </Button>
              )}
              
              {isInstalled && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    {t.overview.installPWA.appInstalled}
                  </span>
                </div>
              )}
              
              {!isInstalled && (
                <Button
                  onClick={() => setShowInstructions(!showInstructions)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white border-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                >
                  {showInstructions ? 'Ocultar guia' : 'Installation Guide'}
                  <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showInstructions ? 'rotate-90' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {showInstructions && (
          <div className="mt-6 space-y-4 border-t border-purple-200 dark:border-purple-800 pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                  {getPlatformIcon(platform)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    Instruções para {getPlatformName(platform)}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Siga estes passos para instalar a aplicação
                  </p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-purple-100 dark:border-purple-900">
                {renderPlatformInstructions()}
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                💡 <strong>Dica:</strong> Depois de instalada, a aplicação funcionará offline e terá acesso mais rápido aos seus QR codes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallGuide;