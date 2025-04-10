
import { LinkType } from "@/components/LinkCard";
import { ReactNode } from "react";

// Define the shape of our context
export interface DashboardContextType {
  links: LinkType[];
  userData: UserData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLinkEditorOpen: boolean;
  openLinkEditor: (linkId?: string) => void;
  closeLinkEditor: () => void;
  currentEditingLink: LinkType | undefined;
  saveLink: (linkData: Omit<LinkType, "id"> & { id?: string }) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
  refreshData: () => void;
  profileLoading: boolean;
}

export interface UserData {
  id: string;
  name: string;
  bio: string;
  email: string;
  avatarUrl: string;
  username: string;
  profileViews: number;
  totalClicks: number;
}

export interface DashboardProviderProps {
  children: ReactNode;
}
