import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Globe, 
  ExternalLink, 
  Eye, 
  Send, 
  Plus,
  Save,
  Building2,
  MapPin,
  Phone,
  Share2,
  Package,
  Briefcase,
  Palette,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrganizationWebsite, type OrganizationWebsite } from "@/hooks/organization/useOrganizationWebsite";
import { useOrganizationImages } from "@/hooks/organization/useOrganizationImages";
import { BusinessTypeSelector } from "./BusinessTypeSelector";
import { BusinessInfoSection } from "./BusinessInfoSection";
import { BusinessLocationSection } from "./BusinessLocationSection";
import { BusinessContactSection } from "./BusinessContactSection";
import { BusinessSocialSection } from "./BusinessSocialSection";
import { ProductsCatalog } from "./ProductsCatalog";
import { ServicesManager } from "./ServicesManager";
import { BusinessPagePreview } from "./BusinessPagePreview";
import { BusinessColorSelector } from "@/components/business-public/BusinessColorSelector";
import { useBusinessProfileCompletion } from "@/hooks/useBusinessProfileCompletion";

interface PublicPageTabProps {
  organizationId: string;
  organizationName: string;
}

const STEPS = [
  { key: "type", label: "Tipo", icon: Building2, accordionValue: "type" },
  { key: "info", label: "Informações", icon: Building2, accordionValue: "info" },
  { key: "location", label: "Localização", icon: MapPin, accordionValue: "location" },
  { key: "catalog", label: "Serviços", icon: Briefcase, accordionValue: "catalog" },
  { key: "contact", label: "Contactos", icon: Phone, accordionValue: "contact" },
  { key: "social", label: "Redes Sociais", icon: Share2, accordionValue: "social" },
  { key: "design", label: "Design", icon: Palette, accordionValue: "design" },
];

