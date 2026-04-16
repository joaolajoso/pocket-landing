
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface LinksDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const LinksDisclaimerModal = ({ isOpen, onAccept }: LinksDisclaimerModalProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleAccept = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ links_disclaimer_accepted: true })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Consentimento registado",
        description: "Agora pode gerir os seus links profissionais com segurança."
      });

      onAccept();
    } catch (error) {
      console.error('Error updating disclaimer consent:', error);
      toast({
        title: "Erro",
        description: "Erro ao registar consentimento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-md mx-4" hideClose>
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Política de Privacidade e Segurança
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            Para garantir a sua segurança e a dos seus contactos, lembre-se que a aba de Links foi feita para divulgar apenas <strong>informações públicas</strong> como o seu LinkedIn, portfólio, redes sociais ou site.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 text-sm mb-1">❌ Não inclua aqui informações sensíveis ou privadas como:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Números de documentos (ex: NIF, BI)</li>
                  <li>• Dados bancários</li>
                  <li>• Endereços residenciais</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-800 text-sm mb-1">✅ Use este espaço para:</h4>
                <p className="text-green-700 text-sm">Facilitar conexões profissionais e preservar a sua privacidade.</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm">
            Ao continuar, confirma que está ciente destas recomendações.
          </p>
        </div>
        
        <div className="flex justify-center pt-2">
          <Button 
            onClick={handleAccept}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? "Registrando..." : "Estou ciente e quero continuar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinksDisclaimerModal;
