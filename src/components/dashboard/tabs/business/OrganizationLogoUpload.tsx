import { useState } from "react";
import { Camera, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrganizationLogoUploadProps {
  organizationId: string;
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

export function OrganizationLogoUpload({
  organizationId,
  logoUrl,
  organizationName,
  onUpdate,
}: OrganizationLogoUploadProps) {
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

  const handleSaveLogo = async () => {
    if (!tempImage || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);

      const fileName = `${organizationId}-logo-${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("organization-images")
        .upload(fileName, croppedImage, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("organization-images").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("organizations")
        .update({ logo_url: publicUrl })
        .eq("id", organizationId);

      if (updateError) throw updateError;

      toast.success("Logo atualizado com sucesso!");
      setIsEditing(false);
      setTempImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      
      onUpdate();
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error(`Erro ao fazer upload do logo: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const { error } = await supabase
        .from("organizations")
        .update({ logo_url: null })
        .eq("id", organizationId);

      if (error) throw error;

      toast.success("Logo removido com sucesso!");
      onUpdate();
    } catch (error: any) {
      console.error("Error removing logo:", error);
      toast.error(`Erro ao remover logo: ${error.message || "Erro desconhecido"}`);
    }
  };

  return (
    <>
      <div className="relative group">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
          {logoUrl ? (
            <img
              src={`${logoUrl}?t=${Date.now()}`}
              alt={organizationName}
              className="w-full h-full object-cover"
              key={logoUrl}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {organizationName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Edit Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => document.getElementById("logo-upload")?.click()}>
              <Camera className="h-4 w-4 mr-2" />
              Alterar Logo
            </DropdownMenuItem>
            {logoUrl && (
              <DropdownMenuItem onClick={handleRemoveLogo} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remover Logo
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          key={logoUrl || "logo-input"}
        />
      </div>

      {/* Crop Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Ajustar Logo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cropper */}
            <div className="relative w-full h-64 md:h-96 bg-muted rounded-lg overflow-hidden">
              {tempImage && (
                <Cropper
                  image={tempImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
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
              <Button onClick={handleSaveLogo} disabled={isUploading}>
                {isUploading ? "Salvando..." : "Salvar Logo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
