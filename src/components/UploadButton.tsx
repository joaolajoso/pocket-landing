
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';

interface UploadButtonProps {
  onUpload: (file: File) => void | Promise<void>;
  uploadText?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export const UploadButton = ({
  onUpload,
  uploadText = 'Upload File',
  accept = 'image/*',
  maxSize = 2, // Default 2MB
  className = '',
}: UploadButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      await onUpload(file);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Error uploading file');
    } finally {
      setLoading(false);
      // Reset the input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {uploadText}
          </>
        )}
      </Button>
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
      <p className="text-xs text-muted-foreground mt-1">
        Max file size: {maxSize}MB
      </p>
    </div>
  );
};
