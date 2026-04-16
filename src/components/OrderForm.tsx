
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalizedText } from "@/utils/languageHelpers";

const OrderForm = () => {
  const { language } = useLanguage();
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">
          {getLocalizedText(language, 'Contate-nos para Pedir', 'Contact Us to Order')}
        </h3>
        <p className="text-muted-foreground">
          {getLocalizedText(
            language,
            'Entre em contato diretamente para fazer seu pedido ou tirar dúvidas.',
            'Reach out directly to place your order or ask questions.'
          )}
        </p>
      </div>
      
      <div className="grid gap-6 mb-8">
        <div className="flex items-center gap-4 p-4 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-all">
          <div className="min-w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="font-medium">Email</h4>
            <a href="mailto:pocketcvnetworking@gmail.com" className="text-primary hover:underline transition-all break-all">
              pocketcvnetworking@gmail.com
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-all">
          <div className="min-w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{getLocalizedText(language, 'Telefone', 'Phone')}</h4>
            <a href="tel:918138203" className="text-primary hover:underline transition-all">
              918 138 203
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-all">
          <div className="min-w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Instagram</h4>
            <a href="https://instagram.com/pocketcv_networking" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-all break-all">
              @pocketcv_networking
            </a>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Button asChild size="lg" className="w-full rounded-md px-8 font-medium bg-pocketcv-purple hover:bg-pocketcv-purple/90 text-white">
          <a href="mailto:pocketcvnetworking@gmail.com?subject=PocketCV%20Order&body=I'm%20interested%20in%20ordering%20a%20PocketCV%20card.">
            {getLocalizedText(language, 'Envie-nos um Email para Pedir', 'Email Us to Order')}
          </a>
        </Button>
        
        <Button asChild variant="outline" size="lg" className="w-full rounded-md">
          <a href="tel:929331791">
            {getLocalizedText(language, 'Ligue Agora', 'Call Us Now')}
            <Phone className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default OrderForm;
