import { BusinessEmployeeCard } from "./BusinessEmployeeCard";

interface BusinessEmployeeCardPreviewProps {
  employeeName: string;
  employeePhoto?: string;
  employeePhone?: string;
  employeeEmail?: string;
  companyName: string;
  companyLogo?: string;
  bannerUrl?: string;
  primaryColor?: string;
  slug?: string;
  companySubdomain?: string;
}

export const BusinessEmployeeCardPreview = (props: BusinessEmployeeCardPreviewProps) => {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      {/* Phone Border */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] -m-2 shadow-2xl" />
      
      {/* Screen Content */}
      <div className="relative bg-white rounded-[2.5rem] overflow-hidden border-8 border-gray-900">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
        
        {/* Content */}
        <div className="pt-6">
          <BusinessEmployeeCard
            {...props}
            ctaLabel="Ver como podemos ajudar"
            ctaUrl={props.companySubdomain ? `/c/${props.companySubdomain}` : undefined}
          />
        </div>
      </div>
    </div>
  );
};
