import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Building2, Percent, ShoppingCart, Plus, Minus, RotateCcw, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import nfcCardPocketCV from "@/assets/shop/nfc-card-pocketcv.png";

const VOLUME_TIERS = [
  { min: 10, max: 49, discount: 0.50, label: "10-49" },
  { min: 50, max: 99, discount: 0.55, label: "50-99" },
  { min: 100, max: 249, discount: 0.60, label: "100-249" },
  { min: 250, max: 10000, discount: 0.65, label: "250+" },
];

const MIN_UNIT_PRICE = 8;

const calculatePrice = (basePrice: number, discount: number) => {
  const discounted = basePrice * (1 - discount);
  return Math.max(discounted, MIN_UNIT_PRICE);
};

const getTierForQuantity = (quantity: number) => {
  if (quantity < 10) return { min: 0, max: 9, discount: 0, label: "1-9" };
  return VOLUME_TIERS.find(tier => quantity >= tier.min && quantity <= tier.max) || VOLUME_TIERS[VOLUME_TIERS.length - 1];
};

interface ProductConfig {
  id: string;
  name: { pt: string; en: string };
  image: string;
  basePrice: number;
  maxQuantity: number;
  quickAddOptions: number[];
}

const PRODUCTS: ProductConfig[] = [
  {
    id: "standard-card",
    name: { pt: "Cartão PocketCV Padrão", en: "Standard PocketCV Card" },
    image: nfcCardPocketCV,
    basePrice: 12,
    maxQuantity: 2000,
    quickAddOptions: [10, 50, 100],
  },
  {
    id: "custom-card",
    name: { pt: "Cartão PocketCV Personalizado", en: "Custom PocketCV Card" },
    image: nfcCardPocketCV,
    basePrice: 30,
    maxQuantity: 2000,
    quickAddOptions: [50, 100, 250],
  },
];

