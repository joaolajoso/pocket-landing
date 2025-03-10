
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { 
  Linkedin, 
  FileText, 
  Github, 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube, 
  Mail, 
  Globe, 
  Link as LinkIcon 
} from "lucide-react";
import { LinkType } from "./LinkCard";

const linkTypes = [
  { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
  { id: "github", label: "GitHub", icon: <Github className="h-4 w-4" /> },
  { id: "cv", label: "Resume/CV", icon: <FileText className="h-4 w-4" /> },
  { id: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { id: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4" /> },
  { id: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { id: "youtube", label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
  { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { id: "website", label: "Website", icon: <Globe className="h-4 w-4" /> },
  { id: "other", label: "Other", icon: <LinkIcon className="h-4 w-4" /> },
];

interface LinkEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Omit<LinkType, "id"> & {id?: string}) => void;
  editingLink?: LinkType;
}

const LinkEditor = ({ isOpen, onClose, onSave, editingLink }: LinkEditorProps) => {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    type: "website"
  });

  const [errors, setErrors] = useState({
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
  }, [editingLink, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
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
    
    const selectedType = linkTypes.find(type => type.id === formData.type);
    
    onSave({
      id: editingLink?.id,
      title: formData.title,
      url: url,
      icon: selectedType?.icon || linkTypes[9].icon // Default to "other" icon
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingLink ? "Edit Link" : "Add New Link"}</DialogTitle>
        </DialogHeader>
        
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkEditor;
