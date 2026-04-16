
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";

interface SectionSelectProps {
  sections: { id: string; title: string }[];
  form: ReturnType<typeof useFormContext>;
}

const SectionSelect = ({ sections, form }: SectionSelectProps) => {
  const { setValue, watch } = form;
  const sectionId = watch("section");
  
  if (sections.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="section">Section</Label>
      <Select value={sectionId} onValueChange={(value) => setValue("section", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select a section" />
        </SelectTrigger>
        <SelectContent>
          {sections.map((section) => (
            <SelectItem key={section.id} value={section.id}>
              {section.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SectionSelect;
