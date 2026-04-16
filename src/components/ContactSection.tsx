import React from "react";
import { Mail, Instagram, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from '@/utils/languageHelpers';
import { Link } from "react-router-dom";

const ContactSection = () => {
  const { t, language } = useLanguage();
  
  return (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-purple-100">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-gradient">
            {t.contact?.title || "Get in Touch"}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {isPortuguese(language) ? 'Tem perguntas sobre a PocketCV? Precisa de ajuda com personalização? Entre em contacto connosco.' : 'Have questions about PocketCV? Need help with customization? Reach out to us directly.'}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-lg border border-purple-100">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Email</h3>
              <a href="mailto:pocketcvnetworking@gmail.com" className="text-primary hover:underline transition-all text-center break-all w-full">pocketcvnetworking@gmail.com</a>
            </div>
            
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-lg border border-purple-100">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Instagram className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Instagram</h3>
              <a href="https://www.instagram.com/pocketcv_networking/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-all">
                @pocketcv_networking
              </a>
            </div>
            
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-lg border border-purple-100">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">{isPortuguese(language) ? 'Consultoria' : 'Consulting'}</h3>
              <p className="text-center text-muted-foreground text-sm mb-2">
                {isPortuguese(language) ? 'Precisa de ajuda com personalização?' : 'Need customization help?'}
              </p>
              <a href="mailto:pocketcvnetworking@gmail.com?subject=PocketCV%20Consulting" className="text-primary hover:underline transition-all">
                {isPortuguese(language) ? 'Solicitar Consultoria' : 'Request Consulting'}
              </a>
            </div>
          </div>
          
          <div className="mt-10 space-y-4">
            <Button asChild size="lg" className="rounded-full px-8 font-medium bg-pocketcv-purple hover:bg-pocketcv-purple/90 text-white">
              <a href="mailto:pocketcvnetworking@gmail.com">
                {isPortuguese(language) ? 'Contacte-nos Agora' : 'Contact Us Now'}
              </a>
            </Button>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
