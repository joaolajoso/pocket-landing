
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
  Link as LinkIcon 
} from "lucide-react";
import { ReactNode } from "react";

export interface LinkTypeOption {
  id: string;
  label: string;
  icon: ReactNode;
}

export const linkTypes: LinkTypeOption[] = [
  { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
  { id: "github", label: "GitHub", icon: <Github className="h-4 w-4" /> },
  { id: "cv", label: "Resume/CV", icon: <FileText className="h-4 w-4" /> },
  { id: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { id: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4" /> },
  { id: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { id: "youtube", label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
  { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { id: "website", label: "Website", icon: <Globe className="h-4 w-4" /> },
  { id: "other", label: "Other", icon: <LinkIcon className="h-4 w-4" /> },
];

// Helper function to find a link type by icon
export const findLinkTypeByIcon = (icon: ReactNode): string => {
  const foundType = linkTypes.find(type => {
    return JSON.stringify(type.icon) === JSON.stringify(icon);
  });
  
  return foundType?.id || "other";
};

// Helper function to get link type by ID
export const getLinkTypeById = (id: string): LinkTypeOption => {
  return linkTypes.find(type => type.id === id) || linkTypes[9]; // Default to "other"
};
