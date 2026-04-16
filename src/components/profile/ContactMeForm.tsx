
import React, { useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, User, Phone, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ContactMeFormProps {
  ownerEmail: string;
  ownerName: string;
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Nome precisa ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  phone: z.string().optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const ContactMeForm = ({ ownerEmail, ownerName, isOpen, onClose }: ContactMeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const handleSubmit = async (data: FormData) => {
    if (!ownerEmail) {
      toast.error("Não foi possível encontrar o email do destinatário.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          message: data.message || "",
          ownerEmail,
          ownerName
        }
      });

      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("Informações de contato enviadas com sucesso!");
      
      // Reset form
      form.reset();
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      toast.error("Houve um problema ao enviar seus dados de contato. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show form in a dialog
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <Card className="w-full shadow-md border-purple-100 border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold">Entre em contato</CardTitle>
            <CardDescription>
              Preencha o formulário para se conectar com {ownerName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <User className="text-muted-foreground w-5 h-5 absolute ml-2.5" />
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

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Deixe uma mensagem..." 
                          className="min-h-[80px] resize-y"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-orange-400 hover:from-purple-700 hover:to-orange-500"
                  disabled={isSubmitting}
                >
                  <SendHorizontal className="mr-1" />
                  Enviar Contato
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ContactMeForm;
