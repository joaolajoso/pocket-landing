
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: isPortuguese(language) ? "Mensagem enviada!" : "Message sent!",
        description: isPortuguese(language) 
          ? "Obrigado pelo seu contacto. Responderemos em breve."
          : "Thank you for contacting us. We'll respond soon."
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast({
        title: isPortuguese(language) ? "Erro" : "Error",
        description: isPortuguese(language) 
          ? "Erro ao enviar mensagem. Tente novamente."
          : "Error sending message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>
          {isPortuguese(language) ? 'Contacto - PocketCV' : 'Contact - PocketCV'}
        </title>
        <meta 
          name="description" 
          content={isPortuguese(language)
            ? 'Entre em contacto com a equipa PocketCV. Estamos aqui para ajudar com qualquer questão.'
            : 'Get in touch with the PocketCV team. We\'re here to help with any questions.'
          } 
        />
      </Helmet>

      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-[#8c52ff]/5 via-white to-[#ff5757]/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] bg-clip-text text-transparent">
              {isPortuguese(language) ? 'Contacte-nos' : 'Contact Us'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isPortuguese(language) 
                ? 'Estamos aqui para ajudar. Entre em contacto connosco!'
                : 'We\'re here to help. Get in touch with us!'
              }
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {isPortuguese(language) ? 'Envie-nos uma Mensagem' : 'Send us a Message'}
                    </CardTitle>
                    <CardDescription>
                      {isPortuguese(language) 
                        ? 'Preencha o formulário e responderemos em breve'
                        : 'Fill out the form and we\'ll respond soon'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            {isPortuguese(language) ? 'Nome' : 'Name'}
                          </label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder={isPortuguese(language) ? 'O seu nome' : 'Your name'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email
                          </label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder={isPortuguese(language) ? 'O seu email' : 'Your email'}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {isPortuguese(language) ? 'Assunto' : 'Subject'}
                        </label>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          placeholder={isPortuguese(language) ? 'Assunto da mensagem' : 'Message subject'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {isPortuguese(language) ? 'Mensagem' : 'Message'}
                        </label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          placeholder={isPortuguese(language) ? 'A sua mensagem...' : 'Your message...'}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-[#8c52ff] to-[#ff5757] hover:from-[#7c47ea] hover:to-[#ef4444]"
                        disabled={loading}
                      >
                        {loading 
                          ? (isPortuguese(language) ? 'Enviando...' : 'Sending...')
                          : (isPortuguese(language) ? 'Enviar Mensagem' : 'Send Message')
                        }
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    {isPortuguese(language) ? 'Outras Formas de Contacto' : 'Other Ways to Contact'}
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] rounded-full flex items-center justify-center">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Email</h3>
                        <p className="text-gray-600">pocketcvnetworking@gmail.com</p>
                        <p className="text-sm text-gray-500">
                          {isPortuguese(language) ? 'Resposta em 24h' : 'Response within 24h'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] rounded-full flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {isPortuguese(language) ? 'Chat Online' : 'Live Chat'}
                        </h3>
                        <p className="text-gray-600">
                          {isPortuguese(language) ? 'Disponível 9h-18h' : 'Available 9am-6pm'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {isPortuguese(language) ? 'Segunda a Sexta' : 'Monday to Friday'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#8c52ff] to-[#ff5757] rounded-full flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {isPortuguese(language) ? 'Localização' : 'Location'}
                        </h3>
                        <p className="text-gray-600">Portugal</p>
                        <p className="text-sm text-gray-500">
                          {isPortuguese(language) ? 'Empresa Portuguesa' : 'Portuguese Company'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {isPortuguese(language) ? 'Horário de Suporte' : 'Support Hours'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>{isPortuguese(language) ? 'Segunda a Sexta:' : 'Monday to Friday:'}</span>
                      <span>9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isPortuguese(language) ? 'Fim de semana:' : 'Weekend:'}</span>
                      <span>{isPortuguese(language) ? 'Email apenas' : 'Email only'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
