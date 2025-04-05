
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { linkTypes } from "../LinkTypes";

interface LinkTypeSelectProps {
  typeId: string;
  onChange: (value: string) => void;
}

const LinkTypeSelect = ({ typeId, onChange }: LinkTypeSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">Link Type</Label>
      <Select value={typeId} onValueChange={onChange}>
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
  );
};

export default LinkTypeSelect;
