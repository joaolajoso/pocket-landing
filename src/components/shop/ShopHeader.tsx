import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

export const ShopHeader = () => {
  const { totalItems, totalPrice, setIsCartOpen, items } = useCart();
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left side - Logo and back */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">{isPt ? "Voltar" : "Back"}</span>
            </Link>
          </Button>
          <div className="w-px h-6 bg-border hidden sm:block" />
          <Link to="/shop" className="flex items-center gap-2.5">
            <span className="text-xl font-bold bg-gradient-to-r from-pocketcv-purple to-purple-600 bg-clip-text text-transparent">
              PocketCV
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900 text-white">
              {isPt ? "Loja" : "Shop"}
            </span>
          </Link>
        </div>

        {/* Right side - Cart summary */}
        <div className="flex items-center gap-3">
          {/* Cart items preview - desktop only */}
          {items.length > 0 && (
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground">
                  {totalItems} {totalItems === 1 ? (isPt ? "item" : "item") : (isPt ? "itens" : "items")}
                </span>
                <span className="font-bold text-pocketcv-purple">
                  €{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Cart button */}
          <Button
            onClick={() => setIsCartOpen(true)}
            className="relative gap-2 bg-pocketcv-purple hover:bg-pocketcv-purple/90"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">{isPt ? "Carrinho" : "Cart"}</span>
            {totalItems > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-pocketcv-coral text-white text-xs font-bold"
              >
                {totalItems}
              </Badge>
            )}
            {/* Mobile total */}
            {totalItems > 0 && (
              <span className="sm:hidden text-xs ml-1">
                €{totalPrice.toFixed(2)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
