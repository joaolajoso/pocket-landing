
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ProfileFormValues {
  name: string;
  bio: string;
  username: string;
  headline: string;
  linkedin: string;
  website: string;
}

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
  const { profile, loading, updateProfile, uploadProfilePhoto, refreshProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: userData.name,
      bio: userData.bio,
      username: userData.username,
      headline: profile?.headline || "",
      linkedin: profile?.linkedin || "",
      website: profile?.website || ""
    }
  });
  
  // Update form when profile data changes
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || userData.name,
        bio: profile.bio || userData.bio,
        username: profile.slug || userData.username,
        headline: profile.headline || "",
        linkedin: profile.linkedin || "",
        website: profile.website || ""
      });
    }
  }, [profile, userData, form]);
  
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile({
        name: values.name,
        bio: values.bio,
        slug: values.username,
        headline: values.headline,
        linkedin: values.linkedin,
        website: values.website
      });
      
      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved"
      });
      
      // Refresh profile data
      refreshProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "There was a problem saving your changes",
        variant: "destructive"
      });
    }
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
      refreshProfile();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
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
              <AvatarImage src={profile?.photo_url || userData.avatarUrl} alt={form.getValues("name")} />
              <AvatarFallback>
                {form.getValues("name").split(' ').map(n => n[0]).join('').toUpperCase()}
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
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit3 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={loading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title/Headline</FormLabel>
              <FormControl>
                <Input {...field} disabled={loading} placeholder="Software Engineer" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-muted rounded-l-md border-y border-l border-input">
                  {window.location.host}/u/
                </span>
                <FormControl>
                  <Input
                    {...field}
                    className="rounded-l-none"
                    disabled={loading}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  disabled={loading}
                  placeholder="Tell us about yourself"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled={loading} 
                  placeholder="username or full URL" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled={loading} 
                  placeholder="yourwebsite.com" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};
