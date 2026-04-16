
import { z } from "zod";
import { FormErrors } from "./FormErrors";

export const useFormValidation = () => {
  // Create a schema for form validation using zod
  const schema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    url: z.string().min(1, { message: "URL is required" }),
    type: z.string(),
    section: z.string().optional()
  });

  const errors = { title: "", url: "" } as FormErrors;
  
  const clearError = (name: keyof FormErrors) => {
    console.log(`Clearing error for ${name}`);
  };
  
  const validateForm = (title: string, url: string, type: string): boolean => {
    // Validate that we have at least a title and URL
    const validationResult = schema.safeParse({
      title,
      url,
      type
    });
    
    if (!validationResult.success) {
      console.error("Form validation failed:", validationResult.error);
      return false;
    }
    
    return true;
  };

  return {
    schema,
    errors,
    clearError,
    validateForm
  };
};
