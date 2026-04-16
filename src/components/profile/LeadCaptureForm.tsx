
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, SendHorizontal, UserCircle, Phone, Paperclip, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface LeadCaptureFormProps {
  profileOwnerId: string;
  profileOwnerName: string;
  profileOwnerEmail?: string;
  profileOwnerPhotoUrl?: string;
  onFormSubmitted?: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome precisa ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }).optional(),
  phone: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "É necessário concordar com os termos para prosseguir."
  })
});

type FormData = z.infer<typeof formSchema>;

const LeadCaptureForm = ({ 
  profileOwnerId, 
  profileOwnerName, 
  profileOwnerEmail,
  profileOwnerPhotoUrl,
  onFormSubmitted 
}: LeadCaptureFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      consent: false
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
      // Upload file if selected
      const fileData = await uploadFile();

      // Send via edge function
      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: {
          name: data.name,
          email: data.email || "Não informado",
          phone: data.phone || "Não informado",
          message: "Capturado via formulário de contato",
          ownerEmail: profileOwnerEmail || "pocketcvnetworking@gmail.com",
          ownerName: profileOwnerName,
          profileOwnerId,
          fileUrl: fileData?.url || null,
          fileName: fileData?.name || null,
        }
      });
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("Obrigado! Suas informações foram enviadas com sucesso!");
      
      // Reset form
      form.reset();
      
      // Call the callback if provided (but don't close the popup automatically)
      if (onFormSubmitted) {
        onFormSubmitted();
      }
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      toast.error("Houve um problema ao enviar seus dados de contato. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Nome*</FormLabel>
                <FormControl>
                  <div className="relative">
                    <UserCircle className="text-muted-foreground w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input className="pl-10 h-10" placeholder="Seu nome" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload */}
          <div className="space-y-2">
            <FormLabel className="text-sm font-medium">Anexar ficheiro (opcional)</FormLabel>
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


          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="text-muted-foreground w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input className="pl-10 h-10" placeholder="Seu email" {...field} />
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
                <FormLabel className="text-sm font-medium">Telefone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Phone className="text-muted-foreground w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <Input className="pl-10 h-10" placeholder="Seu número de telefone" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                <FormControl>
                  <Checkbox 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-xs text-muted-foreground leading-relaxed">
                    Concordo em compartilhar meus dados para contato futuro e aceito os termos de privacidade
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500 h-11"
            disabled={isSubmitting}
          >
            <SendHorizontal className="mr-2 h-4 w-4" />
            {isSubmitting ? "Enviando..." : "Conectar-se"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LeadCaptureForm;
