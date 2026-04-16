
import { UseFormReturn } from "react-hook-form";

export interface ProfileFormValues {
  name: string;
  bio: string;
  username: string;
  headline: string;
  linkedin: string;
  website: string;
  phone_number: string;
  share_email_publicly: boolean;
  share_phone_publicly: boolean;
}

export interface UserProfileFormProps {
  userData: {
    name: string;
    bio: string;
    username: string;
    avatarUrl: string;
  };
  onClose?: () => void;
}
