
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface UserProfileFormProps {
  userData: {
    name: string;
    bio: string;
    username: string;
    avatarUrl: string;
  };
}

export const UserProfileForm = ({ userData }: UserProfileFormProps) => {
  const { toast } = useToast();
  const { profile, loading, updateProfile, uploadProfilePhoto } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [profileFormData, setProfileFormData] = useState({
    name: userData.name,
    bio: userData.bio,
    username: userData.username,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateProfile({
      name: profileFormData.name,
      bio: profileFormData.bio,
      slug: profileFormData.username
    });
  };
  
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      await uploadProfilePhoto(file);
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully"
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6 py-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile?.photo_url || userData.avatarUrl} alt={profileFormData.name} />
            <AvatarFallback>
              {profileFormData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button 
            size="icon"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
            variant="secondary"
            type="button"
            onClick={handleAvatarClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              <Edit3 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          name="name"
          value={profileFormData.name}
          onChange={handleProfileChange}
          disabled={loading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex items-center">
          <span className="px-3 py-2 bg-muted rounded-l-md border-y border-l border-input">
            {window.location.host}/u/
          </span>
          <Input
            id="username"
            name="username"
            value={profileFormData.username}
            onChange={handleProfileChange}
            className="rounded-l-none"
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={profileFormData.bio}
          onChange={handleProfileChange}
          rows={3}
          disabled={loading}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};
