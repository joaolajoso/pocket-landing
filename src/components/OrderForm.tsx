
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const OrderForm = () => {
  const { language } = useLanguage();
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">
          {language === 'en' ? 'Contact Us to Order' : 'Contate-nos para Pedir'}
        </h3>
        <p className="text-muted-foreground">
          {language === 'en' 
            ? 'Reach out directly to place your order or ask questions.'
            : 'Entre em contato diretamente para fazer seu pedido ou tirar dúvidas.'}
        </p>
      </div>
      
      <div className="grid gap-6 mb-8">
        <div className="flex items-center gap-4 p-4 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-all">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="size-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{language === 'en' ? 'Email' : 'Email'}</h4>
            <a href="mailto:pocketcvnetworking@gmail.com" className="text-primary hover:underline transition-all">
              pocketcvnetworking@gmail.com
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-all">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="size-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{language === 'en' ? 'Phone' : 'Telefone'}</h4>
            <a href="tel:929331791" className="text-primary hover:underline transition-all">
              929 331 791
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-4 p-4 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-all">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="size-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{language === 'en' ? 'Consulting' : 'Consultoria'}</h4>
            <a href="mailto:pocketcvnetworking@gmail.com?subject=PocketCV%20Consulting" className="text-primary hover:underline transition-all">
              {language === 'en' ? 'Request Consulting' : 'Solicitar Consultoria'}
            </a>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Button asChild size="lg" className="w-full rounded-md px-8 font-medium bg-pocketcv-purple hover:bg-pocketcv-purple/90 text-white">
          <a href="mailto:pocketcvnetworking@gmail.com?subject=PocketCV%20Order&body=I'm%20interested%20in%20ordering%20a%20PocketCV%20card.">
            {language === 'en' ? 'Email Us to Order' : 'Envie-nos um Email para Pedir'}
          </a>
        </Button>
        
        <Button asChild variant="outline" size="lg" className="w-full rounded-md">
          <a href="tel:929331791">
            {language === 'en' ? 'Call Us Now' : 'Ligue Agora'}
            <Phone className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default OrderForm;
