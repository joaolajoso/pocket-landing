import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { CartDrawer } from "@/components/shop/CartDrawer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Zap, Shield, ArrowLeft, ShoppingCart } from "lucide-react";
import { InteractiveCard3D } from "@/components/shop/InteractiveCard3D";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { LightModeWrapper } from "@/components/LightModeWrapper";
import nfcCardPocketCV from "@/assets/shop/nfc-card-pocketcv.png";

const NFCCardStandard = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const getPrice = (qty: number) => {
    if (qty >= 10) return 8;
    return 12;
  };

  const features = [
    {
      title: isPt ? "Alta Qualidade" : "High Quality",
      description: isPt 
        ? "Cartão PVC premium com acabamento matte e tecnologia NFC de última geração"
        : "Premium PVC card with matte finish and latest NFC technology",
      icon: Shield,
    },
    {
      title: isPt ? "Lead Capture" : "Lead Capture",
      description: isPt 
        ? "Capture informações de contato instantaneamente com um toque"
        : "Capture contact information instantly with a tap",
      icon: Zap,
    },
    {
      title: isPt ? "Branding PocketCV" : "PocketCV Branding",
      description: isPt 
        ? "Design elegante com as cores e logo da PocketCV"
        : "Elegant design with PocketCV colors and logo",
      icon: CreditCard,
    },
  ];

  const specifications = [
    { label: isPt ? "Material" : "Material", value: "PVC Premium" },
    { label: isPt ? "Tecnologia" : "Technology", value: "NFC NTAG216" },
    { label: isPt ? "Acabamento" : "Finish", value: isPt ? "Matte" : "Matte" },
    { label: isPt ? "Dimensões" : "Dimensions", value: "85.6mm x 54mm (ISO)" },
    { label: isPt ? "Espessura" : "Thickness", value: "0.84mm" },
  ];

  const pricing = [
    { quantity: "1-9", price: "€12" },
    { quantity: "10+", price: "€8" },
  ];

  return (
    <LightModeWrapper>
      <div className="flex flex-col min-h-screen">
        <ShopHeader />
        <CartDrawer />
        <main className="flex-1">
          {/* Breadcrumb */}
          <section className="py-4 px-4 border-b">
            <div className="container mx-auto max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link 
                  to="/shop" 
                  className="hover:text-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/shop';
                  }}
                >
                  {isPt ? "Loja" : "Shop"}
                </Link>
                <span>/</span>
                <span className="text-foreground">{isPt ? "Cartão NFC Padrão" : "Standard NFC Card"}</span>
              </div>
            </div>
          </section>

          {/* Product Hero */}
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Images */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-background to-muted/20 rounded-xl p-12 flex items-center justify-center">
                    <InteractiveCard3D
                      imageSrc={nfcCardPocketCV}
                      alt="PocketCV NFC Card"
                      className="w-full max-w-md h-auto rounded-xl shadow-2xl"
                    />
                  </div>
                  <p className="text-center text-sm text-muted-foreground animate-fade-in">
                    {isPt ? "✨ Passe o mouse sobre o cartão e veja a mágica" : "✨ Hover over the card and see the magic"}
                  </p>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <Badge className="mb-4 bg-pocketcv-purple text-white">
                      {isPt ? "Mais Popular" : "Most Popular"}
                    </Badge>
                    <h1 className="text-4xl font-bold mb-4">
                      {isPt ? "Cartão NFC Padrão" : "Standard NFC Card"}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {isPt 
                        ? "Cartão de visita digital com tecnologia NFC e branding PocketCV. Compartilhe seu perfil profissional com um toque e capture leads instantaneamente."
                        : "Digital business card with NFC technology and PocketCV branding. Share your professional profile with a tap and capture leads instantly."}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-pocketcv-purple">
                      {isPt ? "A partir de €12" : "From €12"}
                    </span>
                    <span className="text-muted-foreground">{isPt ? "por unidade" : "per unit"}</span>
                  </div>

                  {/* Pricing Table */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-4">{isPt ? "Preços por Quantidade" : "Volume Pricing"}</h3>
                      <div className="space-y-3">
                        {pricing.map((tier, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{tier.quantity} {isPt ? "unidades" : "units"}</span>
                            <span className="font-bold text-lg">{tier.price}/{isPt ? "un" : "ea"}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">{isPt ? "Quantidade" : "Quantity"}</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <p className="text-sm text-muted-foreground">
                        {isPt ? "Preço unitário: " : "Unit price: "}€{getPrice(quantity)}
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={() => {
                        addItem({
                          id: `nfc-card-standard-${Date.now()}`,
                          name: isPt ? "Cartão NFC Padrão" : "Standard NFC Card",
                          price: getPrice(quantity),
                          image: nfcCardPocketCV,
                          productId: "nfc-card-standard",
                          quantity,
                        });
                      }}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {isPt ? "Adicionar ao Carrinho" : "Add to Cart"}
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" asChild>
                      <Link to="/shop">
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        {isPt ? "Voltar à Loja" : "Back to Shop"}
                      </Link>
                    </Button>
                  </div>

                  {/* Quick Features */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Material Premium PVC" : "Premium PVC Material"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Tecnologia NFC Avançada" : "Advanced NFC Technology"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Design Profissional PocketCV" : "Professional PocketCV Design"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Lead Capture Integrado" : "Integrated Lead Capture"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-16 px-4 bg-muted/20">
            <div className="container mx-auto max-w-7xl">
              <h2 className="text-3xl font-bold mb-12 text-center">
                {isPt ? "Características Principais" : "Key Features"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <Icon className="h-10 w-10 text-pocketcv-purple mb-4" />
                        <h3 className="font-bold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Specifications */}
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold mb-8">
                {isPt ? "Especificações Técnicas" : "Technical Specifications"}
              </h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                        <span className="font-medium">{spec.label}</span>
                        <span className="text-muted-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </LightModeWrapper>
  );
};

export default NFCCardStandard;
