
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface UrlInputProps {
  url: string;
  error: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UrlInput = ({ url, error, type, onChange }: UrlInputProps) => {
  const isEmail = type === "email";
  
  return (
    <div className="space-y-2">
      <Label htmlFor="url">
        {isEmail ? "Email Address" : "URL"}
      </Label>
      <Input
        id="url"
        name="url"
        value={url}
        onChange={onChange}
        placeholder={
          isEmail
            ? "e.g. your@email.com"
            : "e.g. https://example.com"
        }
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export default UrlInput;
