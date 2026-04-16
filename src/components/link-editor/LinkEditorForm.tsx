
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LinkType } from "@/components/LinkCard";
import FormFooter from "./form/FormFooter";
import LinkTypeSelect from "./form/LinkTypeSelect";
import TitleInput from "./form/TitleInput";
import UrlInput from "./form/UrlInput";
import SectionSelect from "./form/SectionSelect";
import FormErrors from "./form/FormErrors";
import { useFormValidation } from "./form/useFormValidation";
import { Form, FormField } from "@/components/ui/form";

interface LinkEditorFormProps {
  onSave: (link: Omit<LinkType, "id"> & { id?: string, section?: string }) => void;
  onCancel: () => void;
  editingLink?: LinkType & { section?: string };
  sections?: { id: string, title: string }[];
  maxLinksReached?: boolean;
  currentSectionId?: string;
}

export function LinkEditorForm({ 
  onSave, 
  onCancel, 
  editingLink, 
  sections = [], 
  maxLinksReached,
  currentSectionId
}: LinkEditorFormProps) {
  const { schema } = useFormValidation();

  // Set up the form with zod validation
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: editingLink?.title || "",
      url: editingLink?.url || "",
      type: typeof editingLink?.icon === 'string' ? editingLink.icon : "website",
      section: editingLink?.section || currentSectionId || (sections.length > 0 ? sections[0].id : "")
    }
  });

  // Update form values when editingLink or currentSectionId changes
  useEffect(() => {
    if (editingLink) {
      form.reset({
        title: editingLink.title || "",
        url: editingLink.url || "",
        type: typeof editingLink.icon === 'string' ? editingLink.icon : "website",
        section: editingLink.section || ""
      });
    } else {
      form.reset({
        title: "",
        url: "",
        type: "website",
        section: currentSectionId || (sections.length > 0 ? sections[0].id : "")
      });
    }
  }, [editingLink, form, sections, currentSectionId]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    onSave({
      title: data.title,
      url: data.url,
      icon: data.type,
      id: editingLink?.id,
      section: data.section
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {maxLinksReached && !editingLink && (
          <div className="rounded-md bg-yellow-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Limite de links atingido</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Você atingiu o limite de 5 links. Para adicionar um novo, remova algum existente primeiro.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <LinkTypeSelect form={form} />
        <TitleInput form={form} />
        <UrlInput form={form} />
        
        {sections.length > 0 && (
          <SectionSelect form={form} sections={sections} />
        )}
        
        <FormErrors form={form} />
        
        <FormFooter onCancel={onCancel} maxLinksReached={maxLinksReached && !editingLink} />
      </form>
    </Form>
  );
}
