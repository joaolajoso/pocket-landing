import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { BulkOrderSection } from "@/components/shop/BulkOrderSection";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Zap, Users, TrendingUp, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { LightModeWrapper } from "@/components/LightModeWrapper";
import { useCart } from "@/contexts/CartContext";
import nfcCardStandard from "@/assets/nfc-card-standard.png";
import nfcCardCustom from "@/assets/nfc-card-custom.png";

const ThreeLavaLamp = lazy(() => import("@/components/ui/ThreeLavaLamp").then(m => ({ default: m.default })));

const Shop = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const { addItem } = useCart();

  const products = [
    {
      id: "nfc-card-standard",
      name: isPt ? "Cartão NFC Padrão" : "Standard NFC Card",
      description: isPt 
        ? "Cartão NFC premium com branding PocketCV e tecnologia de ponta"
        : "Premium NFC card with PocketCV branding and cutting-edge technology",
      price: 12,
      priceDisplay: isPt ? "A partir de €12" : "From €12",
      image: nfcCardStandard,
      badge: isPt ? "Mais Popular" : "Most Popular",
      features: [
        isPt ? "Alta Qualidade" : "High Quality",
        isPt ? "Lead Capture" : "Lead Capture",
        isPt ? "Branding PocketCV" : "PocketCV Branding",
      ],
      link: "/shop/nfc-card-standard",
    },
    {
      id: "nfc-card-custom",
      name: isPt ? "Cartão NFC Personalizado" : "Custom NFC Card",
      description: isPt 
        ? "Cartão NFC de alta qualidade com seu design personalizado"
        : "High-quality NFC card with your custom design",
      price: 30,
      priceDisplay: isPt ? "A partir de €30" : "From €30",
      image: nfcCardCustom,
      badge: isPt ? "Personalizável" : "Customizable",
      features: [
        isPt ? "Design Personalizado" : "Custom Design",
        isPt ? "Premium Quality" : "Premium Quality",
        isPt ? "Lead Capture" : "Lead Capture",
      ],
      link: "/shop/nfc-card-custom",
    },
  ];

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      productId: product.id,
    });
  };

  return (
    <LightModeWrapper>
      <div className="flex flex-col min-h-screen">
        <ShopHeader />
        <CartDrawer />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-16 md:py-24 px-4 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50/30" />
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            
            <div className="container mx-auto max-w-5xl relative z-10">
              <div className="text-center">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pocketcv-purple/10 to-pocketcv-coral/10 border border-pocketcv-purple/20 mb-6">
                  <div className="w-2 h-2 rounded-full bg-pocketcv-purple animate-pulse" />
                  <span className="text-sm font-medium text-pocketcv-purple">
                    {isPt ? "Loja PocketCV" : "PocketCV Shop"}
                  </span>
                </div>
                
                {/* Title with better contrast */}
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
                  <span className="text-foreground">{isPt ? "Produtos " : "Products "}</span>
                  <span className="text-pocketcv-purple">NFC</span>
                  <br className="hidden md:block" />
                  <span className="text-foreground">{isPt ? " para Networking " : " for Professional "}</span>
                  <span className="text-pocketcv-purple">{isPt ? "Profissional" : "Networking"}</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  {isPt 
                    ? "Potencializa o teu networking com a nossa linha de produtos NFC. Captura leads, partilha o teu perfil e destaca-te."
                    : "Supercharge your networking with our NFC product line. Capture leads, share your profile, and stand out."}
                </p>
                
                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border">
                    <div className="w-8 h-8 rounded-full bg-pocketcv-purple/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-pocketcv-purple" />
                    </div>
                    <span className="text-sm font-medium">{isPt ? "Lead Capture Automático" : "Automatic Lead Capture"}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border">
                    <div className="w-8 h-8 rounded-full bg-pocketcv-coral/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-pocketcv-coral" />
                    </div>
                    <span className="text-sm font-medium">{isPt ? "Networking Instantâneo" : "Instant Networking"}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">{isPt ? "Analytics em Tempo Real" : "Real-time Analytics"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section className="py-12 md:py-16 px-4">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link 
                    key={product.id} 
                    to={product.link}
                    className="group"
                  >
                    <Card className="flex flex-col h-full bg-white border border-slate-200/60 hover:border-pocketcv-purple/30 transition-all duration-300 hover:shadow-xl hover:shadow-pocketcv-purple/5 overflow-hidden">
                      {/* Image Container */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 aspect-[4/3] flex items-center justify-center p-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-slate-900/90 text-white backdrop-blur-sm">
                            {product.badge}
                          </span>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex flex-col flex-1 p-4">
                        {/* Product Name */}
                        <h3 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-pocketcv-purple transition-colors">
                          {product.name}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        
                        {/* Features - Compact Pills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {product.features.slice(0, 2).map((feature, index) => (
                            <span 
                              key={index} 
                              className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-100 text-slate-600"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        {/* Spacer */}
                        <div className="flex-1" />
                        
                        {/* Price & Action Row */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                              {isPt ? "A partir de" : "From"}
                            </span>
                            <span className="text-xl font-bold bg-gradient-to-r from-pocketcv-purple to-purple-600 bg-clip-text text-transparent">
                              €{product.price}
                            </span>
                          </div>
                          
                          <Button 
                            size="icon"
                            className="h-9 w-9 rounded-full bg-pocketcv-purple hover:bg-pocketcv-purple/90 shadow-md hover:shadow-lg transition-all hover:scale-105"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Bulk Order Section */}
          <BulkOrderSection />

          {/* CTA Section */}
          <section className="py-16 px-4 relative overflow-hidden">
            {/* Lava Lamp Background */}
            <div className="absolute inset-0">
              <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900" />}>
                <ThreeLavaLamp colors={["#7c3aed", "#581c87", "#ea580c", "#dc2626"]} />
              </Suspense>
            </div>
            
            <div className="container mx-auto max-w-4xl text-center text-white relative z-10">
              <h2 className="text-3xl font-bold mb-4">
                {isPt ? "Pronto para transformar o teu networking?" : "Ready to transform your networking?"}
              </h2>
              <p className="text-lg mb-8 opacity-90">
                {isPt 
                  ? "Escolhe os produtos ideais para o teu negócio ou evento e começa a capturar leads hoje."
                  : "Choose the ideal products for your business or event and start capturing leads today."}
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/contact">
                  {isPt ? "Fala Connosco" : "Contact Us"}
                </Link>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </LightModeWrapper>
  );
};

export default Shop;
