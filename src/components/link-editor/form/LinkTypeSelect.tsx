
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { linkTypes } from "../LinkTypes";
import { useFormContext } from "react-hook-form";

interface LinkTypeSelectProps {
  form: ReturnType<typeof useFormContext>;
}

const LinkTypeSelect = ({ form }: LinkTypeSelectProps) => {
  const { watch, setValue } = form;
  const typeId = watch("type");

  const onChange = (value: string) => {
    setValue("type", value);
  };

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
