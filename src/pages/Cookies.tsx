
import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

const Cookies = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'Política de Cookies - PocketCV' : 'Cookie Policy - PocketCV'}
        </title>
        <meta 
          name="description" 
          content={isPortuguese(language)
            ? 'Saiba como utilizamos cookies no PocketCV para melhorar a sua experiência.'
            : 'Learn how we use cookies at PocketCV to improve your experience.'
          } 
        />
      </Helmet>

      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/5 via-white to-[#ff5757]/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'Política de Cookies' : 'Cookie Policy'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isPortuguese(language) 
                ? 'Como utilizamos cookies para melhorar a sua experiência'
                : 'How we use cookies to improve your experience'
              }
            </p>
          </div>
        </section>

        {/* Cookie Policy Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <p className="text-gray-600 mb-8">
                  {isPortuguese(language) ? 'Última atualização: 15 de dezembro de 2024' : 'Last updated: December 15, 2024'}
                </p>

                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '1. O que são Cookies?' : '1. What are Cookies?'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language) 
                        ? 'Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita o nosso website. Eles ajudam-nos a melhorar a sua experiência, lembrando as suas preferências e fornecendo funcionalidades personalizadas.'
                        : 'Cookies are small text files stored on your device when you visit our website. They help us improve your experience by remembering your preferences and providing personalized features.'
                      }
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '2. Tipos de Cookies que Utilizamos' : '2. Types of Cookies We Use'}
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-[#ff5757]">
                          {isPortuguese(language) ? 'Cookies Essenciais' : 'Essential Cookies'}
                        </h3>
                        <p className="text-gray-700">
                          {isPortuguese(language) 
                            ? 'Necessários para o funcionamento básico do website. Incluem cookies de autenticação e sessão.'
                            : 'Necessary for basic website functionality. Include authentication and session cookies.'
                          }
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-[#ff5757]">
                          {isPortuguese(language) ? 'Cookies de Análise' : 'Analytics Cookies'}
                        </h3>
                        <p className="text-gray-700">
                          {isPortuguese(language) 
                            ? 'Ajudam-nos a compreender como os utilizadores interagem com o site para melhorarmos a experiência.'
                            : 'Help us understand how users interact with the site to improve the experience.'
                          }
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-[#ff5757]">
                          {isPortuguese(language) ? 'Cookies de Funcionalidade' : 'Functionality Cookies'}
                        </h3>
                        <p className="text-gray-700">
                          {isPortuguese(language) 
                            ? 'Lembram as suas preferências, como idioma e configurações de conta.'
                            : 'Remember your preferences, such as language and account settings.'
                          }
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '3. Cookies de Terceiros' : '3. Third-Party Cookies'}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {isPortuguese(language) 
                        ? 'Utilizamos alguns serviços de terceiros que podem definir cookies:'
                        : 'We use some third-party services that may set cookies:'
                      }
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>
                        <strong>Google Analytics:</strong> {isPortuguese(language) ? 'Para análise de tráfego e comportamento' : 'For traffic and behavior analysis'}
                      </li>
                      <li>
                        <strong>Supabase:</strong> {isPortuguese(language) ? 'Para autenticação e base de dados' : 'For authentication and database'}
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '4. Controlo de Cookies' : '4. Cookie Control'}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {isPortuguese(language) 
                        ? 'Pode controlar os cookies das seguintes formas:'
                        : 'You can control cookies in the following ways:'
                      }
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>{isPortuguese(language) ? 'Configurações do seu browser' : 'Your browser settings'}</li>
                      <li>{isPortuguese(language) ? 'Painel de preferências do site (quando disponível)' : 'Site preference panel (when available)'}</li>
                      <li>{isPortuguese(language) ? 'Ferramentas de opt-out de terceiros' : 'Third-party opt-out tools'}</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '5. Configurações do Browser' : '5. Browser Settings'}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {isPortuguese(language) 
                        ? 'A maioria dos browsers permite:'
                        : 'Most browsers allow you to:'
                      }
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>{isPortuguese(language) ? 'Ver cookies armazenados' : 'View stored cookies'}</li>
                      <li>{isPortuguese(language) ? 'Bloquear todos os cookies' : 'Block all cookies'}</li>
                      <li>{isPortuguese(language) ? 'Bloquear cookies de terceiros' : 'Block third-party cookies'}</li>
                      <li>{isPortuguese(language) ? 'Eliminar cookies existentes' : 'Delete existing cookies'}</li>
                      <li>{isPortuguese(language) ? 'Ser notificado quando um cookie é definido' : 'Be notified when a cookie is set'}</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '6. Impacto de Desativar Cookies' : '6. Impact of Disabling Cookies'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language) 
                        ? 'Desativar cookies pode afetar a funcionalidade do website. Algumas funcionalidades podem não funcionar corretamente, como manter a sessão iniciada ou lembrar as suas preferências.'
                        : 'Disabling cookies may affect website functionality. Some features may not work properly, such as staying logged in or remembering your preferences.'
                      }
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '7. Atualizações desta Política' : '7. Updates to this Policy'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language) 
                        ? 'Podemos atualizar esta política de cookies ocasionalmente. Quaisquer alterações serão publicadas nesta página com a data de atualização.'
                        : 'We may update this cookie policy occasionally. Any changes will be posted on this page with the update date.'
                      }
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '8. Contacto' : '8. Contact'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language) 
                        ? 'Para questões sobre cookies:'
                        : 'For questions about cookies:'
                      }
                    </p>
                    <p className="text-gray-700 mt-2">
                      <strong>Email:</strong> pocketcvnetworking@gmail.com<br />
                      <strong>{isPortuguese(language) ? 'Website:' : 'Website:'}</strong> pocketcv.pt
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;
