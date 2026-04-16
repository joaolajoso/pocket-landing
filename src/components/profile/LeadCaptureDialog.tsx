
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, SendHorizontal, UserCircle, Phone, Paperclip, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface LeadCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ownerEmail: string;
  ownerName: string;
  profileOwnerId: string;
  ownerPhotoUrl?: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome precisa ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const LeadCaptureDialog = ({ isOpen, onClose, ownerEmail, ownerName, profileOwnerId, ownerPhotoUrl }: LeadCaptureDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("O arquivo deve ter no máximo 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async (): Promise<{ url: string; name: string } | null> => {
    if (!selectedFile) return null;
    const ext = selectedFile.name.split('.').pop();
    const filePath = `${profileOwnerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    const { error } = await supabase.storage
      .from('lead_capture_files')
      .upload(filePath, selectedFile);

    if (error) throw new Error(`Erro ao enviar arquivo: ${error.message}`);

    const { data: publicUrl } = supabase.storage
      .from('lead_capture_files')
      .getPublicUrl(filePath);

    return { url: publicUrl.publicUrl, name: selectedFile.name };
  };

  const handleSubmit = async (data: FormData) => {
    if (!profileOwnerId) {
      toast.error("Não foi possível identificar o dono do perfil.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const fileData = await uploadFile();

      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          message: "",
          ownerEmail,
          ownerName,
          profileOwnerId,
          fileUrl: fileData?.url || null,
          fileName: fileData?.name || null,
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("Informações de contato enviadas com sucesso!");
      form.reset();
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      toast.error("Houve um problema ao enviar seus dados de contato. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {ownerPhotoUrl && (
            <div className="flex justify-center mb-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={ownerPhotoUrl} alt={ownerName} />
                <AvatarFallback className="text-lg">
                  {ownerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <DialogTitle className="text-center">Compartilhe seus dados de contato</DialogTitle>
          <DialogDescription className="text-center">
            Conecte-se com <span className="font-medium">{ownerName}</span> compartilhando suas informações
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <UserCircle className="text-muted-foreground w-5 h-5 absolute ml-2.5" />
                      <Input className="pl-9" placeholder="Seu nome" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Mail className="text-muted-foreground w-5 h-5 absolute ml-2.5" />
                      <Input className="pl-9" placeholder="Seu email" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (opcional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Phone className="text-muted-foreground w-5 h-5 absolute ml-2.5" />
                      <Input className="pl-9" placeholder="Seu número de telefone" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <FormLabel>Anexar ficheiro (opcional)</FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
              {selectedFile ? (
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)}MB
                  </span>
                  <button type="button" onClick={removeFile} className="p-1 hover:bg-muted rounded">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full h-9 text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-3.5 w-3.5 mr-2" />
                  Anexar CV ou documento (máx. 10MB)
                </Button>
              )}
            </div>
            
            <div className="flex justify-between gap-4 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Pular
              </Button>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500"
                disabled={isSubmitting}
              >
                <SendHorizontal className="mr-1" />
                Compartilhar Contato
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;
