import { Helmet } from "react-helmet";
import { useLanguage } from "../contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

interface SEOStructuredDataProps {
  page?: "home" | "dashboard";
}

const SEOStructuredData: React.FC<SEOStructuredDataProps> = ({ page = "home" }) => {
  const { language } = useLanguage();
  const baseUrl = window.location.origin;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PocketCV",
    description: isPortuguese(language) ? "PocketCV | Instant Networking" : "PocketCV | Instant Networking",
    url: baseUrl,
    logo: `${baseUrl}/lovable-uploads/61fe2bfc-e1be-40f6-b5aa-9834d3b760be.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Portuguese"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "PT",
    },
    sameAs: ["https://linkedin.com/company/pocketcv", "https://instagram.com/pocketcv"],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "PocketCV NFC Card",
    description: isPortuguese(language)
      ? "Cartão de visita digital com tecnologia NFC que permite compartilhar seu perfil profissional com um simples toque"
      : "Digital business card with NFC technology that allows you to share your professional profile with a simple tap",
    brand: {
      "@type": "Brand",
      name: "PocketCV",
    },
    image: `${baseUrl}/lovable-uploads/61fe2bfc-e1be-40f6-b5aa-9834d3b760be.png`,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/login`,
    },
    category: "Digital Business Cards",
    features: [
      "NFC Technology",
      "QR Code Backup",
      "Custom Profile URL",
      "Analytics Tracking",
      "Multi-language Support",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: isPortuguese(language) ? "Como funciona o cartão NFC?" : "How does the NFC card work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isPortuguese(language)
            ? "O cartão NFC contém um pequeno chip que comunica com smartphones. Basta tocar o seu cartão em qualquer telemóvel habilitado para NFC para partilhar instantaneamente o seu perfil."
            : "The NFC card contains a small chip that communicates with smartphones. Simply tap your card on any NFC-enabled phone to instantly share your profile.",
        },
      },
      {
        "@type": "Question",
        name: isPortuguese(language) ? "Preciso de pagar uma subscrição?" : "Do I need to pay a subscription?",
        acceptedAnswer: {
          "@type": "Answer",
          text: isPortuguese(language)
            ? "Não, a PocketCV tem um modelo de pagamento único. Paga uma vez pelo seu cartão e obtém acesso vitalício ao seu perfil digital."
            : "No, PocketCV has a one-time payment model. You pay once for your card and get lifetime access to your digital profile.",
        },
      },
    ],
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PocketCV",
    description: isPortuguese(language)
      ? "Plataforma digital para criar e gerir o seu perfil profissional com cartões NFC"
      : "Digital platform to create and manage your professional profile with NFC cards",
    url: baseUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    featureList: [
      "Digital Profile Creation",
      "NFC Card Integration",
      "Link Management",
      "Analytics Dashboard",
      "Multi-language Support",
    ],
  };

  const getPageSpecificSchema = () => {
    switch (page) {
      case "home":
        return [organizationSchema, productSchema, faqSchema, webApplicationSchema];
      case "dashboard":
        return [webApplicationSchema];
      default:
        return [organizationSchema];
    }
  };

  const schemas = getPageSpecificSchema();

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOStructuredData;
