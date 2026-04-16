import { ShoppingCart, ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

// Import real product images
import nfcCardStandard from '@/assets/nfc-card-standard.png';
import nfcCardCustom from '@/assets/nfc-card-custom.png';

interface Product {
  id: string;
  name: string;
  namePT: string;
  description: string;
  descriptionPT: string;
  price: number;
  priceDisplay: string;
  priceDisplayPT: string;
  image: string;
  badge: string;
  badgePT: string;
  link: string;
  isBestSeller?: boolean;
}

const products: Product[] = [
  {
    id: 'nfc-card-standard',
    name: 'Standard NFC Card',
    namePT: 'Cartão NFC Padrão',
    description: 'Premium NFC card with PocketCV branding and cutting-edge technology',
    descriptionPT: 'Cartão NFC premium com branding PocketCV e tecnologia de ponta',
    price: 12,
    priceDisplay: 'From €12',
    priceDisplayPT: 'A partir de €12',
    image: nfcCardStandard,
    badge: 'Most Popular',
    badgePT: 'Mais Popular',
    link: '/shop/nfc-card-standard',
    isBestSeller: true,
  },
  {
    id: 'nfc-card-custom',
    name: 'Custom NFC Card',
    namePT: 'Cartão NFC Personalizado',
    description: 'High-quality NFC card with your custom design',
    descriptionPT: 'Cartão NFC de alta qualidade com seu design personalizado',
    price: 30,
    priceDisplay: 'From €30',
    priceDisplayPT: 'A partir de €30',
    image: nfcCardCustom,
    badge: 'Customizable',
    badgePT: 'Personalizável',
    link: '/shop/nfc-card-custom',
  },
];

const ShopTab = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { items } = useCart();
  const isPt = language === 'pt';

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleProductClick = (product: Product) => {
    navigate(product.link);
  };

  const handleCartClick = () => {
    navigate('/shop');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {isPt ? 'Loja' : 'Shop'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPt 
              ? 'Cartões NFC e acessórios para networking profissional' 
              : 'NFC cards and accessories for professional networking'}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="gap-2 self-start sm:self-auto"
          onClick={handleCartClick}
        >
          <ShoppingCart className="h-4 w-4" />
          {isPt ? 'Carrinho' : 'Cart'}
          {cartCount > 0 && (
            <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
              {cartCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <Card 
            key={product.id}
            className="group relative overflow-hidden border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            {/* Badge */}
            <Badge 
              className={`absolute top-3 right-3 z-10 font-semibold ${
                product.isBestSeller 
                  ? 'bg-orange-500 hover:bg-orange-500 text-white' 
                  : 'bg-primary/90 hover:bg-primary text-primary-foreground'
              }`}
            >
              {isPt ? product.badgePT : product.badge}
            </Badge>

            {/* Product Image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted/30 relative overflow-hidden p-4">
              <img 
                src={product.image} 
                alt={isPt ? product.namePT : product.name}
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Button size="sm" className="gap-2 shadow-lg">
                  <ExternalLink className="h-4 w-4" />
                  {isPt ? 'Ver Produto' : 'View Product'}
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {isPt ? product.namePT : product.name}
              </h3>
              
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {isPt ? product.descriptionPT : product.description}
              </p>
              
              <div className="mt-3">
                <span className="text-lg font-bold text-foreground">
                  {isPt ? product.priceDisplayPT : product.priceDisplay}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">
                {isPt ? 'Precisa de ajuda a escolher?' : 'Need help choosing?'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isPt 
                  ? 'Entre em contacto connosco para recomendações personalizadas ou encomendas empresariais.'
                  : 'Contact us for personalized recommendations or enterprise orders.'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="shrink-0"
            onClick={() => navigate('/shop')}
          >
            {isPt ? 'Ver Loja Completa' : 'View Full Shop'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ShopTab;
