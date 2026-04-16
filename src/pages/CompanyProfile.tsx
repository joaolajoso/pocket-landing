import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { OrganizationWebsite, Service, Product, BusinessHour } from "@/types/organizationWebsite";
import { Helmet } from "react-helmet";
import BusinessPublicPage from "./BusinessPublicPage";

// Helper to transform database data to typed OrganizationWebsite
const transformWebsiteData = (data: any): OrganizationWebsite => {
  return {
    ...data,
    services: (data.services as Service[]) || [],
    products: (data.products as Product[]) || [],
    business_hours: (data.business_hours as BusinessHour[]) || [],
    amenities: (data.amenities as string[]) || [],
    business_type: data.business_type || 'services',
    price_range: data.price_range || null,
    phone: data.phone || null,
    email: data.email || null,
    whatsapp: data.whatsapp || null,
    instagram: data.instagram || null,
    facebook: data.facebook || null,
    region: data.region || null,
  };
};

const CompanyProfile = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [website, setWebsite] = useState<OrganizationWebsite | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ownerFile, setOwnerFile] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    const fetchWebsite = async () => {
      if (!subdomain) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('organization_websites')
          .select('*')
          .eq('subdomain', subdomain)
          .eq('is_published', true)
          .maybeSingle();

        if (error || !data) {
          setNotFound(true);
        } else {
          setWebsite(transformWebsiteData(data));

          // Fetch org owner's profile file
          const { data: ownerMember } = await supabase
            .from('organization_members')
            .select('user_id')
            .eq('organization_id', data.organization_id)
            .eq('role', 'owner')
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

          if (ownerMember?.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('profile_file_url, profile_file_name')
              .eq('id', ownerMember.user_id)
              .single();

            if (profileData?.profile_file_url && profileData?.profile_file_name) {
              setOwnerFile({ url: profileData.profile_file_url, name: profileData.profile_file_name });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching website:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar página...</p>
        </div>
      </div>
    );
  }

  if (notFound || !website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Página não encontrada</h2>
          <p className="text-gray-600 mb-6">
            A página empresarial que procura não existe ou não está publicada.
          </p>
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar à Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{website.meta_title || `${website.company_name} - PocketCV Business`}</title>
        <meta 
          name="description" 
          content={website.meta_description || website.description || `Página empresarial de ${website.company_name}`} 
        />
        <meta property="og:title" content={website.meta_title || website.company_name} />
        <meta property="og:description" content={website.meta_description || website.description || ''} />
        {website.logo_url && <meta property="og:image" content={website.logo_url} />}
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Use new BusinessPublicPage with premium design */}
      <BusinessPublicPage website={website} ownerFile={ownerFile} />
    </>
  );
};

export default CompanyProfile;
