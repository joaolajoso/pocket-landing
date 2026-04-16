
import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Code, Database, Zap, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Developers = () => {
  const { language } = useLanguage();

  const apiFeatures = [
    {
      icon: Code,
      title: isPortuguese(language) ? 'API RESTful' : 'RESTful API',
      description: isPortuguese(language) 
        ? 'Integre facilmente com sistemas existentes usando nossa API moderna e bem documentada.'
        : 'Easily integrate with existing systems using our modern and well-documented API.'
    },
    {
      icon: Database,
      title: isPortuguese(language) ? 'Webhooks' : 'Webhooks',
      description: isPortuguese(language) 
        ? 'Receba notificações em tempo real sobre eventos do perfil e interações dos utilizadores.'
        : 'Receive real-time notifications about profile events and user interactions.'
    },
    {
      icon: Zap,
      title: isPortuguese(language) ? 'SDKs' : 'SDKs',
      description: isPortuguese(language) 
        ? 'Bibliotecas oficiais para JavaScript, Python e outras linguagens populares.'
        : 'Official libraries for JavaScript, Python and other popular languages.'
    },
    {
      icon: Shield,
      title: isPortuguese(language) ? 'Autenticação OAuth' : 'OAuth Authentication',
      description: isPortuguese(language) 
        ? 'Autenticação segura e padronizada para proteger dados dos utilizadores.'
        : 'Secure and standardized authentication to protect user data.'
    }
  ];

  const codeExample = `// Example: Get user profile
const response = await fetch('https://api.pocketcv.pt/v1/profiles/username', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const profile = await response.json();
console.log(profile);`;

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'Programadores - API PocketCV' : 'Developers - PocketCV API'}
        </title>
        <meta 
          name="description" 
          content={isPortuguese(language)
            ? 'Documentação da API PocketCV para programadores. Integre funcionalidades de networking profissional nas suas aplicações.'
            : 'PocketCV API documentation for developers. Integrate professional networking features into your applications.'
          } 
        />
      </Helmet>

      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/5 via-white to-[#ff5757]/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'API PocketCV' : 'PocketCV API'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isPortuguese(language) 
                ? 'Integre funcionalidades de networking profissional nas suas aplicações com nossa API poderosa e flexível'
                : 'Integrate professional networking features into your applications with our powerful and flexible API'
              }
            </p>
          </div>
        </section>

        {/* Coming Soon Notice */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="bg-gradient-to-r from-[#8c52ff]/10 to-[#ff5757]/10 border border-[#8c52ff]/20 rounded-lg p-8 text-center mb-16">
              <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                {isPortuguese(language) ? '🚧 API em Desenvolvimento' : '🚧 API in Development'}
              </h2>
              <p className="text-gray-700 mb-6">
                {isPortuguese(language) 
                  ? 'Estamos a trabalhar numa API completa que permitirá integrar todas as funcionalidades do PocketCV nas suas aplicações. Registe o seu interesse para ser notificado quando estiver disponível.'
                  : 'We\'re working on a complete API that will allow you to integrate all PocketCV features into your applications. Register your interest to be notified when it\'s available.'
                }
              </p>
              <a 
                href="mailto:pocketcvnetworking@gmail.com?subject=API%20Interest"
                className="inline-block bg-gradient-to-r from-[#8c52ff] to-[#ff5757] text-white font-semibold py-3 px-8 rounded-lg hover:from-[#7c47ea] hover:to-[#ef4444] transition-colors"
              >
                {isPortuguese(language) ? 'Registar Interesse' : 'Register Interest'}
              </a>
            </div>
          </div>
        </section>

        {/* Future Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {isPortuguese(language) ? 'Funcionalidades Planeadas' : 'Planned Features'}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {isPortuguese(language) 
                  ? 'A nossa API permitirá aos programadores aceder a todas as funcionalidades principais do PocketCV'
                  : 'Our API will allow developers to access all main PocketCV features'
                }
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {apiFeatures.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] rounded-full flex items-center justify-center mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Code Preview */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {isPortuguese(language) ? 'Exemplo de Código' : 'Code Example'}
              </h2>
              <p className="text-gray-600">
                {isPortuguese(language) 
                  ? 'Veja como será simples integrar a API PocketCV'
                  : 'See how simple it will be to integrate the PocketCV API'
                }
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  <code>{codeExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {isPortuguese(language) ? 'Casos de Uso' : 'Use Cases'}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-[#8c52ff]">
                  {isPortuguese(language) ? 'CRM Integration' : 'CRM Integration'}
                </h3>
                <p className="text-gray-600">
                  {isPortuguese(language) 
                    ? 'Sincronize contactos do PocketCV diretamente com sistemas CRM existentes'
                    : 'Sync PocketCV contacts directly with existing CRM systems'
                  }
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-[#8c52ff]">
                  {isPortuguese(language) ? 'Aplicações Móveis' : 'Mobile Apps'}
                </h3>
                <p className="text-gray-600">
                  {isPortuguese(language) 
                    ? 'Crie aplicações móveis personalizadas com funcionalidades de networking'
                    : 'Create custom mobile apps with networking features'
                  }
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-[#8c52ff]">
                  {isPortuguese(language) ? 'Análises Avançadas' : 'Advanced Analytics'}
                </h3>
                <p className="text-gray-600">
                  {isPortuguese(language) 
                    ? 'Desenvolva dashboards personalizados com dados de networking'
                    : 'Develop custom dashboards with networking data'
                  }
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Developers;
