
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SectionSelectProps {
  sectionId: string;
  sections: { id: string; title: string }[];
  onChange: (value: string) => void;
}

const SectionSelect = ({ sectionId, sections, onChange }: SectionSelectProps) => {
  if (sections.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="section">Section</Label>
      <Select value={sectionId} onValueChange={onChange}>
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
