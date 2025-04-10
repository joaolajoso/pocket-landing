
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ProfileLinkCopy } from "./ProfileLinkCopy";
import { ProfileFormValues } from "./types";

interface ProfileFormFieldsProps {
  form: UseFormReturn<ProfileFormValues>;
  loading: boolean;
  onNameChange: (name: string) => void;
}

export const ProfileFormFields = ({ form, loading, onNameChange }: ProfileFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display Name</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                disabled={loading} 
                onChange={(e) => {
                  field.onChange(e);
                  onNameChange(e.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="headline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Title/Headline</FormLabel>
            <FormControl>
              <Input {...field} disabled={loading} placeholder="Software Engineer" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your profile link</FormLabel>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-muted rounded-l-md border-y border-l border-input">
                pocketcv.pt/u/
              </span>
              <FormControl>
                <Input
                  {...field}
                  className="rounded-l-none"
                  disabled={loading}
                  placeholder="yourname"
                />
              </FormControl>
              <ProfileLinkCopy username={field.value} />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={3}
                disabled={loading}
                placeholder="Tell us about yourself"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="linkedin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                disabled={loading} 
                placeholder="username or full URL" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                disabled={loading} 
                placeholder="yourwebsite.com" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
