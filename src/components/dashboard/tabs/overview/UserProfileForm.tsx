
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { ProfileFormFields } from "./profile-form/ProfileFormFields";
import { ProfilePhotoUploader } from "./profile-form/ProfilePhotoUploader";
import { useProfileFormLogic } from "./profile-form/useProfileFormLogic";
import { UserProfileFormProps } from "./profile-form/types";
import { useToast } from "@/hooks/use-toast";

export const UserProfileForm = ({ userData, onClose }: UserProfileFormProps) => {
  const { toast } = useToast();
  const {
    form,
    loading,
    user,
    onSubmit,
    handleNameChange,
    handlePhotoUpload,
    handlePhotoDelete,
    displayName,
    photoUrl
  } = useProfileFormLogic(userData, onClose);

  const handleProfilePhotoUpload = async (file: File): Promise<string | null> => {
    if (!user) {
      console.error('Cannot upload photo: No authenticated user');
      toast({
        title: "Authentication required",
        description: "You need to be logged in to upload a profile picture",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      console.log('UserProfileForm: Starting photo upload for user', user.id);
      return await handlePhotoUpload(file);
    } catch (error: any) {
      console.error('Error in UserProfileForm photo upload:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your profile picture",
        variant: "destructive"
      });
      return null;
    }
  };
  
  const handleProfilePhotoDelete = async (): Promise<boolean> => {
    if (!user) {
      console.error('Cannot delete photo: No authenticated user');
      toast({
        title: "Authentication required",
        description: "You need to be logged in to delete your profile picture",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      console.log('UserProfileForm: Starting photo deletion for user', user.id);
      return await handlePhotoDelete();
    } catch (error: any) {
      console.error('Error in UserProfileForm photo delete:', error);
      toast({
        title: "Delete failed",
        description: error.message || "There was a problem deleting your profile picture",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
        <div className="flex justify-center mb-6">
          <ProfilePhotoUploader
            displayName={displayName}
            photoUrl={photoUrl}
            onUpload={handleProfilePhotoUpload}
            onDelete={handleProfilePhotoDelete}
            disabled={!user || loading}
          />
        </div>
        
        <ProfileFormFields 
          form={form}
          loading={loading}
          onNameChange={handleNameChange}
        />
        
        <Button type="submit" className="w-full" disabled={loading || !user}>
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
