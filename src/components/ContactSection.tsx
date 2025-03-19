
import React from "react";
import { Mail, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const ContactSection = () => {
  const { t, language } = useLanguage();
  
  return <section className="py-16 bg-gradient-to-r from-purple-50 to-purple-100">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-gradient">
            {t.contact?.title || "Get in Touch"}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {language === 'en' 
              ? 'Have questions about PocketCV? Need help with customization? Reach out to us directly.'
              : 'Tem perguntas sobre o PocketCV? Precisa de ajuda com personalização? Entre em contato conosco diretamente.'}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-lg border border-purple-100">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">{language === 'en' ? 'Email' : 'Email'}</h3>
              <a href="mailto:pocketcvnetworking@gmail.com" className="text-primary hover:underline transition-all">pocketcvnetworking@gmail.com</a>
            </div>
            
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-lg border border-purple-100">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Phone className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">{language === 'en' ? 'Phone' : 'Telefone'}</h3>
              <a href="tel:929331791" className="text-primary hover:underline transition-all">
                929 331 791
              </a>
            </div>
            
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-lg border border-purple-100">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="size-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">{language === 'en' ? 'Consulting' : 'Consultoria'}</h3>
              <p className="text-center text-muted-foreground text-sm mb-2">
                {language === 'en' ? 'Need customization help?' : 'Precisa de ajuda com personalização?'}
              </p>
              <a href="mailto:pocketcvnetworking@gmail.com?subject=PocketCV%20Consulting" className="text-primary hover:underline transition-all">
                {language === 'en' ? 'Request Consulting' : 'Solicitar Consultoria'}
              </a>
            </div>
          </div>
          
          <div className="mt-10 space-y-4">
            <Button asChild size="lg" className="rounded-full px-8 font-medium bg-pocketcv-purple hover:bg-pocketcv-purple/90 text-white">
              <a href="mailto:pocketcvnetworking@gmail.com">
                {language === 'en' ? 'Contact Us Now' : 'Contate-nos Agora'}
              </a>
            </Button>
            
            <div className="mt-6">
              <Button asChild size="lg" className="bg-pocketcv-orange hover:bg-pocketcv-orange/90 transform hover:scale-105 transition-all duration-300 shadow-lg">
                <Link to="/get-started">
                  {language === 'en' ? 'Get Your PocketCV Card' : 'Peça seu Cartão PocketCV'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default ContactSection;
