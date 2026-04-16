import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";

interface ProfileBannerUploadProps {
  bannerUrl?: string | null;
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

export function ProfileBannerUpload({ bannerUrl, onUpdate }: ProfileBannerUploadProps) {
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
    if (!tempImage || !croppedAreaPixels || !user) return;

    setIsUploading(true);
    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);

      const fileName = `${user.id}/profile-banner-${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("organization-images")
        .upload(fileName, croppedImage, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("organization-images").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ banner_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success("Banner atualizado com sucesso!");
      setIsEditing(false);
      setTempImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      
      onUpdate();
    } catch (error: any) {
      console.error("Error uploading banner:", error);
      toast.error(`Erro ao fazer upload do banner: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ banner_url: null })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Banner removido com sucesso!");
      onUpdate();
    } catch (error: any) {
      toast.error("Erro ao remover banner");
    }
  };

  return (
    <>
      <div className="relative w-full h-48 rounded-lg overflow-hidden group bg-gradient-to-br from-primary/10 to-accent/10">
        {bannerUrl ? (
          <>
            <img
              src={`${bannerUrl}?t=${Date.now()}`}
              alt="Profile banner"
              className="w-full h-full object-cover"
              key={bannerUrl}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => document.getElementById("banner-upload")?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Alterar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemoveBanner}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </>
        ) : (
          <button
            onClick={() => document.getElementById("banner-upload")?.click()}
            className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Camera className="h-12 w-12 mb-2" />
            <span className="text-sm font-medium">Adicionar banner</span>
          </button>
        )}

        <input
          id="banner-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          key={bannerUrl || "banner-input"}
        />
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Ajustar Banner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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