export const PublicPageTab = ({ organizationId, organizationName }: PublicPageTabProps) => {
  const { website, loading, createWebsite, updateWebsite, publishWebsite, unpublishWebsite, refetch } = useOrganizationWebsite(organizationId);
  const { uploadLogo, uploadBanner, uploading } = useOrganizationImages();
  const [formData, setFormData] = useState<Partial<OrganizationWebsite>>({
    subdomain: '',
    company_name: organizationName,
    business_type: 'services',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const { sections, percentage, completedCount, totalCount } = useBusinessProfileCompletion(website ? formData : null);

  useEffect(() => {
    if (website) {
      setFormData({ ...website });
      setHasChanges(false);
    }
  }, [website]);

  const handleChange = (updates: Partial<OrganizationWebsite>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleCreate = async () => {
    if (!formData.subdomain || !formData.company_name) return;
    setIsSaving(true);
    const result = await createWebsite({
      subdomain: formData.subdomain,
      company_name: formData.company_name,
      business_type: formData.business_type || 'services',
      slogan: formData.slogan || null,
      location: formData.location || null,
      description: formData.description || null,
      industry: formData.industry || null,
      template_id: 'business-modern',
    });
    setIsSaving(false);
    if (result.success) setHasChanges(false);
  };

  const handleSave = async () => {
    if (!website?.id) return;
    setIsSaving(true);
    const result = await updateWebsite(website.id, formData);
    setIsSaving(false);
    if (result.success) {
      setHasChanges(false);
      refetch();
    }
  };

  const handlePublishToggle = async () => {
    if (!website) return;
    if (website.is_published) {
      await unpublishWebsite(website.id);
    } else {
      await publishWebsite(website.id);
    }
    refetch();
  };

  const handleLogoUpload = async (file: File) => {
    if (!website?.id) return;
    const url = await uploadLogo(file, website.id);
    if (url) { handleChange({ logo_url: url }); refetch(); }
  };

  const handleBannerUpload = async (file: File) => {
    if (!website?.id) return;
    const url = await uploadBanner(file, website.id);
    if (url) { handleChange({ banner_image_url: url }); refetch(); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // Creation View
  if (!website) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Criar Página Pública</h2>
          <p className="text-sm text-white/40 mt-1">Configure a página empresarial da sua organização</p>
        </div>
        <div className="text-left space-y-6">
          <BusinessTypeSelector
            value={formData.business_type || 'services'}
            onChange={(type) => handleChange({ business_type: type })}
          />
          <BusinessInfoSection
            formData={formData}
            onChange={handleChange}
            showPriceRange={formData.business_type === 'products'}
            isCreating={true}
          />
        </div>
        <Button 
          onClick={handleCreate} 
          size="lg" 
          className="w-full"
          disabled={!formData.subdomain || !formData.company_name || isSaving}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isSaving ? 'A criar...' : 'Criar Página Pública'}
        </Button>
      </div>
    );
  }

  const publicUrl = `https://pocketcv.pt/c/${website.subdomain}`;
  const currentStep = STEPS[activeStep];

  // Check step completion from sections data
  const isStepCompleted = (stepKey: string) => {
    if (stepKey === "design") return !!formData.primary_color;
    const section = sections.find(s => s.key === stepKey);
    return section?.completed || false;
  };

  const renderStepContent = () => {
    switch (currentStep.key) {
      case "type":
        return (
          <BusinessTypeSelector
            value={formData.business_type || 'services'}
            onChange={(type) => handleChange({ business_type: type })}
          />
        );
      case "info":
        return (
          <BusinessInfoSection
            formData={formData}
            onChange={handleChange}
            onLogoUpload={handleLogoUpload}
            onBannerUpload={handleBannerUpload}
            showPriceRange={formData.business_type === 'products'}
          />
        );
      case "location":
        return (
          <BusinessLocationSection formData={formData} onChange={handleChange} />
        );
      case "catalog":
        return formData.business_type === 'products' ? (
          <ProductsCatalog
            products={formData.products || []}
            onProductsChange={(products) => handleChange({ products })}
            websiteId={website.id}
          />
        ) : (
          <ServicesManager
            services={formData.services || []}
            onServicesChange={(services) => handleChange({ services })}
            websiteId={website.id}
          />
        );
      case "contact":
        return (
          <BusinessContactSection formData={formData} onChange={handleChange} />
        );
      case "social":
        return (
          <BusinessSocialSection formData={formData} onChange={handleChange} />
        );
      case "design":
        return (
          <BusinessColorSelector
            value={formData.primary_color || '#0ea5e9'}
            onChange={(color) => handleChange({ primary_color: color })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Status Header - Glassmorphism */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {formData.logo_url ? (
              <img src={formData.logo_url} alt="" className="w-11 h-11 rounded-xl object-cover border border-white/10" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
                <Globe className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-white text-sm truncate">{website.company_name}</h2>
                <Badge variant={website.is_published ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                  {website.is_published ? "Online" : "Rascunho"}
                </Badge>
              </div>
              <a 
                href={publicUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition-colors"
              >
                pocketcv.pt/c/{website.subdomain}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs border-white/10 bg-white/5" asChild>
              <a href={`/c/${website.subdomain}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Ver
              </a>
            </Button>
            <Button 
              variant={website.is_published ? "secondary" : "default"}
              size="sm"
              className="h-8 text-xs"
              onClick={handlePublishToggle}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              {website.is_published ? "Despublicar" : "Publicar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Completion Progress */}
      {percentage < 100 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-white/70">Perfil do negócio</span>
            </div>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              percentage === 100 ? "text-emerald-400" : percentage >= 60 ? "text-amber-400" : "text-orange-400"
            )}>
              {percentage}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                percentage === 100 ? "bg-emerald-500" : percentage >= 60 ? "bg-gradient-to-r from-amber-500 to-primary" : "bg-gradient-to-r from-orange-500 to-amber-500"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-white/30 mt-1.5">
            {completedCount} de {totalCount} secções completas
          </p>
        </div>
      )}

      {/* Step Navigation - Horizontal Pill Stepper */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1" data-no-swipe>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const completed = isStepCompleted(step.key);
          const isActive = i === activeStep;
          const dynamicLabel = step.key === "catalog" && formData.business_type === "products" ? "Produtos" : step.label;
          return (
            <button
              key={step.key}
              onClick={() => setActiveStep(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : completed
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
              )}
            >
              {completed && !isActive ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{dynamicLabel}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,360px] gap-5">
        {/* Step Content */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6">
          {/* Step Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center",
                isStepCompleted(currentStep.key)
                  ? "bg-emerald-500/15"
                  : "bg-primary/10"
              )}>
                {isStepCompleted(currentStep.key) ? (
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                ) : (
                  <currentStep.icon className="h-4.5 w-4.5 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {currentStep.key === "catalog" && formData.business_type === "products" ? "Catálogo de Produtos" : currentStep.label}
                </h3>
                <p className="text-[11px] text-white/30">
                  Passo {activeStep + 1} de {STEPS.length}
                </p>
              </div>
            </div>
            {isStepCompleted(currentStep.key) && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                Completo
              </Badge>
            )}
          </div>

          {/* Step Form */}
          <div className="animate-in fade-in slide-in-from-right-2 duration-300" key={currentStep.key}>
            {renderStepContent()}
          </div>

          {/* Step Navigation Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="text-xs text-white/40 hover:text-white/70 h-8"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Anterior
            </Button>
            
            {activeStep < STEPS.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setActiveStep(activeStep + 1)}
                className="text-xs h-8"
              >
                Seguinte
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="text-xs h-8"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
          </div>
        </div>

        {/* Live Preview - Desktop */}
        <div className="hidden xl:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
              <Eye className="h-3.5 w-3.5 text-white/30" />
              <span className="text-xs font-medium text-white/40">Pré-visualização</span>
            </div>
            <BusinessPagePreview data={formData} />
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      {hasChanges && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="shadow-2xl shadow-primary/30 rounded-xl h-10 px-5 text-sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'A guardar...' : 'Guardar Alterações'}
          </Button>
        </div>
      )}
    </div>
  );
};
