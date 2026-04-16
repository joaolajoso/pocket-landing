
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { FormItem, FormControl, FormMessage } from "@/components/ui/form";

interface TitleInputProps {
  form: ReturnType<typeof useFormContext>;
}

const TitleInput = ({ form }: TitleInputProps) => {
  const { register, watch, formState: { errors } } = form;
  const type = watch("type");

  const getPlaceholder = () => {
    switch(type) {
      case "linkedin":
        return "e.g. My LinkedIn Profile";
      case "github":
        return "e.g. My GitHub Portfolio";
      case "website":
        return "e.g. My Personal Website";
      case "email":
        return "e.g. Professional Contact";
      case "twitter":
        return "e.g. My Twitter Profile";
      case "instagram":
        return "e.g. My Instagram Portfolio";
      default:
        return "e.g. My Professional Link";
    }
  };

  return (
    <FormItem>
      <Label htmlFor="title">Title</Label>
      <FormControl>
        <Input
          id="title"
          placeholder={getPlaceholder()}
          {...register("title")}
        />
      </FormControl>
      {errors.title && <FormMessage>{errors.title.message as string}</FormMessage>}
    </FormItem>
  );
};

export default TitleInput;
