
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsTabProps {
  userData: {
    name: string;
    email: string;
    username: string;
  };
}

const SettingsTab = ({ userData }: SettingsTabProps) => {
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
              <Input id="settings-name" defaultValue={userData.name} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email Address</Label>
              <Input id="settings-email" type="email" defaultValue={userData.email} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="settings-username">Username</Label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-muted rounded-l-md border-y border-l border-input">
                  {window.location.host}/u/
                </span>
                <Input
                  id="settings-username"
                  className="rounded-l-none"
                  defaultValue={userData.username}
                />
              </div>
            </div>
          </div>
          
          <Button>Save Changes</Button>
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
              <Input id="current-password" type="password" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          
          <Button>Update Password</Button>
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
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
