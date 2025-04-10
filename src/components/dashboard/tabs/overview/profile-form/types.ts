
export interface ProfileFormValues {
  name: string;
  bio: string;
  username: string;
  headline: string;
  linkedin: string;
  website: string;
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
