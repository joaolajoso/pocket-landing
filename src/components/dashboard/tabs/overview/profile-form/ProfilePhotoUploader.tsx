
import { useState, useRef } from "react";
import { Loader2, Edit3, Trash2, Camera, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { PhotoCropDialog } from "./PhotoCropDialog";

interface ProfilePhotoUploaderProps {
  displayName: string;
  photoUrl: string;
  onUpload: (file: File) => Promise<string | null>;
  onDelete?: () => Promise<boolean>;
  disabled?: boolean;
  className?: string;
}

export const ProfilePhotoUploader = ({
  displayName,
  photoUrl,
  onUpload,
  onDelete,
  disabled = false,
  className
}: ProfilePhotoUploaderProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>("");
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  const handleFileSelect = () => {
    if (disabled || isUploading) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCameraCapture = () => {
    if (disabled || isUploading) return;
    
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
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
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Store the file and create a temporary URL for the cropper
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setTempPhotoUrl(url);
    setCropDialogOpen(true);
    
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };
  
  const handleCropDialogClose = () => {
    setCropDialogOpen(false);
    // Clean up the temporary URL
    if (tempPhotoUrl) {
      URL.revokeObjectURL(tempPhotoUrl);
      setTempPhotoUrl("");
    }
    setSelectedFile(null);
  };
  
  const handleCroppedImage = async (croppedBlob: Blob) => {
    setIsUploading(true);
    
    try {
      // Convert blob to file
      const file = new File([croppedBlob], selectedFile?.name || "profile-photo.jpg", {
        type: "image/jpeg",
      });
      
      await onUpload(file);
    } catch (error) {
      console.error('Error uploading cropped profile picture:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      
      // Clean up the temporary URL
      if (tempPhotoUrl) {
        URL.revokeObjectURL(tempPhotoUrl);
        setTempPhotoUrl("");
      }
    }
  };
  
  const handleDeletePhoto = async () => {
    if (!onDelete || isDeleting || disabled) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteAlert(false);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      
      {/* Crop Dialog */}
      {tempPhotoUrl && (
        <PhotoCropDialog
          photoUrl={tempPhotoUrl}
          isOpen={cropDialogOpen}
          onClose={handleCropDialogClose}
          onSave={handleCroppedImage}
        />
      )}
      
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div 
              className="cursor-pointer" 
              aria-label="Change profile picture"
              role="button"
              tabIndex={0}
            >
              <Avatar className={cn("w-24 h-24", className)}>
                <AvatarImage src={photoUrl} alt={displayName} />
                <AvatarFallback>
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem 
              onClick={handleFileSelect}
              disabled={isUploading || disabled}
              className="cursor-pointer"
            >
              <Image className="mr-2 h-4 w-4" />
              Choose from gallery
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleCameraCapture}
              disabled={isUploading || disabled}
              className="cursor-pointer"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take a photo
            </DropdownMenuItem>
            {photoUrl && onDelete && (
              <DropdownMenuItem 
                onClick={() => setShowDeleteAlert(true)}
                disabled={isDeleting || disabled}
                className="cursor-pointer text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove photo
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="absolute -bottom-2 -right-2">
          <Button 
            size="icon"
            className="h-8 w-8 rounded-full"
            variant="secondary"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleFileSelect();
            }}
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
      </div>

      {/* Alert Dialog for Delete Confirmation */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete profile picture?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your profile picture. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePhoto}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
