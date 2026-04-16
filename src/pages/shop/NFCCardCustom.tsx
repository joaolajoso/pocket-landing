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
import { Check, Palette, Sparkles, Shield, ArrowLeft, ShoppingCart } from "lucide-react";
import { InteractiveCard3D } from "@/components/shop/InteractiveCard3D";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { LightModeWrapper } from "@/components/LightModeWrapper";
import nfcCardPocketCV from "@/assets/shop/nfc-card-pocketcv.png";

const NFCCardCustom = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const getPrice = (qty: number) => {
    if (qty >= 250) return 8;
    if (qty >= 100) return 10;
    if (qty >= 50) return 12;
    if (qty >= 10) return 15;
    return 30;
  };

  const features = [
    {
      title: isPt ? "Design Personalizado" : "Custom Design",
      description: isPt 
        ? "Crie seu cartão com seu logo, cores e identidade visual única"
        : "Create your card with your logo, colors, and unique visual identity",
      icon: Palette,
    },
    {
      title: isPt ? "Qualidade Premium" : "Premium Quality",
      description: isPt 
        ? "Material PVC de alta qualidade com acabamentos especiais disponíveis"
        : "High-quality PVC material with special finishes available",
      icon: Shield,
    },
    {
      title: isPt ? "Tecnologia Avançada" : "Advanced Technology",
      description: isPt 
        ? "NFC de última geração com lead capture e analytics integrados"
        : "Latest NFC technology with integrated lead capture and analytics",
      icon: Sparkles,
    },
  ];

  const specifications = [
    { label: isPt ? "Material" : "Material", value: "PVC Premium" },
    { label: isPt ? "Tecnologia" : "Technology", value: "NFC NTAG216" },
    { label: isPt ? "Acabamentos" : "Finishes", value: isPt ? "Matte, Glossy, Metal" : "Matte, Glossy, Metal" },
    { label: isPt ? "Dimensões" : "Dimensions", value: "85.6mm x 54mm (ISO)" },
    { label: isPt ? "Espessura" : "Thickness", value: "0.84mm" },
    { label: isPt ? "Personalização" : "Customization", value: isPt ? "100% Personalizado" : "100% Customizable" },
  ];

  const pricing = [
    { quantity: "1-9", price: "€30" },
    { quantity: "10-49", price: "€15" },
    { quantity: "50-99", price: "€12" },
    { quantity: "100-249", price: "€10" },
    { quantity: "250+", price: "€8" },
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
                <span className="text-foreground">{isPt ? "Cartão NFC Personalizado" : "Custom NFC Card"}</span>
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
                      alt="PocketCV Custom NFC Card"
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
                    <Badge className="mb-4 bg-gradient-to-r from-pocketcv-purple to-pocketcv-coral text-white">
                      {isPt ? "Personalizável" : "Customizable"}
                    </Badge>
                    <h1 className="text-4xl font-bold mb-4">
                      {isPt ? "Cartão NFC Personalizado" : "Custom NFC Card"}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {isPt 
                        ? "Cartão de visita digital de alta qualidade com design 100% personalizado. Reflita sua marca única e destaque-se com tecnologia NFC premium."
                        : "High-quality digital business card with 100% custom design. Reflect your unique brand and stand out with premium NFC technology."}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-pocketcv-purple">
                      {isPt ? "A partir de €30" : "From €30"}
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
                          id: `nfc-card-custom-${Date.now()}`,
                          name: isPt ? "Cartão NFC Personalizado" : "Custom NFC Card",
                          price: getPrice(quantity),
                          image: nfcCardPocketCV,
                          productId: "nfc-card-custom",
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
                          <span>{isPt ? "Design 100% Personalizado" : "100% Custom Design"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Múltiplos Acabamentos" : "Multiple Finishes"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Qualidade Premium" : "Premium Quality"}</span>
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

export default NFCCardCustom;
