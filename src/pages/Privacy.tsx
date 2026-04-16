import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

const Privacy = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'Política de Privacidade - PocketCV' : 'Privacy Policy - PocketCV'}
        </title>
        <meta
          name="description"
          content={isPortuguese(language)
            ? 'Leia a nossa política de privacidade e saiba como protegemos os seus dados pessoais.'
            : 'Read our privacy policy and learn how we protect your personal data.'}
        />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/5 via-white to-[#ff5757]/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'Política de Privacidade' : 'Privacy Policy'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isPortuguese(language)
                ? 'A sua privacidade é a nossa prioridade. Saiba como protegemos os seus dados.'
                : 'Your privacy is our priority. Learn how we protect your data.'}
            </p>
          </div>
        </section>

        {/* Privacy Content */}
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
                      {isPortuguese(language) ? '1. Informações que Recolhemos' : '1. Information We Collect'}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {isPortuguese(language)
                        ? 'Recolhemos apenas as informações necessárias para fornecer o nosso serviço:'
                        : 'We only collect information necessary to provide our service:'}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>{isPortuguese(language) ? 'Informações de perfil (nome, email, biografia, foto)' : 'Profile information (name, email, bio, photo)'}</li>
                      <li>{isPortuguese(language) ? 'Links e informações de contacto que adiciona' : 'Links and contact information you add'}</li>
                      <li>{isPortuguese(language) ? 'Dados de utilização e análises (visualizações, cliques)' : 'Usage data and analytics (views, clicks)'}</li>
                      <li>{isPortuguese(language) ? 'Informações técnicas (endereço IP, browser)' : 'Technical information (IP address, browser)'}</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '2. Como Utilizamos os Seus Dados' : '2. How We Use Your Data'}
                    </h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>{isPortuguese(language) ? 'Criar e manter o seu perfil profissional' : 'Create and maintain your professional profile'}</li>
                      <li>{isPortuguese(language) ? 'Fornecer análises sobre as suas interações' : 'Provide analytics about your interactions'}</li>
                      <li>{isPortuguese(language) ? 'Melhorar o nosso serviço e funcionalidades' : 'Improve our service and features'}</li>
                      <li>{isPortuguese(language) ? 'Comunicar atualizações importantes' : 'Communicate important updates'}</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '3. Partilha de Dados' : '3. Data Sharing'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Nunca vendemos os seus dados pessoais. Apenas partilhamos informações quando:'
                        : 'We never sell your personal data. We only share information when:'}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mt-4">
                      <li>{isPortuguese(language) ? 'Você escolhe tornar o seu perfil público' : 'You choose to make your profile public'}</li>
                      <li>{isPortuguese(language) ? 'Requerido por lei ou autoridades competentes' : 'Required by law or competent authorities'}</li>
                      <li>{isPortuguese(language) ? 'Com fornecedores de serviços que nos ajudam (sempre com proteção adequada)' : 'With service providers who help us (always with adequate protection)'}</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '4. Os Seus Direitos (RGPD)' : '4. Your Rights (GDPR)'}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {isPortuguese(language)
                        ? 'Conforme o RGPD, você tem o direito de:'
                        : 'Under GDPR, you have the right to:'}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>{isPortuguese(language) ? 'Aceder aos seus dados pessoais' : 'Access your personal data'}</li>
                      <li>{isPortuguese(language) ? 'Corrigir informações incorretas' : 'Correct incorrect information'}</li>
                      <li>{isPortuguese(language) ? 'Solicitar a eliminação dos seus dados' : 'Request deletion of your data'}</li>
                      <li>{isPortuguese(language) ? 'Exportar os seus dados' : 'Export your data'}</li>
                      <li>{isPortuguese(language) ? 'Retirar o consentimento a qualquer momento' : 'Withdraw consent at any time'}</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '5. Segurança dos Dados' : '5. Data Security'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Utilizamos medidas de segurança de nível bancário para proteger os seus dados, incluindo encriptação SSL/TLS, acesso restrito e monitorização contínua.'
                        : 'We use bank-level security measures to protect your data, including SSL/TLS encryption, restricted access and continuous monitoring.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '6. Retenção de Dados' : '6. Data Retention'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Mantemos os seus dados apenas pelo tempo necessário para fornecer o serviço ou conforme requerido por lei. Pode solicitar a eliminação completa a qualquer momento.'
                        : 'We keep your data only for as long as necessary to provide the service or as required by law. You can request complete deletion at any time.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '7. Contacto' : '7. Contact'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Para questões sobre privacidade ou para exercer os seus direitos:'
                        : 'For privacy questions or to exercise your rights:'}
                    </p>
                    <p className="text-gray-700 mt-2">
                      <strong>Email:</strong> pocketcvnetworking@gmail.com<br />
                      <strong>{isPortuguese(language) ? 'Endereço:' : 'Address:'}</strong> PocketCV, Portugal
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

export default Privacy;
