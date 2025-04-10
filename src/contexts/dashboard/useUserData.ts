
import { useState, useEffect } from "react";
import { UserData } from "./types";
import { ProfileData } from "@/hooks/profile/useProfileData";

export const useUserData = (
  profile: ProfileData | null,
  user: any | null
) => {
  const [userData, setUserData] = useState<UserData>({
    id: "",
    name: "",
    bio: "",
    email: "",
    avatarUrl: "",
    username: "",
    profileViews: 0,
    totalClicks: 0,
  });

  // Update user data when profile is loaded
  useEffect(() => {
    if (profile && user) {
      setUserData({
        id: user.id || "",
        name: profile.name || "",
        bio: profile.bio || "",
        email: profile.email || user.email || "",
        avatarUrl: profile.photo_url || "",
        username: profile.slug || "",
        profileViews: 0,
        totalClicks: 0,
      });
    }
  }, [profile, user]);

  return { userData };
};
