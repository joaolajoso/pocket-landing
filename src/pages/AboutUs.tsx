
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { ExternalLink, Linkedin } from "lucide-react";

const AboutUs = () => {
  const { language } = useLanguage();

  const teamMembers = [
    {
      name: "Victor De Julio",
      role: isPortuguese(language) ? "Fundador da PocketCV / Marketer & Empreendedor" : "Founder of PocketCV / Marketer & Entrepreneur",
      image: "/lovable-uploads/15c2aa2b-d4e7-4cc0-8b6d-45d3f5302353.png",
      position: "left",
      description: isPortuguese(language) 
        ? 'Visionário e líder por trás da PocketCV, Victor combina experiência em marketing com paixão por empreendedorismo para revolucionar o networking profissional. Como fundador, ele lidera a missão de transformar a forma como os profissionais se conectam, aplicando estratégias de marketing inovadoras para impulsionar o crescimento da empresa.'
        : 'Visionary and leader behind PocketCV, Victor combines marketing expertise with entrepreneurial passion to revolutionize professional networking. As founder, he leads the mission to transform how professionals connect, applying innovative marketing strategies to drive company growth.',
      linkedinUrl: "https://www.linkedin.com/in/victor-de-julio-2209bb1b2/"
    },
    {
      name: "Simão Pedro Sil",
      role: isPortuguese(language) ? "Estudante de Doutoramento: Marketing & Estratégia (UA, UBI, UM)" : "PhD Student: Marketing & Strategy (UA, UBI, UM)",
      image: "/lovable-uploads/803ac0c9-a174-41d0-ba72-de53113ec883.png",
      position: "right",
      description: isPortuguese(language)
        ? 'Estrategista de marketing determinado e comprometido, Simão é fundamental na missão da PocketCV de revolucionar o networking profissional. Ele aplica os seus conhecimentos académicos em marketing, branding e estratégia para desenvolver soluções inovadoras que impulsionam o crescimento da PocketCV no mercado empresarial, criando estratégias que conectam marcas e pessoas de forma autêntica.'
        : 'A determined and committed marketing strategist, Simão is fundamental to PocketCV\'s mission of revolutionizing professional networking. He applies his academic expertise in marketing, branding, and strategy to develop innovative solutions that drive PocketCV\'s growth in the business market, creating strategies that connect brands and people authentically.',
      linkedinUrl: "https://www.linkedin.com/in/sim%C3%A3o-pedro-sil/"
    },
    {
      name: "João Pedro Lajoso",
      role: isPortuguese(language) ? "Engenheiro de Dados" : "Data Engineer",
      image: "/lovable-uploads/b1e6179e-8a36-4c7e-90a8-ffdee8af1e6b.png",
      position: "left",
      description: isPortuguese(language)
        ? 'Ex-Sonae, Bosch e Aldi. Engenheiro de dados fascinado pela tecnologia e inovação, João é essencial para a missão da PocketCV de criar conexões profissionais sem fricção. Ele transforma a curiosidade em soluções técnicas robustas, construindo a infraestrutura tecnológica que sustenta a plataforma PocketCV. A sua expertise em programação e análise de dados garante que cada interação na plataforma seja fluida e eficiente.'
        : 'Ex-Sonae, Bosch and Aldi. A data engineer fascinated by technology and innovation, João is essential to PocketCV\'s mission of creating frictionless professional connections. He transforms curiosity into robust technical solutions, building the technological infrastructure that powers the PocketCV platform. His expertise in programming and data analysis ensures that every interaction on the platform is smooth and efficient.',
      linkedinUrl: "https://www.linkedin.com/in/joaolajoso/"
    }
  ];

  const missionText = isPortuguese(language) 
    ? "Ajudar empresas a conectarem-se com os seus futuros clientes. Acreditamos que deve ser fácil e emocionante fazer crescer o seu negócio através de interações presenciais. Damos vida a esta visão construindo apaixonadamente uma plataforma de \"Marketing Presencial\", concebida para equipas de alto crescimento e profissionais que compreendem o valor inegável do envolvimento cara a cara com prospects, parceiros e clientes. Ao desafiar o status quo e reimaginar o networking profissional, pretendemos revolucionar práticas empresariais desatualizadas e redefinir a experiência de marketing presencial - transformando-a numa arena dinâmica de oportunidade e crescimento."
    : "We're on a mission to reintroduce the power of face-to-face connections in a world obsessed with digital clicks. At the heart of our work is an In-Person Marketing platform — built to empower professionals and teams who thrive on human interaction.\n\nWe believe growth happens when conversations are real, eye contact is made, and trust is built naturally. That's why we're creating tools that make it effortless to capture leads, spark relationships, and turn brief encounters into lasting opportunities.\n\nFor the teams chasing ambitious goals and the professionals who understand that some deals can't be closed in a comment section — we're here to modernize what it means to meet, connect, and grow in the real world.";

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'Sobre Nós - PocketCV' : 'About Us - PocketCV'}
        </title>
        <meta 
          name="description" 
          content={isPortuguese(language)
            ? 'Conheça a equipa por trás da PocketCV e a nossa missão de revolucionar o networking profissional.'
            : 'Meet the team behind PocketCV and our mission to revolutionize professional networking.'
          } 
        />
      </Helmet>

      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/5 via-white to-[#ff5757]/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'Sobre Nós' : 'About Us'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {isPortuguese(language) 
                ? 'Conheça a equipa apaixonada que está a revolucionar o networking profissional'
                : 'Meet the passionate team revolutionizing professional networking'
              }
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
                {isPortuguese(language) ? 'A Nossa Missão' : 'Our Mission'}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line">
                {missionText}
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                {isPortuguese(language) ? 'A Nossa Equipa' : 'Our Team'}
              </h2>
              <p className="text-xl text-gray-600">
                {isPortuguese(language) 
                  ? 'As pessoas por trás da inovação'
                  : 'The people behind the innovation'
                }
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-16">
              {teamMembers.map((member, index) => (
                <div 
                  key={member.name}
                  className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
                    member.position === 'right' ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-64 h-64 rounded-full object-cover shadow-lg border-4 border-white"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8c52ff]/20 to-[#ff5757]/20"></div>
                    </div>
                  </div>
                  
                  <div className={`flex-1 text-center ${member.position === 'right' ? 'md:text-right' : 'md:text-left'} max-w-2xl`}>
                    <div className="relative inline-block group">
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-[#8c52ff] transition-colors flex items-center gap-2 justify-center md:justify-start"
                      >
                        {member.name}
                        <Linkedin className="w-6 h-6 text-[#0077b5]" />
                      </a>
                      
                      {/* LinkedIn Hover Card */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none group-hover:pointer-events-auto">
                        <div className="bg-gradient-to-br from-[#8c52ff] to-[#ff5757] p-6 rounded-xl shadow-2xl w-80 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                              LinkedIn
                            </div>
                            <ExternalLink className="w-5 h-5" />
                          </div>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-16 h-16 rounded-full border-2 border-white/30"
                            />
                            <div>
                              <h4 className="font-bold text-lg">{member.name}</h4>
                              <p className="text-white/90 text-sm">{member.role}</p>
                            </div>
                          </div>
                          
                          <p className="text-white/90 text-sm leading-relaxed">
                            {member.description.substring(0, 120)}...
                          </p>
                          
                          <div className="mt-4 pt-4 border-t border-white/20 text-center">
                            <span className="text-sm font-medium">
                              {isPortuguese(language) ? 'Clique para ver no LinkedIn' : 'Click to view on LinkedIn'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xl text-[#ff5757] font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#8c52ff] to-[#ff5757]">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {isPortuguese(language) ? 'Junte-se à Revolução' : 'Join the Revolution'}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {isPortuguese(language) 
                ? 'Faça parte do futuro do networking profissional com a PocketCV'
                : 'Be part of the future of professional networking with PocketCV'
              }
            </p>
            <Link 
              to="/login"
              className="inline-block bg-white text-[#8c52ff] hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {isPortuguese(language) ? 'Começar Agora' : 'Get Started Now'}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
