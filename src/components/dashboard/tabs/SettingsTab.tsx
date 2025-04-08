
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SettingsTabProps {
  userData: {
    name: string;
    email: string;
    username: string;
  };
}

const SettingsTab = ({ userData }: SettingsTabProps) => {
  const { user } = useAuth();
  const { profile, updateProfile, loading } = useProfile();
  const { toast } = useToast();
  
  const [settingsData, setSettingsData] = useState({
    name: profile?.name || userData.name,
    email: user?.email || userData.email,
    username: profile?.slug || userData.username,
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      await updateProfile({
        name: settingsData.name,
        slug: settingsData.username,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };
  
  const handleUpdatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Full Name</Label>
              <Input 
                id="settings-name" 
                name="name" 
                value={settingsData.name || ''} 
                onChange={handleSettingsChange} 
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email Address</Label>
              <Input 
                id="settings-email" 
                type="email" 
                name="email" 
                value={settingsData.email} 
                readOnly 
                disabled 
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="settings-username">Username</Label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-muted rounded-l-md border-y border-l border-input">
                  {window.location.host}/u/
                </span>
                <Input
                  id="settings-username"
                  name="username"
                  className="rounded-l-none"
                  value={settingsData.username || ''}
                  onChange={handleSettingsChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                name="currentPassword" 
                type="password" 
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                name="newPassword" 
                type="password" 
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                name="confirmPassword" 
                type="password" 
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </div>
          
          <Button onClick={handleUpdatePassword}>Update Password</Button>
        </CardContent>
      </Card>
      
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