export const BulkOrderSection = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  const [quantities, setQuantities] = useState<Record<string, number>>({
    "standard-card": 0,
    "custom-card": 0,
  });

  const totalItems = useMemo(() => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  }, [quantities]);

  const currentTier = useMemo(() => {
    return getTierForQuantity(totalItems);
  }, [totalItems]);

  const orderSummary = useMemo(() => {
    let total = 0;
    let originalTotal = 0;
    const items: { name: string; quantity: number; unitPrice: number; originalPrice: number; subtotal: number }[] = [];

    PRODUCTS.forEach(product => {
      const qty = quantities[product.id];
      if (qty > 0) {
        const unitPrice = calculatePrice(product.basePrice, currentTier.discount);
        const subtotal = qty * unitPrice;
        total += subtotal;
        originalTotal += qty * product.basePrice;
        items.push({
          name: isPt ? product.name.pt : product.name.en,
          quantity: qty,
          unitPrice,
          originalPrice: product.basePrice,
          subtotal,
        });
      }
    });

    return { total, originalTotal, items, savings: originalTotal - total };
  }, [quantities, currentTier, isPt]);

  const handleAddQuantity = (productId: string, amount: number) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    setQuantities(prev => {
      const newValue = Math.min(prev[productId] + amount, product.maxQuantity);
      return { ...prev, [productId]: newValue };
    });
  };

  const handleRemoveQuantity = (productId: string, amount: number) => {
    setQuantities(prev => {
      const newValue = Math.max(prev[productId] - amount, 0);
      return { ...prev, [productId]: newValue };
    });
  };

  const handleResetProduct = (productId: string) => {
    setQuantities(prev => ({ ...prev, [productId]: 0 }));
  };

  const handleResetAll = () => {
    setQuantities({
      "standard-card": 0,
      "custom-card": 0,
    });
  };

  const handleContactUs = () => {
    const phoneNumber = "351929331791";
    const message = isPt
      ? `Olá! Gostaria de fazer um pedido:\n\n${orderSummary.items.map(item => `• ${item.name}: ${item.quantity} unidades (€${item.unitPrice.toFixed(2)}/un)`).join("\n")}\n\n💰 Total: €${orderSummary.total.toFixed(2)}\n🎉 Desconto aplicado: ${Math.round(currentTier.discount * 100)}%\n💵 Poupança: €${orderSummary.savings.toFixed(2)}`
      : `Hello! I would like to place an order:\n\n${orderSummary.items.map(item => `• ${item.name}: ${item.quantity} units (€${item.unitPrice.toFixed(2)}/ea)`).join("\n")}\n\n💰 Total: €${orderSummary.total.toFixed(2)}\n🎉 Discount applied: ${Math.round(currentTier.discount * 100)}%\n💵 Savings: €${orderSummary.savings.toFixed(2)}`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pocketcv-coral/10 to-orange-100 border border-pocketcv-coral/20 mb-6">
            <Building2 className="w-4 h-4 text-pocketcv-coral" />
            <span className="text-sm font-medium text-pocketcv-coral">
              {isPt ? "Para Empresas & Eventos" : "For Companies & Events"}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            <span className="text-foreground">{isPt ? "Compras em " : "Bulk "}</span>
            <span className="text-pocketcv-purple">{isPt ? "Volume" : "Orders"}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            {isPt
              ? "Ideal para organizadores de eventos, conferências e empresas. Quanto maior o volume, maior o desconto."
              : "Perfect for event organizers, conferences, and companies. The higher the volume, the bigger the discount."}
          </p>
        </div>

        {/* Discount Tiers - Sticky visual */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-pocketcv-coral" />
            <span className="text-sm font-medium text-muted-foreground">
              {isPt ? "Descontos garantidos em todos os pedidos" : "Guaranteed discounts on all orders"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            {VOLUME_TIERS.map((tier, index) => {
              const isActive = totalItems >= tier.min && (index === 2 || totalItems <= tier.max);
              const isUnlocked = totalItems >= tier.min;
              
              return (
                <Card 
                  key={tier.label} 
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isActive
                      ? "border-pocketcv-purple border-2 shadow-lg shadow-pocketcv-purple/20 scale-105"
                      : isUnlocked 
                        ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                        : "opacity-50 border-dashed"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-pocketcv-purple/5 to-pocketcv-coral/5" />
                  )}
                  <CardContent className="relative pt-4 pb-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Percent className="w-4 h-4 text-pocketcv-coral" />
                      <span className={`text-2xl font-bold ${isActive ? 'text-pocketcv-purple' : 'text-muted-foreground'}`}>
                        {Math.round(tier.discount * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {tier.label} {isPt ? "unidades" : "units"}
                    </p>
                    {isActive && (
                      <Badge className="mt-2 bg-pocketcv-purple/10 text-pocketcv-purple border-0 text-xs">
                        {isPt ? "Ativo" : "Active"}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-4 mb-8">
          {PRODUCTS.map(product => {
            const qty = quantities[product.id];
            const unitPrice = calculatePrice(product.basePrice, currentTier.discount);
            const hasQuantity = qty > 0;
            
            return (
              <Card 
                key={product.id} 
                className={`overflow-hidden transition-all duration-200 ${
                  hasQuantity ? 'border-pocketcv-purple/30 bg-gradient-to-r from-pocketcv-purple/5 to-transparent' : ''
                }`}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Product Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={isPt ? product.name.pt : product.name.en}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base md:text-lg truncate">
                          {isPt ? product.name.pt : product.name.en}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground line-through">
                            €{product.basePrice.toFixed(2)}
                          </span>
                          <span className="text-base font-bold text-pocketcv-purple">
                            €{unitPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">/ {isPt ? "un" : "ea"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col gap-3">
                      {/* Quick Add Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {product.quickAddOptions.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddQuantity(product.id, amount)}
                            disabled={qty >= product.maxQuantity}
                            className="h-9 px-3 hover:bg-pocketcv-purple hover:text-white hover:border-pocketcv-purple transition-colors"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {amount}
                          </Button>
                        ))}
                      </div>

                      {/* Current Quantity Display & Controls */}
                      {hasQuantity && (
                        <div className="flex items-center justify-between gap-3 bg-muted/50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleRemoveQuantity(product.id, product.quickAddOptions[0])}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-bold text-lg min-w-[3rem] text-center">{qty}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleAddQuantity(product.id, product.quickAddOptions[0])}
                              disabled={qty >= product.maxQuantity}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-pocketcv-purple">
                              €{(qty * unitPrice).toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleResetProduct(product.id)}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary - Fixed bottom on mobile, inline on desktop */}
        <Card className="border-2 border-pocketcv-purple/30 bg-gradient-to-br from-background via-pocketcv-purple/5 to-pocketcv-coral/5 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              {/* Summary Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pocketcv-purple/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-pocketcv-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {isPt ? "Resumo do Pedido" : "Order Summary"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{totalItems}</span> {isPt ? "itens no total" : "total items"}
                    </p>
                  </div>
                </div>

                {/* Savings indicator */}
                {totalItems > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {Math.round(currentTier.discount * 100)}% {isPt ? "desconto" : "discount"}
                    </Badge>
                    <span className="text-sm text-green-600 font-medium">
                      {isPt ? "Poupa" : "Save"} €{orderSummary.savings.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Items preview */}
                {orderSummary.items.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {orderSummary.items.map((item, i) => (
                      <span key={i}>
                        {item.quantity}x {item.name.split(' ')[0]}
                        {i < orderSummary.items.length - 1 && ' • '}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Price & Action */}
              <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
                <div className="text-right">
                  {orderSummary.originalTotal > orderSummary.total && (
                    <p className="text-sm text-muted-foreground line-through">
                      €{orderSummary.originalTotal.toFixed(2)}
                    </p>
                  )}
                  <p className="text-3xl font-bold text-pocketcv-purple">
                    €{orderSummary.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPt ? "Total estimado" : "Estimated total"}
                  </p>
                </div>
                
                <div className="flex gap-2 w-full lg:w-auto">
                  {totalItems > 0 && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={handleResetAll}
                      className="flex-1 lg:flex-none"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {isPt ? "Limpar" : "Reset"}
                    </Button>
                  )}
                  <Button 
                    size="lg" 
                    onClick={handleContactUs}
                    disabled={totalItems === 0}
                    className="flex-1 lg:flex-none bg-gradient-to-r from-pocketcv-purple to-pocketcv-coral hover:opacity-90 shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isPt ? "Pedir Agora" : "Order Now"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
