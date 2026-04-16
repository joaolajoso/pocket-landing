
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NewsletterForm from "@/components/NewsletterForm";
import blogLeadFollowup from "@/assets/blog/blog-lead-followup.jpg";
import blogNfcNetworking from "@/assets/blog/blog-nfc-networking.jpg";
import blogProfessionalProfile from "@/assets/blog/blog-professional-profile.jpg";

const Blog = () => {
  const { language } = useLanguage();

  const blogPosts = [
    {
      title: isPortuguese(language) ? 'Follow-Up de Leads Pós-Evento: O Guia Definitivo' : 'Post-Event Lead Follow-Up: The Definitive Guide',
      description: isPortuguese(language) 
        ? 'Aprenda estratégias eficazes para fazer follow-up e organizar leads após eventos. Descubra como transformar contactos em oportunidades reais.'
        : 'Learn effective strategies to follow-up and organize leads after events. Discover how to turn contacts into real opportunities.',
      date: '2025-05-15',
      readTime: isPortuguese(language) ? '8 min leitura' : '8 min read',
      category: isPortuguese(language) ? 'Eventos & Networking' : 'Events & Networking',
      image: blogLeadFollowup,
      slug: 'follow-up-leads-pos-evento'
    },
    {
      title: isPortuguese(language) ? 'Como Impulsionar o Networking com NFC' : 'Boost Your Networking with NFC Technology',
      description: isPortuguese(language) 
        ? 'Descubra como a tecnologia NFC está a revolucionar o networking profissional e como pode aproveitar esta inovação.'
        : 'Discover how NFC technology is revolutionizing professional networking and how you can leverage this innovation.',
      date: '2025-04-10',
      readTime: isPortuguese(language) ? '4 min leitura' : '4 min read',
      category: isPortuguese(language) ? 'Tecnologia' : 'Technology',
      image: blogNfcNetworking,
      slug: 'boost-networking-with-nfc'
    },
    {
      title: isPortuguese(language) ? 'Dicas para um Perfil Profissional Perfeito' : 'Tips for a Perfect Professional Profile',
      description: isPortuguese(language) 
        ? 'Guia completo sobre como criar um perfil profissional que impressiona e gera resultados.'
        : 'Complete guide on how to create a professional profile that impresses and generates results.',
      date: '2025-04-20',
      readTime: isPortuguese(language) ? '7 min leitura' : '7 min read',
      category: isPortuguese(language) ? 'Carreira' : 'Career',
      image: blogProfessionalProfile,
      slug: 'digital-business-cards-guide'
    },
    {
      title: isPortuguese(language) ? 'Como Partilhar o Seu Perfil Profissional' : 'How to Share Your Professional Profile',
      description: isPortuguese(language) 
        ? 'Métodos eficazes para partilhar o seu perfil PocketCV e maximizar as suas conexões profissionais.'
        : 'Effective methods to share your PocketCV profile and maximize your professional connections.',
      date: '2025-04-25',
      readTime: isPortuguese(language) ? '6 min leitura' : '6 min read',
      category: isPortuguese(language) ? 'Negócios' : 'Business',
      image: '/lovable-uploads/2a7f8ce8-8c35-49be-8e87-49f4e11ad191.png',
      slug: 'modern-networking-strategies'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'Blog - PocketCV' : 'Blog - PocketCV'}
        </title>
        <meta 
          name="description" 
          content={isPortuguese(language)
            ? 'Leia artigos sobre networking profissional, tecnologia NFC e dicas de carreira no blog da PocketCV.'
            : 'Read articles about professional networking, NFC technology and career tips on the PocketCV blog.'
          } 
        />
      </Helmet>

      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/5 via-white to-[#ff5757]/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'Blog PocketCV' : 'PocketCV Blog'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isPortuguese(language) 
                ? 'Insights, dicas e tendências sobre networking profissional e tecnologia'
                : 'Insights, tips and trends about professional networking and technology'
              }
            </p>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <span className="bg-[#8c52ff]/10 text-[#8c52ff] px-2 py-1 rounded-full text-xs">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.date).toLocaleDateString(isPortuguese(language) ? 'pt-PT' : 'en-US')}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="flex items-center gap-1 text-[#8c52ff] hover:text-[#ff5757] transition-colors font-medium"
                      >
                        {isPortuguese(language) ? 'Ler mais' : 'Read more'}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">
              {isPortuguese(language) ? 'Mais Conteúdo em Breve' : 'More Content Coming Soon'}
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {isPortuguese(language) 
                ? 'Estamos a preparar mais artigos úteis sobre networking, tecnologia e desenvolvimento profissional. Subscreva a nossa newsletter para não perder nada!'
                : 'We\'re preparing more useful articles about networking, technology and professional development. Subscribe to our newsletter to not miss anything!'
              }
            </p>
            <NewsletterForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
