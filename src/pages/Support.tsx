import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Mail, MessageCircle, Phone, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Support = () => {
  const { language } = useLanguage();

  const supportOptions = [
    {
      icon: Mail,
      title: isPortuguese(language) ? 'Email de Suporte' : 'Support Email',
      description: isPortuguese(language) ? 'Envie-nos um email e responderemos em 24h' : "Send us an email and we'll respond within 24h",
      contact: 'pocketcvnetworking@gmail.com',
      action: isPortuguese(language) ? 'Enviar Email' : 'Send Email',
      href: 'mailto:pocketcvnetworking@gmail.com'
    },
    {
      icon: MessageCircle,
      title: isPortuguese(language) ? 'Chat Online' : 'Online Chat',
      description: isPortuguese(language) ? 'Chat direto para questões urgentes' : 'Direct chat for urgent questions',
      contact: isPortuguese(language) ? 'Disponível 9h-18h' : 'Available 9am-6pm',
      action: isPortuguese(language) ? 'Iniciar Chat' : 'Start Chat',
      href: 'mailto:pocketcvnetworking@gmail.com?subject=Urgent%20Support'
    }
  ];

  const faqQuick = [
    {
      question: isPortuguese(language) ? 'Como ativar o meu cartão NFC?' : 'How to activate my NFC card?',
      answer: isPortuguese(language)
        ? 'Aceda ao seu dashboard, vá a configurações e escaneie o código QR no cartão.'
        : 'Access your dashboard, go to settings and scan the QR code on the card.'
    },
    {
      question: isPortuguese(language) ? 'O cartão não funciona no meu telefone' : "Card doesn't work on my phone",
      answer: isPortuguese(language)
        ? 'Verifique se o NFC está ativado nas definições do telefone e toque a parte de trás do cartão no telefone.'
        : 'Check if NFC is enabled in your phone settings and tap the back of the card on the phone.'
    },
    {
      question: isPortuguese(language) ? 'Como alterar as informações do perfil?' : 'How to change profile information?',
      answer: isPortuguese(language)
        ? 'No dashboard, clique em "Editar Perfil" e atualize as suas informações.'
        : 'In the dashboard, click "Edit Profile" and update your information.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'Suporte - PocketCV' : 'Support - PocketCV'}
        </title>
        <meta
          name="description"
          content={isPortuguese(language)
            ? 'Precisa de ajuda com o PocketCV? Entre em contacto com o nosso suporte técnico especializado.'
            : 'Need help with PocketCV? Contact our specialized technical support.'}
        />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/5 via-white to-[#ff5757]/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'Suporte PocketCV' : 'PocketCV Support'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isPortuguese(language)
                ? 'Estamos aqui para ajudar com qualquer questão sobre o PocketCV'
                : "We're here to help with any questions about PocketCV"}
            </p>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {isPortuguese(language) ? 'Como Podemos Ajudar?' : 'How Can We Help?'}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              {supportOptions.map((option, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] rounded-full flex items-center justify-center mb-4">
                      <option.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle>{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="font-medium text-gray-700">{option.contact}</p>
                    <a
                      href={option.href}
                      className="inline-block bg-gradient-to-r from-[#8c52ff] to-[#ff5757] text-white font-semibold py-2 px-6 rounded-lg hover:from-[#7c47ea] hover:to-[#ef4444] transition-colors"
                    >
                      {option.action}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {isPortuguese(language) ? 'Respostas Rápidas' : 'Quick Answers'}
              </h2>
              <p className="text-gray-600">
                {isPortuguese(language) ? 'Soluções para problemas comuns' : 'Solutions to common problems'}
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqQuick.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg">
                  <h3 className="font-semibold mb-2 text-[#8c52ff]">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {isPortuguese(language) ? 'Horário de Suporte' : 'Support Hours'}
              </h2>
              <div className="space-y-2 text-lg text-gray-600">
                <p><strong>{isPortuguese(language) ? 'Segunda a Sexta:' : 'Monday to Friday:'}</strong> 9:00 - 18:00</p>
                <p><strong>{isPortuguese(language) ? 'Fim de semana:' : 'Weekend:'}</strong> {isPortuguese(language) ? 'Suporte por email apenas' : 'Email support only'}</p>
              </div>
              <p className="mt-6 text-gray-500">
                {isPortuguese(language)
                  ? 'Respondemos a todos os emails em menos de 24 horas'
                  : 'We respond to all emails within 24 hours'}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
