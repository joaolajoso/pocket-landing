
import { useState, useEffect } from "react";
import { LinkType } from "@/components/LinkCard";
import { linkTypes } from "../LinkTypes";

export interface FormData {
  title: string;
  url: string;
  type: string;
  section: string;
}

export const useFormState = (
  onSave: (link: Omit<LinkType, "id"> & { id?: string, section?: string }) => void,
  editingLink?: LinkType & {section?: string}
) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    url: "",
    type: "website",
    section: ""
  });

  useEffect(() => {
    if (editingLink) {
      // Find the type based on icon
      const iconType = linkTypes.find(type => {
        // This is a simple comparison, might need refinement
        if (typeof editingLink.icon === 'string') {
          return type.id === editingLink.icon;
        }
        return JSON.stringify(type.icon) === JSON.stringify(editingLink.icon);
      });

      setFormData({
        title: editingLink.title || "",
        url: editingLink.url || "",
        type: iconType?.id || "website",
        section: editingLink.section || ""
      });
    } else {
      setFormData({
        title: "",
        url: "",
        type: "website",
        section: ""
      });
    }
  }, [editingLink]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleSectionChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      section: value
    }));
  };

  const handleSaveClick = (data: FormData) => {
    onSave({
      title: data.title,
      url: data.url,
      icon: data.type,
      id: editingLink?.id,
      section: data.section
    });
  };

  return {
    formData,
    defaultFormState: formData,
    handleChange,
    handleSelectChange,
    handleSectionChange,
    handleSaveClick
  };
};
