
import { useState, useRef } from "react";
import { Loader2, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ProfilePhotoUploaderProps {
  displayName: string;
  photoUrl: string;
  onUpload: (file: File) => Promise<string | null>;
  onDelete?: () => Promise<boolean>;
  disabled?: boolean;
}

export const ProfilePhotoUploader = ({
  displayName,
  photoUrl,
  onUpload,
  onDelete,
  disabled = false
}: ProfilePhotoUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDeletePhoto = async () => {
    if (!onDelete || isDeleting || disabled) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting profile picture:', error);
    } finally {
      setIsDeleting(false);
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
        
        <div className="absolute -bottom-2 -right-2 flex gap-1">
          <Button 
            size="icon"
            className="h-8 w-8 rounded-full"
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
          
          {photoUrl && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  variant="destructive"
                  type="button"
                  disabled={isDeleting || disabled}
                  aria-label="Delete profile picture"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete profile picture?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove your profile picture. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePhoto}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </>
  );
};
