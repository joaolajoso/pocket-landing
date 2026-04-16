import React from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { Separator } from "@/components/ui/separator";

export const CartDrawer = () => {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {isPt ? "Seu Carrinho" : "Your Cart"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {isPt ? "Seu carrinho está vazio" : "Your cart is empty"}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {isPt
                  ? "Adicione produtos para começar"
                  : "Add products to get started"}
              </p>
              <Button asChild onClick={() => setIsCartOpen(false)}>
                <Link to="/shop">
                  {isPt ? "Explorar Produtos" : "Explore Products"}
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">{item.variant}</p>
                      )}
                      <p className="text-sm font-bold text-pocketcv-purple mt-1">
                        €{item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{isPt ? "Total" : "Total"}</span>
                  <span className="text-pocketcv-purple">€{totalPrice.toFixed(2)}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  asChild
                  onClick={() => setIsCartOpen(false)}
                >
                  <Link to="/shop/checkout">
                    {isPt ? "Finalizar Pedido" : "Proceed to Checkout"}
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  asChild
                  onClick={() => setIsCartOpen(false)}
                >
                  <Link to="/shop">
                    {isPt ? "Continuar Comprando" : "Continue Shopping"}
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
