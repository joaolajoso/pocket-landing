import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";
import { SocialShortcuts } from "@/components/ui/SocialShortcuts";

interface UrlInputProps {
  form: ReturnType<typeof useFormContext>;
}

const UrlInput = ({ form }: UrlInputProps) => {
  const { register, watch, setValue, formState: { errors } } = form;
  const type = watch("type");
  const url = watch("url");
  
  const isEmail = type === "email";
  
  // Add effect to auto-prefix mailto: when type changes to email
  useEffect(() => {
    if (isEmail) {
      // Only modify the URL if it doesn't already have a protocol
      if (url && !url.startsWith('mailto:') && !url.includes('://')) {
        // If there's existing content, add mailto: prefix
        setValue("url", `mailto:${url}`);
      } else if (!url) {
        // If there's no URL yet, set just the mailto: prefix
        setValue("url", "mailto:");
      }
    } else if (url?.startsWith('mailto:')) {
      // If changing from email to something else, remove mailto:
      setValue("url", url.replace('mailto:', ''));
    }
  }, [type, url, setValue, isEmail]);
  
  const getPlaceholder = () => {
    switch (type) {
      case "email":
        return "E.g. your@email.com (sem precisar digitar mailto:)";
      case "linkedin":
        return "E.g. linkedin.com/in/yourname ou qualquer URL";
      case "website":
        return "E.g. example.com ou qualquer URL";
      default:
        return "Digite a URL desejada";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // If it's an email type and user deletes the mailto: prefix, add it back
    if (isEmail && !value.startsWith('mailto:')) {
      value = `mailto:${value}`;
      
      // Position cursor after the mailto: prefix
      setTimeout(() => {
        const input = e.target;
        const position = "mailto:".length;
        input.setSelectionRange(position, position);
      }, 0);
    }
    
    setValue("url", value);
  };

  // Check if current type is a social platform
  const isSocialPlatform = ["linkedin", "github", "instagram", "twitter", "facebook", "youtube"].includes(type);

  return (
    <FormItem>
      <Label htmlFor="url">
        {isEmail ? "Endereço de Email" : "URL"}
      </Label>
      <FormControl>
        <Input 
          id="url" 
          placeholder={getPlaceholder()} 
          className="w-full truncate"
          value={url}
          onChange={handleChange}
        />
      </FormControl>
      {errors.url && <FormMessage>{errors.url.message as string}</FormMessage>}
      {isSocialPlatform && (
        <SocialShortcuts selectedPlatform={type} variant="compact" className="mt-1" />
      )}
      {url && url.length > 30 && (
        <div className="text-xs text-muted-foreground mt-1 max-h-20 overflow-y-auto break-all border rounded-md p-2">
          <p className="font-medium mb-1">URL completa:</p>
          <p>{url}</p>
        </div>
      )}
    </FormItem>
  );
};

export default UrlInput;
