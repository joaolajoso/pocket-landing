import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE_MB = 10;

const ProfileFileCard = () => {
  const { user } = useAuth();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchFile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("profile_file_url, profile_file_name")
        .eq("id", user.id)
        .single();
      if (data) {
        setFileUrl(data.profile_file_url);
        setFileName(data.profile_file_name);
      }
    };
    fetchFile();
  }, [user]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({ title: "Ficheiro demasiado grande", description: `Máximo ${MAX_FILE_SIZE_MB}MB`, variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/profile-file.${ext}`;

      // Delete old file if exists
      await supabase.storage.from("profile_files").remove([path]);

      const { error: uploadError } = await supabase.storage
        .from("profile_files")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profile_files")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_file_url: publicUrl, profile_file_name: file.name })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setFileUrl(publicUrl);
      setFileName(file.name);
      toast({ title: "Ficheiro carregado!", description: "O ficheiro está agora visível na sua página pública." });
    } catch (err: any) {
      toast({ title: "Erro ao carregar", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    if (!user) return;
    setUploading(true);
    try {
      // List and remove all files in user folder
      const { data: files } = await supabase.storage
        .from("profile_files")
        .list(user.id);

      if (files && files.length > 0) {
        await supabase.storage
          .from("profile_files")
          .remove(files.map((f) => `${user.id}/${f.name}`));
      }

      await supabase
        .from("profiles")
        .update({ profile_file_url: null, profile_file_name: null })
        .eq("id", user.id);

      setFileUrl(null);
      setFileName(null);
      toast({ title: "Ficheiro removido" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const isPdf = fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="mb-4 md:mb-6">
      <h3 className="text-base font-semibold flex items-center gap-2 mb-3 px-1">
        <FileText className="h-4 w-4" />
        Documento Público
      </h3>
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Carregue um ficheiro (PDF, documento) que ficará disponível para download na sua página pública. Máx. {MAX_FILE_SIZE_MB}MB.
        </p>

        {fileUrl && fileName ? (
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
              {isPdf ? (
                <iframe
                  src={`${fileUrl}#page=1&view=FitH`}
                  className="w-full h-full pointer-events-none"
                  title="Preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fileName}</p>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                Ver ficheiro
              </a>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemove} disabled={uploading}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              onChange={handleUpload}
              disabled={uploading}
            />
            <div className="flex items-center justify-center gap-2 border-2 border-dashed border-white/20 rounded-lg p-4 hover:border-primary/50 transition-colors">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Carregar ficheiro</span>
                </>
              )}
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

export default ProfileFileCard;
