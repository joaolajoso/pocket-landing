import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Download, Home } from "lucide-react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";
import { LightModeWrapper } from "@/components/LightModeWrapper";

const OrderConfirmation = () => {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("last-order");
    if (savedOrder) {
      try {
        setOrderData(JSON.parse(savedOrder));
      } catch (error) {
        console.error("Error loading order data:", error);
      }
    }
  }, []);

  if (!orderData) {
    return (
      <LightModeWrapper>
        <div className="flex flex-col min-h-screen">
          <ShopHeader />
          <main className="flex-1 py-12 px-4">
            <div className="container mx-auto max-w-2xl text-center">
              <h1 className="text-2xl font-bold mb-4">
                {isPt ? "Pedido não encontrado" : "Order not found"}
              </h1>
              <Button asChild>
                <Link to="/shop">
                  <Home className="mr-2 h-4 w-4" />
                  {isPt ? "Voltar à Loja" : "Back to Shop"}
                </Link>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </LightModeWrapper>
    );
  }

  const orderNumber = `PCW-${Date.now().toString().slice(-8)}`;

  return (
    <LightModeWrapper>
      <div className="flex flex-col min-h-screen">
        <ShopHeader />
        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {isPt ? "Pedido Recebido!" : "Order Received!"}
              </h1>
              <p className="text-muted-foreground">
                {isPt
                  ? "Obrigado pelo seu pedido. Entraremos em contato em breve."
                  : "Thank you for your order. We'll contact you soon."}
              </p>
            </div>

            {/* Order Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{isPt ? "Detalhes do Pedido" : "Order Details"}</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {orderNumber}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div>
                  <h3 className="font-medium mb-2">
                    {isPt ? "Informações do Cliente" : "Customer Information"}
                  </h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>{orderData.customerInfo.fullName}</p>
                    <p>{orderData.customerInfo.email}</p>
                    <p>{orderData.customerInfo.phone}</p>
                    {orderData.customerInfo.company && (
                      <p>{orderData.customerInfo.company}</p>
                    )}
                  </div>
                </div>

                {orderData.customerInfo.address && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">
                        {isPt ? "Endereço de Entrega" : "Shipping Address"}
                      </h3>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p>{orderData.customerInfo.address}</p>
                        <p>
                          {orderData.customerInfo.city && orderData.customerInfo.city + ", "}
                          {orderData.customerInfo.postalCode}
                        </p>
                        {orderData.customerInfo.country && (
                          <p>{orderData.customerInfo.country}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Order Items */}
                <div>
                  <h3 className="font-medium mb-3">
                    {isPt ? "Itens do Pedido" : "Order Items"}
                  </h3>
                  <div className="space-y-3">
                    {orderData.items.map((item: any) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.name}</p>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground">{item.variant}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × €{item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium text-sm">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{isPt ? "Total" : "Total"}</span>
                  <span className="text-pocketcv-purple">
                    €{orderData.totalPrice.toFixed(2)}
                  </span>
                </div>

                {orderData.customerInfo.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">
                        {isPt ? "Notas" : "Notes"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {orderData.customerInfo.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {isPt ? "Próximos Passos" : "Next Steps"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pocketcv-purple text-white flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p>
                    {isPt
                      ? "Você receberá um email de confirmação com os detalhes do seu pedido"
                      : "You'll receive a confirmation email with your order details"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pocketcv-purple text-white flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p>
                    {isPt
                      ? "Nossa equipe entrará em contato para confirmar o pedido e método de pagamento"
                      : "Our team will contact you to confirm the order and payment method"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pocketcv-purple text-white flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <p>
                    {isPt
                      ? "Após a confirmação do pagamento, seu pedido será processado e enviado"
                      : "After payment confirmation, your order will be processed and shipped"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  {isPt ? "Ir para Início" : "Go to Home"}
                </Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link to="/shop">
                  {isPt ? "Continuar Comprando" : "Continue Shopping"}
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </LightModeWrapper>
  );
};

export default OrderConfirmation;
