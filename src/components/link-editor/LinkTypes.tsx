import { 
  Linkedin, 
  FileText, 
  Github, 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Mail, 
  Globe, 
  Link as LinkIcon,
  MessageCircle,
  Send
} from "lucide-react";
import { ReactNode } from "react";

// TikTok custom icon (Lucide doesn't have native TikTok)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

/**
 * Interface representing a link type option in the application
 */
export interface LinkTypeOption {
  id: string;
  label: string;
  icon: ReactNode;
}

/**
 * An array of all available link types with their respective icons
 */
export const linkTypes: LinkTypeOption[] = [
  { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
  { id: "github", label: "GitHub", icon: <Github className="h-4 w-4" /> },
  { id: "cv", label: "Resume/CV", icon: <FileText className="h-4 w-4" /> },
  { id: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { id: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4" /> },
  { id: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { id: "youtube", label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
  { id: "tiktok", label: "TikTok", icon: <TikTokIcon className="h-4 w-4" /> },
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-4 w-4" /> },
  { id: "telegram", label: "Telegram", icon: <Send className="h-4 w-4" /> },
  { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { id: "website", label: "Website", icon: <Globe className="h-4 w-4" /> },
  { id: "other", label: "Other", icon: <LinkIcon className="h-4 w-4" /> },
];

/**
 * Find a link type option by its ID
 * @param id The ID of the link type to find
 * @returns The link type option or the "other" type as fallback
 */
export const getLinkTypeById = (id: string): LinkTypeOption => {
  return linkTypes.find(type => type.id === id) || linkTypes[9]; // Default to "other"
};

/**
 * Find a link type by its icon representation
 * @param icon The ReactNode representing the icon
 * @returns The ID of the matching link type or "other" as fallback
 */
export const findLinkTypeByIcon = (icon: ReactNode): string => {
  // Stringification is not ideal for object comparison, but works for our specific case
  // since the React elements are simple and consistent
  const iconString = JSON.stringify(icon);
  
  for (const type of linkTypes) {
    if (JSON.stringify(type.icon) === iconString) {
      return type.id;
    }
  }
  
  return "other"; // Default to "other" if no match is found
};

/**
 * Get the icon component for a specific link type ID
 * @param typeId The ID of the link type
 * @returns The ReactNode icon for the link type
 */
export const getLinkIconById = (typeId: string): ReactNode => {
  return getLinkTypeById(typeId).icon;
};
