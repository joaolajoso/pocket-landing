
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateOrganizationFormProps {
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
}

const CreateOrganizationForm = ({ onSubmit, onCancel }: CreateOrganizationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    size_category: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Organization name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await onSubmit(formData);
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Organization created successfully!"
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create organization",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Organization Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter organization name"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of your organization"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://yourcompany.com"
        />
      </div>

      <div>
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          placeholder="e.g., Technology, Healthcare, Finance"
        />
      </div>

      <div>
        <Label htmlFor="size">Company Size</Label>
        <Select value={formData.size_category} onValueChange={(value) => setFormData({ ...formData, size_category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
            <SelectItem value="small">Small (11-50 employees)</SelectItem>
            <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
            <SelectItem value="large">Large (201-1000 employees)</SelectItem>
            <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Creating..." : "Create Organization"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CreateOrganizationForm;
