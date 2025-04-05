
import { useState, useEffect } from "react";
import { LinkType } from "@/components/LinkCard";
import { linkTypes } from "../LinkTypes";

interface FormData {
  title: string;
  url: string;
  type: string;
  section: string;
}

export const useFormState = (
  editingLink?: LinkType & {section?: string},
  sections?: {id: string, title: string}[]
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
        return JSON.stringify(type.icon) === JSON.stringify(editingLink.icon);
      });

      setFormData({
        title: editingLink.title,
        url: editingLink.url,
        type: iconType?.id || "other",
        section: editingLink.section || ""
      });
    } else {
      setFormData({
        title: "",
        url: "",
        type: "website",
        section: sections && sections.length > 0 ? sections[0].id : ""
      });
    }
  }, [editingLink, sections]);

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

  return {
    formData,
    handleChange,
    handleSelectChange,
    handleSectionChange
  };
};
