
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { LinkType } from "@/components/LinkCard";
import { linkTypes, getLinkTypeById } from "./LinkTypes";

interface FormErrors {
  title: string;
  url: string;
}

interface LinkEditorFormProps {
  onSave: (link: Omit<LinkType, "id"> & {id?: string}) => void;
  onCancel: () => void;
  editingLink?: LinkType;
}

export const LinkEditorForm = ({ onSave, onCancel, editingLink }: LinkEditorFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    type: "website"
  });

  const [errors, setErrors] = useState<FormErrors>({
    title: "",
    url: ""
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
        type: iconType?.id || "other"
      });
    } else {
      setFormData({
        title: "",
        url: "",
        type: "website"
      });
    }
    
    setErrors({
      title: "",
      url: ""
    });
  }, [editingLink]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  const validateForm = () => {
    const newErrors = {
      title: "",
      url: ""
    };
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.url.trim()) {
      newErrors.url = "URL is required";
    } else if (
      formData.type !== "email" && 
      !formData.url.match(/^(http|https):\/\/[^ "]+$/)
    ) {
      newErrors.url = "Please enter a valid URL starting with http:// or https://";
    } else if (
      formData.type === "email" && 
      !formData.url.match(/^mailto:[^ "]+$/) &&
      !formData.url.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ) {
      newErrors.url = "Please enter a valid email address or mailto: link";
    }
    
    setErrors(newErrors);
    return !newErrors.title && !newErrors.url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Format email as mailto if needed
    let url = formData.url;
    if (formData.type === "email" && !url.startsWith("mailto:")) {
      url = `mailto:${url}`;
    }
    
    const selectedType = getLinkTypeById(formData.type);
    
    onSave({
      id: editingLink?.id,
      title: formData.title,
      url: url,
      icon: selectedType.icon
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="type">Link Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select link type" />
          </SelectTrigger>
          <SelectContent>
            {linkTypes.map((type) => (
              <SelectItem key={type.id} value={type.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {type.icon}
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. My LinkedIn Profile"
        />
        {errors.title && <p className="text-destructive text-sm">{errors.title}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="url">
          {formData.type === "email" ? "Email Address" : "URL"}
        </Label>
        <Input
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          placeholder={
            formData.type === "email"
              ? "e.g. your@email.com"
              : "e.g. https://example.com"
          }
        />
        {errors.url && <p className="text-destructive text-sm">{errors.url}</p>}
      </div>
      
      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};
