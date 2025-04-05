
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TitleInputProps {
  title: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TitleInput = ({ title, error, onChange }: TitleInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="title">Title</Label>
      <Input
        id="title"
        name="title"
        value={title}
        onChange={onChange}
        placeholder="e.g. My LinkedIn Profile"
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default TitleInput;
