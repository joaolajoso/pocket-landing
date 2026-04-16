-- =====================================================
-- FASE 1: Sistema de Páginas Empresariais Públicas
-- Tabelas, RLS e Estrutura Base
-- =====================================================

-- =====================================================
-- 1. TABELA: organization_websites
-- Armazena os dados principais do website da empresa
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organization_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Domínio e Status
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  is_published BOOLEAN NOT NULL DEFAULT false,
  
  -- Template e Design
  template_id TEXT NOT NULL DEFAULT 'classic-linkedin',
  
  -- Campos Editáveis Básicos
  company_name TEXT NOT NULL,
  logo_url TEXT,
  slogan TEXT,
  location TEXT,
  follower_count INTEGER DEFAULT 0,
  description TEXT,
  industry TEXT,
  website_url TEXT,
  
  -- Visual e Branding
  banner_image_url TEXT,
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#ffffff',
  font_family TEXT DEFAULT 'Inter, sans-serif',
  
  -- Configurações de Seções Visíveis
  show_team BOOLEAN DEFAULT true,
  show_services BOOLEAN DEFAULT true,
  show_testimonials BOOLEAN DEFAULT true,
  show_gallery BOOLEAN DEFAULT true,
  show_contact_form BOOLEAN DEFAULT true,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT organization_websites_unique_org UNIQUE(organization_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_organization_websites_subdomain ON public.organization_websites(subdomain);
CREATE INDEX IF NOT EXISTS idx_organization_websites_org_id ON public.organization_websites(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_websites_published ON public.organization_websites(is_published);

-- =====================================================
-- 2. TABELA: organization_website_sections
-- Seções dinâmicas e blocos de conteúdo editáveis
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organization_website_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.organization_websites(id) ON DELETE CASCADE,
  
  -- Tipo e Conteúdo
  section_type TEXT NOT NULL CHECK (section_type IN (
    'hero',
    'about', 
    'team',
    'services',
    'testimonials',
    'gallery',
    'contact',
    'stats',
    'custom'
  )),
  title TEXT,
  content JSONB,
  
  -- Ordenação e Visibilidade
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_website_sections_website_id ON public.organization_website_sections(website_id);
CREATE INDEX IF NOT EXISTS idx_website_sections_position ON public.organization_website_sections(website_id, position);
CREATE INDEX IF NOT EXISTS idx_website_sections_type ON public.organization_website_sections(section_type);

-- =====================================================
-- 3. TABELA: organization_team_highlights
-- Membros da organização em destaque na página pública
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organization_team_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.organization_websites(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.organization_members(id) ON DELETE CASCADE,
  
  -- Customização
  position INTEGER NOT NULL DEFAULT 0,
  custom_title TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT team_highlights_unique_member UNIQUE(website_id, member_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_team_highlights_website_id ON public.organization_team_highlights(website_id);
CREATE INDEX IF NOT EXISTS idx_team_highlights_member_id ON public.organization_team_highlights(member_id);
CREATE INDEX IF NOT EXISTS idx_team_highlights_position ON public.organization_team_highlights(website_id, position);

-- =====================================================
-- 4. FUNÇÕES E TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_organization_website_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplicar trigger em organization_websites
CREATE TRIGGER update_organization_websites_updated_at
  BEFORE UPDATE ON public.organization_websites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_organization_website_updated_at();

-- Aplicar trigger em organization_website_sections
CREATE TRIGGER update_organization_website_sections_updated_at
  BEFORE UPDATE ON public.organization_website_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_organization_website_updated_at();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.organization_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_team_highlights ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS: organization_websites
-- =====================================================

-- Qualquer pessoa pode ver websites publicados (público)
CREATE POLICY "Public can view published websites"
  ON public.organization_websites
  FOR SELECT
  USING (is_published = true);

-- Organization admins podem ver seus próprios websites
CREATE POLICY "Organization admins can view own website"
  ON public.organization_websites
  FOR SELECT
  USING (is_organization_admin(organization_id));

-- Organization admins podem criar websites
CREATE POLICY "Organization admins can create website"
  ON public.organization_websites
  FOR INSERT
  WITH CHECK (is_organization_admin(organization_id));

-- Organization admins podem atualizar seus websites
CREATE POLICY "Organization admins can update own website"
  ON public.organization_websites
  FOR UPDATE
  USING (is_organization_admin(organization_id))
  WITH CHECK (is_organization_admin(organization_id));

-- Organization admins podem deletar seus websites
CREATE POLICY "Organization admins can delete own website"
  ON public.organization_websites
  FOR DELETE
  USING (is_organization_admin(organization_id));

-- =====================================================
-- RLS: organization_website_sections
-- =====================================================

-- Qualquer pessoa pode ver seções ativas de websites publicados
CREATE POLICY "Public can view active sections of published websites"
  ON public.organization_website_sections
  FOR SELECT
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_website_sections.website_id 
      AND is_published = true
    )
  );

-- Organization admins podem ver todas as seções (ativas e inativas)
CREATE POLICY "Organization admins can view all sections"
  ON public.organization_website_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_website_sections.website_id 
      AND is_organization_admin(organization_id)
    )
  );

