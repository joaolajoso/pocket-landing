import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

const Terms = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'Termos de Serviço - PocketCV' : 'Terms of Service - PocketCV'}
        </title>
        <meta
          name="description"
          content={isPortuguese(language)
            ? 'Leia os nossos termos de serviço e condições de utilização da plataforma PocketCV.'
            : 'Read our terms of service and conditions for using the PocketCV platform.'}
        />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/5 via-white to-[#ff5757]/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'Termos de Serviço' : 'Terms of Service'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isPortuguese(language)
                ? 'Condições de utilização da plataforma PocketCV'
                : 'Terms and conditions for using the PocketCV platform'}
            </p>
          </div>
        </section>

        {/* Terms Content */}
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
                      {isPortuguese(language) ? '1. Aceitação dos Termos' : '1. Acceptance of Terms'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Ao utilizar o PocketCV, você aceita estes termos de serviço. Se não concorda com alguma parte destes termos, não deve utilizar o nosso serviço.'
                        : 'By using PocketCV, you accept these terms of service. If you do not agree with any part of these terms, you should not use our service.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '2. Descrição do Serviço' : '2. Service Description'}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {isPortuguese(language)
                        ? 'O PocketCV é uma plataforma que permite:'
                        : 'PocketCV is a platform that allows:'}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>{isPortuguese(language) ? 'Criar perfis profissionais online' : 'Create professional online profiles'}</li>
                      <li>{isPortuguese(language) ? 'Partilhar informações de contacto através de tecnologia NFC' : 'Share contact information through NFC technology'}</li>
                      <li>{isPortuguese(language) ? 'Gerir links e informações profissionais' : 'Manage links and professional information'}</li>
                      <li>{isPortuguese(language) ? 'Analisar interações e visualizações' : 'Analyze interactions and views'}</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '3. Contas de Utilizador' : '3. User Accounts'}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {isPortuguese(language)
                        ? 'Para utilizar o PocketCV, deve:'
                        : 'To use PocketCV, you must:'}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>{isPortuguese(language) ? 'Fornecer informações precisas e atualizadas' : 'Provide accurate and up-to-date information'}</li>
                      <li>{isPortuguese(language) ? 'Manter a segurança da sua conta' : 'Maintain the security of your account'}</li>
                      <li>{isPortuguese(language) ? 'Ser responsável por todas as atividades na sua conta' : 'Be responsible for all activities on your account'}</li>
                      <li>{isPortuguese(language) ? 'Notificar-nos imediatamente sobre uso não autorizado' : 'Notify us immediately of unauthorized use'}</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '4. Conteúdo do Utilizador' : '4. User Content'}
                    </h2>
                    <p className="text-gray-700 mb-4">
                      {isPortuguese(language)
                        ? 'Você é responsável pelo conteúdo que publica. O conteúdo deve:'
                        : 'You are responsible for the content you post. Content must:'}
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>{isPortuguese(language) ? 'Ser preciso e não enganoso' : 'Be accurate and not misleading'}</li>
                      <li>{isPortuguese(language) ? 'Não violar direitos de terceiros' : 'Not violate third-party rights'}</li>
                      <li>{isPortuguese(language) ? 'Cumprir todas as leis aplicáveis' : 'Comply with all applicable laws'}</li>
                      <li>{isPortuguese(language) ? 'Não conter material ofensivo ou inadequado' : 'Not contain offensive or inappropriate material'}</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '5. Pagamentos e Reembolsos' : '5. Payments and Refunds'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Os cartões NFC são vendidos por €5 (pagamento único). Os reembolsos são processados apenas em caso de defeito do produto ou erro da nossa parte, dentro de 30 dias após a compra.'
                        : 'NFC cards are sold for €5 (one-time payment). Refunds are processed only in case of product defect or error on our part, within 30 days of purchase.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '6. Propriedade Intelectual' : '6. Intellectual Property'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'O PocketCV e todos os seus componentes são propriedade da empresa. Você mantém os direitos sobre o seu conteúdo, mas concede-nos licença para utilizá-lo na prestação do serviço.'
                        : 'PocketCV and all its components are company property. You retain rights to your content, but grant us a license to use it in providing the service.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '7. Limitações de Responsabilidade' : '7. Limitation of Liability'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'O serviço é fornecido "como está". Não somos responsáveis por danos indiretos, perda de dados ou lucros cessantes. A nossa responsabilidade está limitada ao valor pago pelos nossos serviços.'
                        : 'The service is provided "as is". We are not responsible for indirect damages, data loss or lost profits. Our liability is limited to the amount paid for our services.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '8. Terminação' : '8. Termination'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Pode terminar a sua conta a qualquer momento. Reservamo-nos o direito de suspender ou terminar contas que violem estes termos.'
                        : 'You may terminate your account at any time. We reserve the right to suspend or terminate accounts that violate these terms.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '9. Alterações aos Termos' : '9. Changes to Terms'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Podemos atualizar estes termos ocasionalmente. As alterações serão comunicadas e entrarão em vigor 30 dias após a notificação.'
                        : 'We may update these terms occasionally. Changes will be communicated and take effect 30 days after notification.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '10. Lei Aplicável' : '10. Applicable Law'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Estes termos são regidos pela lei portuguesa. Qualquer disputa será resolvida pelos tribunais competentes em Portugal.'
                        : 'These terms are governed by Portuguese law. Any disputes will be resolved by the competent courts in Portugal.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-[#8c52ff]">
                      {isPortuguese(language) ? '11. Contacto' : '11. Contact'}
                    </h2>
                    <p className="text-gray-700">
                      {isPortuguese(language)
                        ? 'Para questões sobre estes termos:'
                        : 'For questions about these terms:'}
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

export default Terms;
