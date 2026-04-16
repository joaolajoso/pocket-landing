import { ClassicLinkedInTemplate } from './ClassicLinkedInTemplate';
import { MinimalistTemplate } from './MinimalistTemplate';
import { SocialMediaFocusTemplate } from './SocialMediaFocusTemplate';
import { ModernCorporateTemplate } from './ModernCorporateTemplate';
import { TechStartupTemplate } from './TechStartupTemplate';
import { CreativeAgencyTemplate } from './CreativeAgencyTemplate';
import { ProfessionalServicesTemplate } from './ProfessionalServicesTemplate';
import { EcommerceFocusTemplate } from './EcommerceFocusTemplate';
import { PortfolioStyleTemplate } from './PortfolioStyleTemplate';
import { MagazineLayoutTemplate } from './MagazineLayoutTemplate';

export const TEMPLATE_REGISTRY = {
  'classic-linkedin': ClassicLinkedInTemplate,
  'minimalist': MinimalistTemplate,
  'social-media-focus': SocialMediaFocusTemplate,
  'modern-corporate': ModernCorporateTemplate,
  'tech-startup': TechStartupTemplate,
  'creative-agency': CreativeAgencyTemplate,
  'professional-services': ProfessionalServicesTemplate,
  'ecommerce-focus': EcommerceFocusTemplate,
  'portfolio-style': PortfolioStyleTemplate,
  'magazine-layout': MagazineLayoutTemplate,
} as const;

export type TemplateId = keyof typeof TEMPLATE_REGISTRY;

export const getTemplate = (templateId: string) => {
  return TEMPLATE_REGISTRY[templateId as TemplateId] || ClassicLinkedInTemplate;
};
