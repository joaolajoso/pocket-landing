
import { useState, useRef } from "react";
import { Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface ProfilePhotoUploaderProps {
  displayName: string;
  photoUrl: string;
  onUpload: (file: File) => Promise<string | null>;
  disabled?: boolean;
}

export const ProfilePhotoUploader = ({
  displayName,
  photoUrl,
  onUpload,
  disabled = false
}: ProfilePhotoUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleAvatarClick = () => {
    if (disabled || isUploading) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
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
      await onUpload(file);
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        capture="environment"
      />
      
      <div className="relative">
        <div 
          className="cursor-pointer" 
          onClick={handleAvatarClick}
          aria-label="Change profile picture"
          role="button"
          tabIndex={0}
        >
          <Avatar className="w-24 h-24">
            <AvatarImage src={photoUrl} alt={displayName} />
            <AvatarFallback>
              {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <Button 
          size="icon"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
          variant="secondary"
          type="button"
          onClick={handleAvatarClick}
          disabled={isUploading || disabled}
          aria-label="Upload profile picture"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Edit3 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );
};
