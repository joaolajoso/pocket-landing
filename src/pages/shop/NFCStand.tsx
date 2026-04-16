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
import { Check, Star, Zap, Users, TrendingUp, ArrowLeft, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { LightModeWrapper } from "@/components/LightModeWrapper";
import nfcStandBlack from "@/assets/shop/nfc-stand-black.png";
import nfcStandClear from "@/assets/shop/nfc-stand-clear.png";

const NFCStand = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const features = [
    {
      title: isPt ? "Lead Capture Automático" : "Automatic Lead Capture",
      description: isPt 
        ? "Capture informações de contato automaticamente quando alguém aproxima seu smartphone"
        : "Automatically capture contact information when someone taps their smartphone",
      icon: Zap,
    },
    {
      title: isPt ? "Google Reviews Integrado" : "Integrated Google Reviews",
      description: isPt 
        ? "Facilite avaliações no Google e aumente sua presença online"
        : "Facilitate Google reviews and boost your online presence",
      icon: Star,
    },
    {
      title: isPt ? "Ideal para Eventos" : "Ideal for Events",
      description: isPt 
        ? "Perfeito para feiras, conferências e eventos de networking"
        : "Perfect for trade shows, conferences, and networking events",
      icon: Users,
    },
    {
      title: isPt ? "Design Profissional" : "Professional Design",
      description: isPt 
        ? "Stand em acrílico premium que valoriza sua marca"
        : "Premium acrylic stand that elevates your brand",
      icon: TrendingUp,
    },
  ];

  const specifications = [
    { label: isPt ? "Material" : "Material", value: isPt ? "Acrílico Premium" : "Premium Acrylic" },
    { label: isPt ? "Tecnologia" : "Technology", value: "NFC + QR Code" },
    { label: isPt ? "Cores Disponíveis" : "Available Colors", value: isPt ? "Preto, Transparente" : "Black, Clear" },
    { label: isPt ? "Dimensões" : "Dimensions", value: "10cm x 15cm" },
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
                <span className="text-foreground">{isPt ? "Stand NFC" : "NFC Stand"}</span>
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
                      src={nfcStandBlack} 
                      alt="NFC Stand Black"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <img 
                      src={nfcStandBlack} 
                      alt="NFC Stand Black"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    />
                    <img 
                      src={nfcStandClear} 
                      alt="NFC Stand Clear"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <Badge className="mb-4 bg-pocketcv-coral text-white">
                      {isPt ? "Ideal para Eventos" : "Ideal for Events"}
                    </Badge>
                    <h1 className="text-4xl font-bold mb-4">{isPt ? "Stand NFC" : "NFC Stand"}</h1>
                    <p className="text-lg text-muted-foreground">
                      {isPt 
                        ? "Stand profissional em acrílico para captura de leads em eventos e negócios. Transforme cada interação em uma oportunidade de negócio."
                        : "Professional acrylic stand for lead capture at events and businesses. Transform every interaction into a business opportunity."}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-pocketcv-purple">€15</span>
                    <span className="text-muted-foreground">{isPt ? "por unidade" : "per unit"}</span>
                  </div>

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
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={() => {
                        addItem({
                          id: `nfc-stand-${quantity}`,
                          name: isPt ? "Stand NFC" : "NFC Stand",
                          price: 15,
                          image: nfcStandBlack,
                          productId: "nfc-stand",
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
                          <span>{isPt ? "Lead Capture Automático" : "Automatic Lead Capture"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Google Reviews Integrado" : "Integrated Google Reviews"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Design Profissional Premium" : "Premium Professional Design"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span>{isPt ? "Fácil Configuração" : "Easy Setup"}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

export default NFCStand;
