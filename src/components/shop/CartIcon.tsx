import React from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export const CartIcon = () => {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <Button
      variant="default"
      size="icon"
      className="relative bg-pocketcv-purple hover:bg-pocketcv-purple/90"
      onClick={() => setIsCartOpen(true)}
    >
      <ShoppingCart className="h-5 w-5 text-white" />
      {totalItems > 0 && (
        <span
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-pocketcv-coral text-white text-xs font-bold"
        >
          {totalItems}
        </span>
      )}
    </Button>
  );
};
