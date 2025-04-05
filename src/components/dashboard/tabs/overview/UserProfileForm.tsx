
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [isLoading, setIsLoading] = useState(false);
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

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    }, 1000);
  };

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6 py-6">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={userData.avatarUrl} alt={userData.name} />
            <AvatarFallback>
              {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button 
            size="icon"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
            variant="secondary"
            type="button"
          >
            <Edit3 className="h-4 w-4" />
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
          disabled={isLoading}
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
            disabled={isLoading}
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
          disabled={isLoading}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};
