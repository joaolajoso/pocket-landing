
import { useState } from "react";
import { FormErrors } from "./FormErrors";

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({
    title: "",
    url: ""
  });

  const clearError = (name: keyof FormErrors) => {
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = (title: string, url: string, type: string): boolean => {
    const newErrors = {
      title: "",
      url: ""
    };
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!url.trim()) {
      newErrors.url = "URL is required";
    } else if (
      type !== "email" && 
      !url.match(/^(http|https):\/\/[^ "]+$/)
    ) {
      newErrors.url = "Please enter a valid URL starting with http:// or https://";
    } else if (
      type === "email" && 
      !url.match(/^mailto:[^ "]+$/) &&
      !url.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ) {
      newErrors.url = "Please enter a valid email address or mailto: link";
    }
    
    setErrors(newErrors);
    return !newErrors.title && !newErrors.url;
  };

  return {
    errors,
    clearError,
    validateForm
  };
};
