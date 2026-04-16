import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BusinessEmployeeCard } from '@/components/business-public/BusinessEmployeeCard';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

interface EmployeePageData {
  employeeName: string;
  employeePhoto?: string;
  employeeSlug?: string;
  companyName: string;
  companyLogo?: string;
  bannerUrl?: string;
  primaryColor?: string;
  subdomain: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWhatsapp?: string;
  showPhone?: boolean;
  showEmail?: boolean;
  showWhatsapp?: boolean;
}

const BusinessEmployeeProfile = () => {
  const { subdomain, memberSlug } = useParams<{ subdomain: string; memberSlug: string }>();
  const [data, setData] = useState<EmployeePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!subdomain || !memberSlug) return;

      try {
        setLoading(true);

        // 1. Fetch the organization website by subdomain
        const { data: website, error: webError } = await supabase
          .from('organization_websites')
          .select('*, organization_id')
          .eq('subdomain', subdomain)
          .maybeSingle();

        if (webError || !website) {
          setError('Empresa não encontrada');
          return;
        }

        // 2. Find the profile by slug
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, photo_url, slug, headline')
          .eq('slug', memberSlug)
          .maybeSingle();

        if (profileError || !profile) {
          setError('Colaborador não encontrado');
          return;
        }

        // 3. Verify this person is a member of the organization
        const { data: member, error: memberError } = await supabase
          .from('organization_members')
          .select('position, role, status')
          .eq('organization_id', website.organization_id)
          .eq('user_id', profile.id)
          .eq('status', 'active')
          .maybeSingle();

        if (memberError || !member) {
          setError('Este colaborador não pertence a esta empresa');
          return;
        }

        setData({
          employeeName: profile.name || 'Colaborador',
          employeePhoto: profile.photo_url || undefined,
          employeeSlug: profile.slug || undefined,
          companyName: website.company_name,
          companyLogo: website.logo_url || undefined,
          bannerUrl: website.banner_image_url || undefined,
          primaryColor: website.primary_color || undefined,
          subdomain: website.subdomain,
          companyPhone: website.phone || undefined,
          companyEmail: website.email || undefined,
          companyWhatsapp: website.whatsapp || undefined,
          showPhone: website.show_phone ?? true,
          showEmail: website.show_email ?? true,
          showWhatsapp: website.show_whatsapp ?? true,
        });
      } catch (err) {
        console.error('Error fetching employee profile:', err);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subdomain, memberSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4 px-4">
        <p className="text-gray-500 text-center">{error || 'Perfil não encontrado'}</p>
        <Link to="/" className="text-sm text-primary hover:underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  const whatsappUrl = data.showWhatsapp && data.companyWhatsapp
    ? `https://wa.me/${data.companyWhatsapp.replace(/\D/g, '')}`
    : undefined;

  return (
    <>
      <Helmet>
        <title>{data.employeeName} · {data.companyName}</title>
        <meta name="description" content={`${data.employeeName} - ${data.companyName}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-8 pb-16 px-4">
        <div className="w-full max-w-sm">
          <BusinessEmployeeCard
            employeeName={data.employeeName}
            employeePhoto={data.employeePhoto}
            employeePhone={data.showPhone ? data.companyPhone : undefined}
            employeeEmail={data.showEmail ? data.companyEmail : undefined}
            companyName={data.companyName}
            companyLogo={data.companyLogo}
            bannerUrl={data.bannerUrl}
            primaryColor={data.primaryColor}
            ctaLabel="Ver como podemos ajudar"
            ctaUrl={whatsappUrl || `/c/${data.subdomain}`}
            slug={data.employeeSlug}
          />

          {/* Powered by footer */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
            >
              Powered by <span className="font-medium">Pocket CV</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BusinessEmployeeProfile;
