import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { CartDrawer } from "@/components/shop/CartDrawer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { LightModeWrapper } from "@/components/LightModeWrapper";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error(isPt ? "Preencha os campos obrigatórios" : "Please fill in required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save order to database
      const orderItems = items.map(item => ({
        productId: item.productId,
        name: item.name,
        variant: item.variant || null,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      }));

      const { error: dbError } = await supabase
        .from('shop_orders' as any)
        .insert({
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          customer_company: formData.company || null,
          shipping_address: formData.address || null,
          shipping_city: formData.city || null,
          shipping_postal_code: formData.postalCode || null,
          shipping_country: formData.country || null,
          items: orderItems,
          total_items: items.reduce((sum, item) => sum + item.quantity, 0),
          total_price: totalPrice,
          notes: formData.notes || null,
          status: 'pending'
        } as any);

      if (dbError) {
        console.error('Error saving order:', dbError);
        // Continue with WhatsApp even if DB fails
      }

      // Build WhatsApp message with order details
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      
      const itemsList = items.map(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        return `• ${item.name}${item.variant ? ` (${item.variant})` : ''} - ${item.quantity}x €${item.price.toFixed(2)} = €${itemTotal}`;
      }).join('\n');

      const addressParts = [
        formData.address,
        formData.city,
        formData.postalCode,
        formData.country
      ].filter(Boolean).join(', ');

      const message = `🛒 *Novo Pedido PocketCV*

👤 *Informações do Cliente:*
Nome: ${formData.fullName}
Email: ${formData.email}
Telefone: ${formData.phone}${formData.company ? `\nEmpresa: ${formData.company}` : ''}

📦 *Produtos (${totalItems} ${totalItems === 1 ? 'item' : 'itens'}):*
${itemsList}

💰 *Total: €${totalPrice.toFixed(2)}*

📍 *Endereço de Entrega:*
${addressParts || 'Não informado'}${formData.notes ? `\n\n📝 *Notas:*\n${formData.notes}` : ''}`;

      // Encode message for WhatsApp URL
      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = "351929331791"; // Portuguese number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      // Store order data in localStorage as backup
      const orderData = {
        items,
        totalPrice,
        customerInfo: formData,
        orderDate: new Date().toISOString(),
      };
      
      localStorage.setItem("last-order", JSON.stringify(orderData));
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');
      
      // Clear cart and navigate to confirmation
      clearCart();
      navigate("/shop/order-confirmation");
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error(isPt ? "Erro ao processar pedido" : "Error processing order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <LightModeWrapper>
        <div className="flex flex-col min-h-screen">
          <ShopHeader />
          <CartDrawer />
          <main className="flex-1 py-12 px-4">
            <div className="container mx-auto max-w-2xl text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">
                {isPt ? "Seu carrinho está vazio" : "Your cart is empty"}
              </h1>
              <p className="text-muted-foreground mb-6">
                {isPt
                  ? "Adicione produtos ao carrinho antes de finalizar o pedido"
                  : "Add products to your cart before checking out"}
              </p>
              <Button asChild>
                <Link to="/shop">
                  {isPt ? "Ir para Loja" : "Go to Shop"}
                </Link>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </LightModeWrapper>
    );
  }

  return (
    <LightModeWrapper>
      <div className="flex flex-col min-h-screen">
        <ShopHeader />
        <CartDrawer />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <Button variant="ghost" asChild className="mb-4">
                <Link to="/shop">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {isPt ? "Voltar à Loja" : "Back to Shop"}
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">
                {isPt ? "Finalizar Pedido" : "Checkout"}
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isPt ? "Informações de Contato" : "Contact Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">
                            {isPt ? "Nome Completo" : "Full Name"} *
                          </Label>
                          <Input
                            id="fullName"
                            required
                            value={formData.fullName}
                            onChange={(e) =>
                              setFormData({ ...formData, fullName: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            {isPt ? "Telefone" : "Phone"} *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">
                            {isPt ? "Empresa" : "Company"}
                          </Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) =>
                              setFormData({ ...formData, company: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="font-medium">
                          {isPt ? "Endereço de Entrega" : "Shipping Address"}
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="address">
                            {isPt ? "Endereço" : "Address"}
                          </Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({ ...formData, address: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">
                              {isPt ? "Cidade" : "City"}
                            </Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) =>
                                setFormData({ ...formData, city: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">
                              {isPt ? "Código Postal" : "Postal Code"}
                            </Label>
                            <Input
                              id="postalCode"
                              value={formData.postalCode}
                              onChange={(e) =>
                                setFormData({ ...formData, postalCode: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country">
                              {isPt ? "País" : "Country"}
                            </Label>
                            <Input
                              id="country"
                              value={formData.country}
                              onChange={(e) =>
                                setFormData({ ...formData, country: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">
                          {isPt ? "Notas do Pedido" : "Order Notes"}
                        </Label>
                        <Textarea
                          id="notes"
                          placeholder={
                            isPt
                              ? "Informações adicionais sobre o pedido (opcional)"
                              : "Additional order information (optional)"
                          }
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          rows={4}
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting 
                          ? (isPt ? "A processar..." : "Processing...") 
                          : (isPt ? "Enviar Pedido" : "Submit Order")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>
                      {isPt ? "Resumo do Pedido" : "Order Summary"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded bg-muted"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground">
                                {item.variant}
                              </p>
                            )}
                            <p className="text-sm">
                              {item.quantity} × €{item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium text-sm">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{isPt ? "Subtotal" : "Subtotal"}</span>
                        <span>€{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{isPt ? "Envio" : "Shipping"}</span>
                        <span>{isPt ? "A calcular" : "Calculated at next step"}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>{isPt ? "Total" : "Total"}</span>
                      <span className="text-pocketcv-purple">
                        €{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </LightModeWrapper>
  );
};

export default Checkout;
