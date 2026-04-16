
import { Phone } from "lucide-react";
import { ProfileDesignSettings } from "@/hooks/profile/useProfileDesign";

interface PhoneButtonProps {
  phoneNumber: string;
  designSettings?: ProfileDesignSettings;
}

const PhoneButton: React.FC<PhoneButtonProps> = ({ phoneNumber, designSettings }) => {
  if (!phoneNumber) return null;
  
  return (
    <a 
      href={`tel:${phoneNumber}`}
      className="inline-flex items-center gap-2"
      style={{
        backgroundColor: designSettings?.button_background_color || '#0ea5e9',
        color: designSettings?.button_text_color || 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: designSettings?.button_border_style === 'all' ? '0.375rem' : '0',
        margin: '0.5rem auto 1.5rem auto',
        fontSize: '0.875rem',
        maxWidth: 'fit-content',
        textDecoration: 'none'
      }}
    >
      <Phone className="h-4 w-4" style={{ color: designSettings?.button_icon_color || 'currentColor' }} />
      <span>{phoneNumber}</span>
    </a>
  );
};

export default PhoneButton;
