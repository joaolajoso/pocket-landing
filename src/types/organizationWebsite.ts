export interface Service {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  image_url?: string;
  url?: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  image_url?: string;
  category?: string;
  url?: string;
}

export interface BusinessHour {
  day: string;
  hours: string;
  isClosed?: boolean;
}

export interface OrganizationWebsite {
  id: string;
  organization_id: string;
  subdomain: string;
  custom_domain: string | null;
  is_published: boolean;
  template_id: string;
  company_name: string;
  logo_url: string | null;
  slogan: string | null;
  location: string | null;
  follower_count: number;
  description: string | null;
  industry: string | null;
  website_url: string | null;
  banner_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string | null;
  font_family: string;
  show_team: boolean;
  show_services: boolean;
  show_testimonials: boolean;
  show_gallery: boolean;
  show_contact_form: boolean;
  services: Service[];
  meta_title: string | null;
  meta_description: string | null;
  // New fields for business redesign
  business_type: 'products' | 'services';
  price_range: '€' | '€€' | '€€€' | '€€€€' | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  region: string | null;
  business_hours: BusinessHour[];
  products: Product[];
  amenities: string[];
  // Visibility flags for contact buttons
  show_phone?: boolean;
  show_email?: boolean;
  show_whatsapp?: boolean;
  // Payment method fields
  payment_method?: 'pix' | 'mbway' | null;
  payment_key?: string | null;
  show_payment_method?: boolean;
  created_at?: string;
  updated_at?: string;
}
