import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { OrganizationLogoUpload } from "./OrganizationLogoUpload";

interface OrganizationBannerCardProps {
  organizationId: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  organizationName: string;
  onUpdate: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
}

export function OrganizationBannerCard({
  organizationId,
  bannerUrl,
  logoUrl,
  organizationName,
  onUpdate,
}: OrganizationBannerCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result as string);
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async () => {
    if (!tempImage || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      console.log("Starting banner upload...");
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      console.log("Image cropped successfully");

      const fileName = `${organizationId}-banner-${Date.now()}.jpg`;
      console.log("Uploading to storage:", fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("organization-images")
        .upload(fileName, croppedImage, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", uploadData);

      const {
        data: { publicUrl },
      } = supabase.storage.from("organization-images").getPublicUrl(fileName);

      console.log("Public URL:", publicUrl);

      const { data: updateData, error: updateError } = await supabase
        .from("organizations")
        .update({ banner_url: publicUrl })
        .eq("id", organizationId)
        .select();

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      console.log("Database updated:", updateData);

      toast.success("Banner atualizado com sucesso!");
      setIsEditing(false);
      setTempImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      
      // Force immediate refresh
      onUpdate();
    } catch (error: any) {
      console.error("Error uploading banner:", error);
      toast.error(`Erro ao fazer upload do banner: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden group">
        {/* Banner Image */}
        <div className="relative w-full h-48 md:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20">
          {bannerUrl ? (
            <img
              src={`${bannerUrl}?t=${Date.now()}`}
              alt="Organization banner"
              className="w-full h-full object-cover"
              key={bannerUrl}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Edit Button */}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => document.getElementById("banner-upload")?.click()}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {/* Logo Overlay */}
          <div className="absolute -bottom-12 left-6 md:left-8">
            <OrganizationLogoUpload
              organizationId={organizationId}
              logoUrl={logoUrl}
              organizationName={organizationName}
              onUpdate={onUpdate}
            />
          </div>
        </div>

        {/* Spacing for logo */}
        <div className="h-16" />

        <input
          id="banner-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          key={bannerUrl || "banner-input"}
        />
      </Card>

      {/* Crop Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Ajustar Banner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cropper */}
            <div className="relative w-full h-64 md:h-96 bg-muted rounded-lg overflow-hidden">
              {tempImage && (
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            {/* Zoom Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Zoom</label>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.3}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setTempImage(null);
                }}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveBanner} disabled={isUploading}>
                {isUploading ? "Salvando..." : "Salvar Banner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
