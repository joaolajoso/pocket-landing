
import React, { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define FAQ translations
const translations = {
  en: {
    title: "Frequently Asked Questions",
    description: "Find answers to the most common questions about PocketCV.",
    questions: [
      {
        question: "How does the NFC technology work?",
        answer: "PocketCV cards contain an NFC chip that communicates with smartphones when tapped. The chip sends a URL to the phone, which automatically opens your profile in the phone's browser. No app installation is required for the person viewing your profile."
      },
      {
        question: "Will my card work with all smartphones?",
        answer: "PocketCV cards work with the majority of modern smartphones (both Android and iOS) that have NFC capabilities. For phones without NFC, your profile can still be accessed via the personalized URL printed on your card."
      },
      {
        question: "How do I customize my PocketCV profile?",
        answer: "After ordering your card, you'll receive access to our user-friendly dashboard where you can add your personal information, professional experience, education, links to social profiles, and upload your CV/resume."
      },
      {
        question: "Can I update my information after creating my profile?",
        answer: "Absolutely! You can update your profile anytime through our dashboard. All changes are instantly reflected on your digital profile, while your physical card remains the same."
      },
      {
        question: "How quickly will I receive my PocketCV card after ordering?",
        answer: "Standard delivery typically takes 5-7 business days. We also offer expedited shipping options if you need your card sooner."
      },
      {
        question: "Is my data secure?",
        answer: "Yes, we take data security seriously. Your information is stored securely, and you have complete control over what information is displayed on your public profile."
      }
    ]
  },
  pt: {
    title: "Perguntas Frequentes",
    description: "Encontre respostas para as perguntas mais comuns sobre o PocketCV.",
    questions: [
      {
        question: "Como funciona a tecnologia NFC?",
        answer: "Os cartões PocketCV contêm um chip NFC que se comunica com smartphones quando tocados. O chip envia uma URL para o telefone, que abre automaticamente seu perfil no navegador do telefone. Não é necessária a instalação de aplicativo para a pessoa que visualiza seu perfil."
      },
      {
        question: "Meu cartão funcionará com todos os smartphones?",
        answer: "Os cartões PocketCV funcionam com a maioria dos smartphones modernos (Android e iOS) que possuem capacidade NFC. Para telefones sem NFC, seu perfil ainda pode ser acessado através da URL personalizada impressa no seu cartão."
      },
      {
        question: "Como personalizo meu perfil PocketCV?",
        answer: "Após encomendar seu cartão, você receberá acesso ao nosso painel de usuário onde poderá adicionar suas informações pessoais, experiência profissional, educação, links para perfis sociais e carregar seu CV/currículo."
      },
      {
        question: "Posso atualizar minhas informações após criar meu perfil?",
        answer: "Absolutamente! Você pode atualizar seu perfil a qualquer momento através do nosso painel. Todas as alterações são instantaneamente refletidas em seu perfil digital, enquanto seu cartão físico permanece o mesmo."
      },
      {
        question: "Quanto tempo levarei para receber meu cartão PocketCV após o pedido?",
        answer: "A entrega padrão normalmente leva de 5 a 7 dias úteis. Também oferecemos opções de envio expresso se você precisar do seu cartão mais cedo."
      },
      {
        question: "Meus dados estão seguros?",
        answer: "Sim, levamos a segurança de dados a sério. Suas informações são armazenadas com segurança, e você tem controle total sobre quais informações são exibidas em seu perfil público."
      }
    ]
  }
};

const FAQ = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll");
    elements?.forEach((el) => observer.observe(el));

    return () => {
      elements?.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-muted/30 to-background"
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100">
            {t.description}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {t.questions.map((faq, index) => (
              <AccordionItem 
                key={index}
                value={`item-${index}`} 
                className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700"
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <AccordionTrigger className="text-left font-medium text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
