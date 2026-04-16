
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telemóvel</FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={loading}
                placeholder="+351 912 345 678"
                type="tel"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-medium">Privacidade</h3>
        
        <FormField
          control={form.control}
          name="share_email_publicly"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Email Público</FormLabel>
                <FormDescription>
                  Permitir que o seu email seja visível no perfil público
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="share_phone_publicly"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Telemóvel Público</FormLabel>
                <FormDescription>
                  Permitir que o seu telemóvel seja visível no perfil público
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

    </>
  );
};
