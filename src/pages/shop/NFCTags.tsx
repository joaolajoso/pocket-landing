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
import { Check, Key, Zap, Shield, ArrowLeft, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { LightModeWrapper } from "@/components/LightModeWrapper";
import nfcTagWhite from "@/assets/shop/nfc-tag-white.png";
import nfcTagBlack from "@/assets/shop/nfc-tag-black.png";

const NFCTags = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const getPrice = (qty: number) => {
    if (qty >= 100) return 3;
    if (qty >= 50) return 4;
    return 5;
  };

  const features = [
    {
      title: isPt ? "Portátil e Compacto" : "Portable & Compact",
      description: isPt 
        ? "Chaveiro leve e discreto que cabe em qualquer lugar"
        : "Lightweight and discreet keychain that fits anywhere",
      icon: Key,
    },
    {
      title: isPt ? "Lead Capture Rápido" : "Fast Lead Capture",
      description: isPt 
        ? "Compartilhe seu perfil e capture leads em segundos"
        : "Share your profile and capture leads in seconds",
      icon: Zap,
    },
    {
      title: isPt ? "Durável e Resistente" : "Durable & Resistant",
      description: isPt 
        ? "Construído para durar com materiais de alta qualidade"
        : "Built to last with high-quality materials",
      icon: Shield,
    },
  ];

  const specifications = [
    { label: isPt ? "Material" : "Material", value: isPt ? "PVC Resistente" : "Durable PVC" },
    { label: isPt ? "Tecnologia" : "Technology", value: "NFC NTAG213" },
    { label: isPt ? "Formato" : "Format", value: isPt ? "Redondo" : "Round" },
    { label: isPt ? "Diâmetro" : "Diameter", value: "30mm" },
    { label: isPt ? "Espessura" : "Thickness", value: "3mm" },
    { label: isPt ? "Argola" : "Ring", value: isPt ? "Metálica Incluída" : "Metal Included" },
  ];

  const pricing = [
    { quantity: "1-24", price: "€7" },
    { quantity: "25-49", price: "€6" },
    { quantity: "50+", price: "€5" },
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
                <span className="text-foreground">{isPt ? "Tags NFC / Chaveiros" : "NFC Tags / Keychains"}</span>
              </div>
            </div>
          </section>

          {/* Product Hero */}
          <section className="py-12 px-4">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Images */}
                <div className="space-y-4">
                  <div className="bg-muted/20 rounded-lg p-8">
                    <img 
                      src={nfcTagWhite} 
                      alt="NFC Tag White"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <img 
                      src={nfcTagWhite} 
                      alt="NFC Tag White"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    />
                    <img 
                      src={nfcTagBlack} 
                      alt="NFC Tag Black"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <Badge className="mb-4 bg-pocketcv-coral text-white">
                      {isPt ? "Compacto" : "Compact"}
                    </Badge>
                    <h1 className="text-4xl font-bold mb-4">
                      {isPt ? "Tags NFC / Chaveiros" : "NFC Tags / Keychains"}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {isPt 
                        ? "Solução compacta e portátil para networking móvel. Perfeito para ter sempre com você e compartilhar seu perfil instantaneamente."
                        : "Compact and portable solution for mobile networking. Perfect to always have with you and share your profile instantly."}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-pocketcv-purple">
                      {isPt ? "A partir de €5" : "From €5"}
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
                          id: `nfc-tag-${Date.now()}`,
                          name: isPt ? "Tags NFC / Chaveiros" : "NFC Tags / Keychains",
                          price: getPrice(quantity),
                          image: nfcTagWhite,
                          productId: "nfc-tags",
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
                          <span>{isPt ? "Design Compacto e Leve" : "Compact & Lightweight Design"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Tecnologia NFC Confiável" : "Reliable NFC Technology"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Branding PocketCV" : "PocketCV Branding"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Argola Metálica Incluída" : "Metal Ring Included"}</span>
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

export default NFCTags;
