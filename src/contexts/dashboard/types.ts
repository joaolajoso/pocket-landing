import { ReactNode } from "react";
import { LinkType } from "@/components/LinkCard";
import { ProfileModeType } from "@/hooks/useProfileMode";

export type { ProfileModeType } from "@/hooks/useProfileMode";

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

export interface SectionWithLinks {
  id: string;
  title: string;
  displayTitle: boolean;
  active: boolean;
  links: LinkType[];
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  created_at: string;
  profile_owner_id: string;
}

export interface DashboardContextType {
  links: SectionWithLinks[];
  userData: UserData;
  activeTab: string;
  setActiveTab: (tab: string, subTab?: string) => void;
  networkSubTab?: string;
  isLinkEditorOpen: boolean;
  openLinkEditor: (linkId?: string, sectionId?: string) => void;
  closeLinkEditor: () => void;
  currentEditingLink?: LinkType & { section?: string };
  currentSectionId?: string;
  saveLink: (linkData: Omit<LinkType, "id"> & { id?: string, section?: string }) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
  refreshData: () => void;
  profileLoading: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  // Profile mode state
  profileMode: ProfileModeType;
  setProfileMode: (mode: ProfileModeType) => void;
  hasBusinessProfile: boolean;
}

export interface DashboardProviderProps {
  children: ReactNode;
}
