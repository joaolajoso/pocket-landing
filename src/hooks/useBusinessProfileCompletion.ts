
import { useMemo } from "react";
import { OrganizationWebsite } from "@/hooks/organization/useOrganizationWebsite";

export interface CompletionSection {
  key: string;
  label: string;
  accordionValue: string;
  completed: boolean;
  fields: { label: string; filled: boolean }[];
}

export const useBusinessProfileCompletion = (formData: Partial<OrganizationWebsite> | null) => {
  const sections = useMemo<CompletionSection[]>(() => {
    if (!formData) return [];

    const hasServices = Array.isArray(formData.services) && (formData.services as any[]).length > 0;
    const hasProducts = Array.isArray(formData.products) && (formData.products as any[]).length > 0;
    const isProducts = formData.business_type === 'products';

    return [
      {
        key: 'type',
        label: 'Tipo de Negócio',
        accordionValue: 'type',
        fields: [
          { label: 'Tipo selecionado', filled: !!formData.business_type },
        ],
        completed: !!formData.business_type,
      },
      {
        key: 'info',
        label: 'Informações',
        accordionValue: 'info',
        fields: [
          { label: 'Nome da empresa', filled: !!formData.company_name },
          { label: 'Descrição', filled: !!formData.description },
          { label: 'Slogan', filled: !!formData.slogan },
          { label: 'Logo', filled: !!formData.logo_url },
          { label: 'Banner', filled: !!formData.banner_image_url },
        ],
        completed: !!formData.company_name && !!formData.description && !!formData.logo_url,
      },
      {
        key: 'location',
        label: 'Localização',
        accordionValue: 'location',
        fields: [
          { label: 'Localização', filled: !!formData.location },
          { label: 'Horários', filled: !!formData.business_hours && Object.keys(formData.business_hours as object).length > 0 },
        ],
        completed: !!formData.location,
      },
      {
        key: 'catalog',
        label: isProducts ? 'Produtos' : 'Serviços',
        accordionValue: 'catalog',
        fields: [
          { label: isProducts ? 'Produtos adicionados' : 'Serviços adicionados', filled: isProducts ? hasProducts : hasServices },
        ],
        completed: isProducts ? hasProducts : hasServices,
      },
      {
        key: 'contact',
        label: 'Contactos',
        accordionValue: 'contact',
        fields: [
          { label: 'Email', filled: !!formData.email },
          { label: 'Telefone', filled: !!formData.phone },
        ],
        completed: !!formData.email || !!formData.phone,
      },
      {
        key: 'social',
        label: 'Redes Sociais',
        accordionValue: 'social',
        fields: [
          { label: 'Instagram', filled: !!formData.instagram },
          { label: 'Facebook', filled: !!formData.facebook },
          { label: 'Website', filled: !!formData.website_url },
        ],
        completed: !!formData.instagram || !!formData.facebook || !!formData.website_url,
      },
    ];
  }, [formData]);

  const completedCount = sections.filter(s => s.completed).length;
  const totalCount = sections.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = percentage === 100;

  return { sections, completedCount, totalCount, percentage, isComplete };
};
