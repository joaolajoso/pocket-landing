
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { ProfileFormFields } from "./profile-form/ProfileFormFields";
import { ProfilePhotoUploader } from "./profile-form/ProfilePhotoUploader";
import { useProfileFormLogic } from "./profile-form/useProfileFormLogic";
import { UserProfileFormProps } from "./profile-form/types";

export const UserProfileForm = ({ userData, onClose }: UserProfileFormProps) => {
  const {
    form,
    loading,
    user,
    onSubmit,
    handleNameChange,
    handlePhotoUpload,
    displayName,
    photoUrl
  } = useProfileFormLogic(userData, onClose);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
        <div className="flex justify-center mb-6">
          <ProfilePhotoUploader
            displayName={displayName}
            photoUrl={photoUrl}
            onUpload={handlePhotoUpload}
            disabled={!user}
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
