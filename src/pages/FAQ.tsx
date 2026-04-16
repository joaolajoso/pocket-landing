
import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const { language } = useLanguage();

  const faqs = [
    {
      question: isPortuguese(language) ? 'O que é a PocketCV?' : 'What is PocketCV?',
      answer: isPortuguese(language) 
        ? 'A PocketCV é uma plataforma que permite criar um perfil profissional online e partilhá-lo facilmente através de cartões NFC ou links QR. É a forma moderna de fazer networking.'
        : 'PocketCV is a platform that allows you to create an online professional profile and share it easily through NFC cards or QR links. It\'s the modern way to network.'
    },
    {
      question: isPortuguese(language) ? 'Como funciona o cartão NFC?' : 'How does the NFC card work?',
      answer: isPortuguese(language) 
        ? 'O cartão NFC contém um chip que, quando tocado num smartphone, direciona automaticamente para o seu perfil PocketCV. Funciona com qualquer telemóvel moderno, sem necessidade de aplicações.'
        : 'The NFC card contains a chip that, when tapped on a smartphone, automatically directs to your PocketCV profile. It works with any modern phone, no apps required.'
    },
    {
      question: isPortuguese(language) ? 'Posso usar a PocketCV gratuitamente?' : 'Can I use PocketCV for free?',
      answer: isPortuguese(language) 
        ? 'Sim! Pode criar a sua conta e perfil profissional de forma totalmente gratuita, com links, análises e personalização. Só paga se quiser encomendar um cartão físico NFC.'
        : 'Yes! You can create your account and professional profile completely for free, with links, analytics and customization. You only pay if you want to order a physical NFC card.'
    },
    {
      question: isPortuguese(language) ? 'Quanto custa o cartão NFC?' : 'How much does the NFC card cost?',
      answer: isPortuguese(language) 
        ? 'O Cartão Standard custa 8€ e o Cartão Personalizado custa 12€ (pagamento único). Oferecemos descontos progressivos para encomendas em volume: 20% a partir de 50 unidades, 30% a partir de 250 e 40% a partir de 500. Não há taxas mensais ou anuais.'
        : 'The Standard Card costs €8 and the Custom Card costs €12 (one-time payment). We offer progressive bulk discounts: 20% off for 50+ units, 30% for 250+, and 40% for 500+. There are no monthly or annual fees.'
    },
    {
      question: isPortuguese(language) ? 'Posso personalizar o meu perfil?' : 'Can I customize my profile?',
      answer: isPortuguese(language) 
        ? 'Sim! Pode personalizar completamente o seu perfil com foto, biografia, links para redes sociais, website, e muito mais. Também pode escolher cores e temas.'
        : 'Yes! You can completely customize your profile with photo, bio, social media links, website, and much more. You can also choose colors and themes.'
    },
    {
      question: isPortuguese(language) ? 'Os meus dados estão seguros?' : 'Is my data secure?',
      answer: isPortuguese(language) 
        ? 'Absolutamente. Utilizamos encriptação de nível bancário e seguimos as normas RGPD. Controla completamente quais informações partilhar.'
        : 'Absolutely. We use bank-level encryption and follow GDPR standards. You have complete control over what information to share.'
    },
    {
      question: isPortuguese(language) ? 'Posso ver quem visualiza o meu perfil?' : 'Can I see who views my profile?',
      answer: isPortuguese(language) 
        ? 'Sim! A PocketCV fornece análises detalhadas incluindo número de visualizações, cliques nos links e origem do tráfego, respeitando sempre a privacidade.'
        : 'Yes! PocketCV provides detailed analytics including view count, link clicks and traffic sources, always respecting privacy.'
    },
    {
      question: isPortuguese(language) ? 'Posso usar múltiplos cartões?' : 'Can I use multiple cards?',
      answer: isPortuguese(language) 
        ? 'Sim! Pode encomendar vários cartões que apontam para o mesmo perfil. Útil para ter cartões de reserva ou diferentes designs.'
        : 'Yes! You can order multiple cards that point to the same profile. Useful for having backup cards or different designs.'
    },
    {
      question: isPortuguese(language) ? 'Funciona offline?' : 'Does it work offline?',
      answer: isPortuguese(language) 
        ? 'O cartão NFC funciona offline para direcionar para o seu perfil, mas o perfil em si precisa de internet para carregar. Os dados ficam sempre atualizados automaticamente.'
        : 'The NFC card works offline to direct to your profile, but the profile itself needs internet to load. Data is always automatically updated.'
    },
    {
      question: isPortuguese(language) ? 'Posso cancelar a qualquer momento?' : 'Can I cancel anytime?',
      answer: isPortuguese(language) 
        ? 'Não há subscrições para cancelar! O plano gratuito é sempre gratuito, e o cartão é um pagamento único. Pode apagar a sua conta quando quiser.'
        : 'There are no subscriptions to cancel! The free plan is always free, and the card is a one-time payment. You can delete your account anytime.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'FAQ - Perguntas Frequentes | PocketCV' : 'FAQ - Frequently Asked Questions | PocketCV'}
        </title>
        <meta 
          name="description" 
          content={isPortuguese(language)
            ? 'Encontre respostas para as perguntas mais frequentes sobre a PocketCV, cartões NFC e networking profissional.'
            : 'Find answers to the most frequently asked questions about PocketCV, NFC cards and professional networking.'
          } 
        />
      </Helmet>

      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/5 via-white to-[#ff5757]/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'Perguntas Frequentes' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isPortuguese(language) 
                ? 'Encontre respostas para as suas dúvidas sobre a PocketCV'
                : 'Find answers to your questions about PocketCV'
              }
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="bg-white border rounded-lg px-6">
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">
              {isPortuguese(language) ? 'Ainda tem dúvidas?' : 'Still have questions?'}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {isPortuguese(language) 
                ? 'Entre em contacto connosco e teremos todo o gosto em ajudar'
                : 'Get in touch with us and we\'ll be happy to help'
              }
            </p>
            <a 
              href="mailto:pocketcvnetworking@gmail.com" 
              className="inline-block bg-gradient-to-r from-[#8c52ff] to-[#ff5757] text-white font-semibold py-3 px-8 rounded-lg hover:from-[#7c47ea] hover:to-[#ef4444] transition-colors"
            >
              {isPortuguese(language) ? 'Contactar Suporte' : 'Contact Support'}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
