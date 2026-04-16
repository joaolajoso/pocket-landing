import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, Globe, ExternalLink } from "lucide-react";

interface BusinessEmployeeCardProps {
  employeeName: string;
  employeePhoto?: string;
  employeePhone?: string;
  employeeEmail?: string;
  companyName: string;
  companyLogo?: string;
  bannerUrl?: string;
  primaryColor?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  slug?: string;
}

export const BusinessEmployeeCard = ({
  employeeName,
  employeePhoto,
  employeePhone,
  employeeEmail,
  companyName,
  companyLogo,
  bannerUrl,
  primaryColor = '#0ea5e9',
  ctaLabel,
  ctaUrl,
  slug,
}: BusinessEmployeeCardProps) => {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl overflow-hidden shadow-lg">
      {/* Banner */}
      <div className="relative h-28">
        {bannerUrl ? (
          <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}cc, ${primaryColor}88, ${primaryColor}44)`,
            }}
          />
        )}
        {/* Company Logo - top right */}
        {companyLogo && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl p-1.5 shadow-md">
            <img
              src={companyLogo}
              alt={companyName}
              className="h-8 w-auto max-w-[80px] object-contain"
            />
          </div>
        )}
      </div>

      {/* Profile Photo - overlapping banner, left-aligned */}
      <div className="relative px-5">
        <div className="-mt-12">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage src={employeePhoto || ''} />
            <AvatarFallback
              className="text-lg font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {getInitials(employeeName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pt-3 pb-5 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{employeeName}</h2>
          <p className="text-sm text-gray-500">{companyName}</p>
        </div>

        {/* Contact Items */}
        <div className="space-y-2.5">
          {employeePhone && (
            <a
              href={`tel:${employeePhone}`}
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Phone className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <span>{employeePhone}</span>
            </a>
          )}
          {employeeEmail && (
            <a
              href={`mailto:${employeeEmail}`}
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Mail className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <span className="truncate">{employeeEmail}</span>
            </a>
          )}
          {ctaUrl && (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Globe className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <span>{ctaLabel || 'Ver como podemos ajudar'}</span>
            </a>
          )}
        </div>

        {/* View personal profile link */}
        {slug && (
          <a
            href={`/u/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80 mt-2"
            style={{ color: primaryColor }}
          >
            Ver perfil pessoal
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
