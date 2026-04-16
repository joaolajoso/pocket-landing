
import { useFormContext } from "react-hook-form";

export interface FormErrors {
  title: string;
  url: string;
}

interface FormErrorsProps {
  form: ReturnType<typeof useFormContext>;
}

const FormErrors = ({ form }: FormErrorsProps) => {
  const { formState } = form;
  const { errors } = formState;

  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className="space-y-1 rounded-md border border-destructive/50 bg-destructive/10 p-3">
      {errors.title && (
        <p className="text-sm text-destructive">{errors.title.message as string}</p>
      )}
      {errors.url && (
        <p className="text-sm text-destructive">{errors.url.message as string}</p>
      )}
      {errors.type && (
        <p className="text-sm text-destructive">{errors.type.message as string}</p>
      )}
    </div>
  );
};

export default FormErrors;
