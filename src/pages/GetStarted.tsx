import { useState } from "react";
import { Check, Package, CreditCard, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import OrderForm from "@/components/OrderForm";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters."
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters."
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters."
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters."
  }),
  zipCode: z.string().min(5, {
    message: "Zip code must be at least 5 characters."
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters."
  }),
  newsletter: z.boolean().default(false).optional()
});

type FormData = z.infer<typeof formSchema>;

const GetStarted = () => {
  const [orderType, setOrderType] = useState<'individual' | 'business'>('individual');
  const {
    language
  } = useLanguage();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      newsletter: false
    }
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    // Here you would typically handle order submission
    alert("Order submitted successfully! We'll contact you soon.");
  };

  return <div className="container max-w-6xl px-4 py-24 mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
          {language === 'en' ? 'Get Your ' : 'Obtenha Seu '}
          <span className="text-gradient">PocketCV</span> 
          {language === 'en' ? ' Card' : ' Cartão'}
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          {language === 'en' ? 'Order your PocketCV card and start networking with a single tap.' : 'Peça seu cartão PocketCV e comece a fazer networking com um único toque.'}
        </p>
      </div>

      <Tabs defaultValue="individual" className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
          <TabsTrigger value="individual" onClick={() => setOrderType('individual')}>
            {language === 'en' ? 'Individual' : 'Individual'}
          </TabsTrigger>
          <TabsTrigger value="business" onClick={() => setOrderType('business')}>
            {language === 'en' ? 'Business' : 'Empresarial'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="individual">
          <div className="max-w-3xl mx-auto">
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{language === 'en' ? 'Individual Card' : 'Cartão Individual'}</CardTitle>
                <CardDescription>{language === 'en' ? 'Perfect for professionals and students' : 'Perfeito para profissionais e estudantes'}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">€8</span><span className="text-muted-foreground ml-2">{language === 'en' ? '(one-time)' : '(pagamento único)'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-pocketcv-orange mr-2" />
                    <span>{language === 'en' ? '1 NFC-enabled PocketCV Card' : '1 Cartão PocketCV com NFC'}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-pocketcv-orange mr-2" />
                    <span>{language === 'en' ? 'Lifetime Cloud Hosting' : 'Hospedagem na Nuvem Vitalícia'}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-pocketcv-orange mr-2" />
                    <span>{language === 'en' ? 'Profile Customization' : 'Personalização de Perfil'}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-pocketcv-orange mr-2" />
                    <span>{language === 'en' ? 'View Profile Analytics' : 'Análise de Perfil'}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Order Form for Individual */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-xl font-medium mb-6">{language === 'en' ? 'Order Your PocketCV Card' : 'Peça Seu Cartão PocketCV'}</h3>
              <OrderForm />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="business">
          <div className="max-w-3xl mx-auto">
            <Card className="mb-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{language === 'en' ? 'Business Bulk Order' : 'Pedido em Lote para Empresas'}</CardTitle>
                <CardDescription>{language === 'en' ? 'For teams and organizations' : 'Para equipes e organizações'}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">€4</span>
                  <span className="text-muted-foreground ml-2">{language === 'en' ? 'per card (min. 50 cards)' : 'por cartão (mín. 50 cartões)'}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-pocketcv-orange mr-2" />
                    <span>{language === 'en' ? 'Minimum order: 50 NFC-enabled PocketCV Cards' : 'Pedido mínimo: 50 Cartões PocketCV com NFC'}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-pocketcv-orange mr-2" />
                    <span>{language === 'en' ? 'Bulk discount pricing' : 'Preços com desconto por volume'}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-pocketcv-orange mr-2" />
                    <span>{language === 'en' ? 'Team profile management' : 'Gerenciamento de perfil de equipe'}</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-pocketcv-orange mr-2" />
                    <span>{language === 'en' ? 'Priority customer support' : 'Suporte prioritário ao cliente'}</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {language === 'en' ? 'Custom branding options available for larger orders' : 'Opções de marca personalizada disponíveis para pedidos maiores'}
                  </span>
                </div>
              </CardFooter>
            </Card>

            {/* Business Inquiry Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-xl font-medium mb-6">
                {language === 'en' ? 'Request a Bulk Order Quote' : 'Solicitar Cotação para Pedido em Lote'}
              </h3>
              <OrderForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};

export default GetStarted;
