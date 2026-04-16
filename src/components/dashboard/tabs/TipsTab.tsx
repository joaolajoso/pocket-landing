import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";
import { Clock, Smartphone, QrCode, Wifi, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import QRCodeDialog from "@/components/profile/QRCodeDialog";
import { getProfileUrl } from "@/lib/supabase";
import { useDashboard } from "@/contexts/dashboard";
import { useState } from "react";

const TipsTab = () => {
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const isPt = language === 'pt';
  const { userData } = useDashboard();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const nfcTips = [
    {
      icon: Clock,
      title: isPt ? "Paciência é Fundamental" : "Patience is Key",
      description: isPt 
        ? "Aguarde pelo menos 3 segundos para o cartão ser lido pelo dispositivo. Mantenha o cartão firme contra o telemóvel até a conexão ser estabelecida."
        : "Wait at least 3 seconds for the card to be read by the device. Hold your card steady against the phone until the connection is established.",
      tip: isPt 
        ? "Se não funcionar imediatamente, tente ajustar ligeiramente a posição do cartão."
        : "If it doesn't work immediately, try adjusting the position slightly."
    },
    {
      icon: Wifi,
      title: isPt ? "NFC Deve Estar Ativo" : "NFC Must Be On",
      description: isPt 
        ? "Certifique-se de que tanto o seu cartão como o dispositivo do destinatário têm NFC ativado. Para iPhones, o NFC está sempre ativo para modelos XR e mais recentes."
        : "Ensure both your card and the recipient's device have NFC enabled. For iPhones, NFC is always on for XR and newer models.",
      tip: isPt 
        ? "Utilizadores Android podem precisar ativar NFC nas configurações do dispositivo."
        : "Android users may need to enable NFC in their device settings."
    },
    {
      icon: Smartphone,
      title: isPt ? "Ecrã Deve Estar Ligado" : "Screen Must Be On",
      description: isPt 
        ? "O ecrã do telemóvel do destinatário deve estar ligado e desbloqueado ao tocar com o seu dispositivo NFC."
        : "The recipient's phone screen must be on and unlocked when tapping your NFC device.",
      tip: isPt 
        ? "Não é necessário abrir nenhuma app específica - apenas certifique-se de que o ecrã está ativo."
        : "No need to open any specific app - just make sure the screen is active."
    },
    {
      icon: QrCode,
      title: isPt ? "Alternativa com QR Code" : "QR Code Alternative",
      description: isPt 
        ? "Todos os perfis PocketCV têm um código QR que pode ser escaneado se o dispositivo do lead não tiver NFC ativado."
        : "Every PocketCV profile has a QR code that can be scanned if the lead's device doesn't have NFC enabled.",
      tip: isPt 
        ? "Partilhe o link do seu perfil ou deixe que escaneiem o QR code do seu perfil para acesso instantâneo."
        : "Share your profile link or let them scan your profile's QR code for instant access."
    }
  ];

  const qrTips = [
    {
      title: isPt ? "Acesso ao seu QR Code" : "Accessing Your QR Code",
      content: isPt 
        ? "O seu código QR está disponível na tab 'My PocketCV'. Clique no botão 'QR' para visualizar e partilhar."
        : "Your QR code is available in the 'My PocketCV' tab. Click the 'QR' button to view and share."
    },
    {
      title: isPt ? "Partilha Rápida" : "Quick Sharing",
      content: isPt 
        ? "Pode fazer download do QR code e usá-lo em apresentações, cartões físicos ou materiais impressos."
        : "You can download your QR code and use it in presentations, physical cards, or printed materials."
    },
    {
      title: isPt ? "Sem Apps Necessárias" : "No Apps Required",
      content: isPt 
        ? "A maioria dos smartphones modernos pode escanear códigos QR diretamente através da câmara, sem necessidade de apps adicionais."
        : "Most modern smartphones can scan QR codes directly through the camera app, no additional apps needed."
    }
  ];

  const bestPractices = [
    isPt ? "Posicione o cartão no centro traseiro do telemóvel" : "Position the card at the center back of the phone",
    isPt ? "Mantenha uma distância de 1-2cm entre o cartão e o telemóvel" : "Keep a distance of 1-2cm between card and phone",
    isPt ? "Evite interferências metálicas (capas grossas, cartões metálicos)" : "Avoid metallic interference (thick cases, metal cards)",
    isPt ? "Em eventos, tenha sempre o QR code disponível como backup" : "At events, always have your QR code available as backup",
    isPt ? "Teste o seu cartão NFC regularmente para garantir funcionamento" : "Test your NFC card regularly to ensure it's working"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {isPt ? "Dicas de Uso" : "Usage Tips"}
        </h2>
        <p className="text-muted-foreground">
          {isPt 
            ? "Aprenda a usar o seu cartão NFC e QR code da forma mais eficiente"
            : "Learn how to use your NFC card and QR code most effectively"}
        </p>
      </div>

      {/* NFC Tips Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {isPt ? "Dicas de NFC" : "NFC Tips"}
              </CardTitle>
              <CardDescription>
                {isPt 
                  ? "Como usar o seu cartão NFC com sucesso"
                  : "How to successfully use your NFC card"}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-pocketcv-purple/10 text-pocketcv-purple border-pocketcv-purple/20">
              NFC
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {nfcTips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pocketcv-purple/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-pocketcv-purple" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tip.description}
                    </p>
                    <div className="flex items-start gap-2 pt-1">
                      <Info className="w-4 h-4 text-pocketcv-coral flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-pocketcv-coral">
                        {tip.tip}
                      </p>
                    </div>
                  </div>
                </div>
                {index < nfcTips.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* QR Code Tips Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {isPt ? "Usando o QR Code" : "Using QR Code"}
              </CardTitle>
              <CardDescription>
                {isPt 
                  ? "Alternativa prática quando o NFC não está disponível"
                  : "Practical alternative when NFC is not available"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <QRCodeDialog
                open={qrDialogOpen}
                onOpenChange={setQrDialogOpen}
                profileUrl={`${getProfileUrl(userData.username)}?source=qr`}
                profileName={userData.name || userData.username}
                profilePhoto={userData.avatarUrl}
                headline={userData.bio}
                title={isPt ? "Código QR do Perfil" : "Profile QR Code"}
                trigger={
                  <Button 
                    variant="default" 
                    size="sm"
                    className="gap-1.5 text-xs px-2 md:px-3 py-1 h-8 bg-gradient-to-r from-pocketcv-coral via-pocketcv-purple to-pocketcv-blue hover:opacity-90 text-white border-0 shadow-lg whitespace-nowrap"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">Download QR</span>
                    <span className="xs:hidden">QR</span>
                  </Button>
                }
              />
              <Badge variant="outline" className="bg-pocketcv-coral/10 text-pocketcv-coral border-pocketcv-coral/20">
                QR
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {qrTips.map((tip, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pocketcv-coral/10 flex items-center justify-center text-xs font-semibold text-pocketcv-coral">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tip.content}
                  </p>
                </div>
              </div>
              {index < qrTips.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Best Practices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {isPt ? "Melhores Práticas" : "Best Practices"}
          </CardTitle>
          <CardDescription>
            {isPt 
              ? "Dicas essenciais para uma experiência perfeita"
              : "Essential tips for a perfect experience"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {bestPractices.map((practice, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-pocketcv-purple mt-2" />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {practice}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TipsTab;
