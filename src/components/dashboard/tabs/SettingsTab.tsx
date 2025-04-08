
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SettingsFormValues {
  name: string;
  email: string;
  username: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsTab = () => {
  const { user } = useAuth();
  const { profile, updateProfile, loading, refreshProfile } = useProfile();
  const { toast } = useToast();
  
  const settingsForm = useForm<SettingsFormValues>({
    defaultValues: {
      name: profile?.name || "",
      email: user?.email || "",
      username: profile?.slug || ""
    }
  });
  
  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });
  
  // Update form when profile data changes
  useEffect(() => {
    if (profile && user) {
      settingsForm.reset({
        name: profile.name || "",
        email: user.email || "",
        username: profile.slug || ""
      });
    }
  }, [profile, user, settingsForm]);
  
  const handleSaveSettings = async (values: SettingsFormValues) => {
    try {
      await updateProfile({
        name: values.name,
        slug: values.username,
      });
      
      toast({
        title: "Settings updated",
        description: "Your account settings have been saved"
      });
      
      refreshProfile();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error updating settings",
        description: "There was a problem saving your changes",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdatePassword = async (values: PasswordFormValues) => {
    if (values.newPassword !== values.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your new passwords match',
        variant: 'destructive',
      });
      return;
    }
    
    // Password update functionality will be implemented in future
    toast({
      title: 'Feature coming soon',
      description: 'Password update functionality will be available soon',
    });
  };
  
  const handleDeleteAccount = () => {
    // Account deletion functionality will be implemented in future
    toast({
      title: 'Feature coming soon',
      description: 'Account deletion functionality will be available soon',
    });
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>
      
      <Form {...settingsForm}>
        <form onSubmit={settingsForm.handleSubmit(handleSaveSettings)}>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={settingsForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={settingsForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly disabled />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={settingsForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <div className="flex items-center">
                        <span className="px-3 py-2 bg-muted rounded-l-md border-y border-l border-input">
                          {window.location.host}/u/
                        </span>
                        <FormControl>
                          <Input
                            {...field}
                            className="rounded-l-none"
                            disabled={loading}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
      
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)}>
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit">Update Password</Button>
            </CardContent>
          </Card>
        </form>
      </Form>
      
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Be careful with these actions, they cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md">
            <h3 className="font-medium text-destructive mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete your account and all associated data.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
