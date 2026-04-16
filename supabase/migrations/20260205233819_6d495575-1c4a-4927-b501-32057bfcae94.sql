-- Create table for shop orders
CREATE TABLE public.shop_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_company TEXT,
  
  -- Shipping address
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  
  -- Order details
  items JSONB NOT NULL, -- Array of {productId, name, variant, quantity, price, image}
  total_items INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  
  -- Order status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_shop_orders_status ON public.shop_orders(status);
CREATE INDEX idx_shop_orders_created_at ON public.shop_orders(created_at DESC);
CREATE INDEX idx_shop_orders_customer_email ON public.shop_orders(customer_email);

-- Enable Row Level Security
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert orders (public checkout)
CREATE POLICY "Anyone can create orders" 
ON public.shop_orders 
FOR INSERT 
WITH CHECK (true);

-- Policy: Only admins can view all orders
CREATE POLICY "Admins can view all orders" 
ON public.shop_orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Policy: Only admins can update orders
CREATE POLICY "Admins can update orders" 
ON public.shop_orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shop_orders_updated_at
BEFORE UPDATE ON public.shop_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'PCV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate order number
CREATE TRIGGER set_order_number
BEFORE INSERT ON public.shop_orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
EXECUTE FUNCTION public.generate_order_number();