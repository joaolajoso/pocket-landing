import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { OrganizationWebsite } from '@/types/organizationWebsite';
import { TemplatePreview } from './TemplatePreview';

interface Template {
  id: string;
  name: string;
  description: string;
  features: string[];
  previewImage?: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'classic-linkedin',
    name: 'Classic LinkedIn',
    description: 'Template profissional inspirado no LinkedIn',
    features: ['Banner de capa', 'Logo destacado', 'Informações corporativas', 'Layout profissional']
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    description: 'Design limpo e focado no essencial',
    features: ['Tipografia grande', 'Espaçamento amplo', 'Sem distrações', 'Mobile-first']
  },
  {
    id: 'social-media-focus',
    name: 'Social Media',
    description: 'Vibrante e focado em redes sociais',
    features: ['Gradientes coloridos', 'Contador de seguidores', 'Botões sociais grandes', 'Visual moderno']
  },
  {
    id: 'modern-corporate',
    name: 'Modern Corporate',
    description: 'Corporativo moderno e profissional',
    features: ['Design elegante', 'Seções estruturadas', 'Call-to-actions', 'Visão empresarial']
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Inovador e tecnológico',
    features: ['Gradientes modernos', 'Animações subtis', 'Foco em produto', 'Visual tech']
  },
  {
    id: 'creative-agency',
    name: 'Creative Agency',
    description: 'Criativo e visual',
    features: ['Portfolio destacado', 'Grid de projetos', 'Visual criativo', 'Storytelling']
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    description: 'Serviços profissionais e confiança',
    features: ['Credibilidade', 'Serviços detalhados', 'Testemunhos', 'Formulário de contato']
  },
  {
    id: 'ecommerce-focus',
    name: 'E-commerce Focus',
    description: 'Focado em produtos e vendas',
    features: ['Grid de produtos', 'CTAs de compra', 'Destaque visual', 'Conversão otimizada']
  },
  {
    id: 'portfolio-style',
    name: 'Portfolio Style',
    description: 'Estilo portfolio para showcasing',
    features: ['Galeria visual', 'Projetos destacados', 'Design minimalista', 'Foco em trabalhos']
  },
  {
    id: 'magazine-layout',
    name: 'Magazine Layout',
    description: 'Layout editorial estilo revista',
    features: ['Grid editorial', 'Artigo destacado', 'Tipografia clara', 'Conteúdo organizado']
  }
];

interface TemplateSelectorProps {
  currentTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  websiteData: OrganizationWebsite;
}

export const TemplateSelector = ({ currentTemplateId, onSelectTemplate, websiteData }: TemplateSelectorProps) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const previewTemplateId = hoveredTemplate || currentTemplateId;

  return (
    <div className="grid grid-cols-[320px_1fr] gap-6 h-[700px]">
      {/* Template List */}
      <div className="overflow-y-auto pr-2 space-y-3">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Templates Disponíveis
          </h3>
        </div>
        
        {TEMPLATES.map((template) => {
          const isActive = currentTemplateId === template.id;
          const isHovered = hoveredTemplate === template.id;
          
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-primary shadow-md' : 
                isHovered ? 'shadow-md border-primary/50' : 'hover:border-primary/30'
              }`}
              onClick={() => onSelectTemplate(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  {isActive && (
                    <Badge variant="default" className="ml-2 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {template.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Area */}
      <div className="border rounded-lg bg-muted/30 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-3 bg-background border-b">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Preview: <span className="text-primary">{TEMPLATES.find(t => t.id === previewTemplateId)?.name}</span>
              </p>
              {hoveredTemplate && (
                <p className="text-xs text-muted-foreground">
                  Clique para aplicar
                </p>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <TemplatePreview 
              templateId={previewTemplateId} 
              website={websiteData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