-- Organization admins podem criar seções
CREATE POLICY "Organization admins can create sections"
  ON public.organization_website_sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_website_sections.website_id 
      AND is_organization_admin(organization_id)
    )
  );

-- Organization admins podem atualizar seções
CREATE POLICY "Organization admins can update sections"
  ON public.organization_website_sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_website_sections.website_id 
      AND is_organization_admin(organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_website_sections.website_id 
      AND is_organization_admin(organization_id)
    )
  );

-- Organization admins podem deletar seções
CREATE POLICY "Organization admins can delete sections"
  ON public.organization_website_sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_website_sections.website_id 
      AND is_organization_admin(organization_id)
    )
  );

-- =====================================================
-- RLS: organization_team_highlights
-- =====================================================

-- Qualquer pessoa pode ver membros em destaque de websites publicados
CREATE POLICY "Public can view team highlights of published websites"
  ON public.organization_team_highlights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_team_highlights.website_id 
      AND is_published = true
    )
  );

-- Organization admins podem ver todos os destaques
CREATE POLICY "Organization admins can view team highlights"
  ON public.organization_team_highlights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_team_highlights.website_id 
      AND is_organization_admin(organization_id)
    )
  );

-- Organization admins podem criar destaques
CREATE POLICY "Organization admins can create team highlights"
  ON public.organization_team_highlights
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_team_highlights.website_id 
      AND is_organization_admin(organization_id)
    )
  );

-- Organization admins podem atualizar destaques
CREATE POLICY "Organization admins can update team highlights"
  ON public.organization_team_highlights
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_team_highlights.website_id 
      AND is_organization_admin(organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_team_highlights.website_id 
      AND is_organization_admin(organization_id)
    )
  );

-- Organization admins podem deletar destaques
CREATE POLICY "Organization admins can delete team highlights"
  ON public.organization_team_highlights
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_websites 
      WHERE id = organization_team_highlights.website_id 
      AND is_organization_admin(organization_id)
    )
  );

-- =====================================================
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.organization_websites IS 'Armazena os dados dos websites públicos das organizações';
COMMENT ON TABLE public.organization_website_sections IS 'Seções dinâmicas e blocos de conteúdo editáveis dos websites';
COMMENT ON TABLE public.organization_team_highlights IS 'Membros da organização em destaque na página pública';

COMMENT ON COLUMN public.organization_websites.subdomain IS 'Subdomínio único (ex: pocketcv para pocketcv.pocketcv.pt)';
COMMENT ON COLUMN public.organization_websites.is_published IS 'Se false, o website não é visível publicamente';
COMMENT ON COLUMN public.organization_websites.template_id IS 'ID do template selecionado (ex: classic-linkedin, minimalist, etc)';
COMMENT ON COLUMN public.organization_website_sections.content IS 'Conteúdo dinâmico da seção em formato JSON';
COMMENT ON COLUMN public.organization_website_sections.section_type IS 'Tipo da seção: hero, about, team, services, testimonials, gallery, contact, stats, custom';