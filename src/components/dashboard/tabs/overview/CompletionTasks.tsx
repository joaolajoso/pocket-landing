
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkIcon, Mail, User } from "lucide-react";

interface CompletionTasksProps {
  onOpenLinkEditor: () => void;
}

const CompletionTasks = ({ onOpenLinkEditor }: CompletionTasksProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Take these steps to get the most out of your PocketCV
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Add a profile picture</h4>
                <p className="text-sm text-muted-foreground">Help others recognize you</p>
              </div>
            </div>
            <Button size="sm">Upload</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Add more links</h4>
                <p className="text-sm text-muted-foreground">Connect all your professional profiles</p>
              </div>
            </div>
            <Button size="sm" onClick={onOpenLinkEditor}>Add Link</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Verify your email</h4>
                <p className="text-sm text-muted-foreground">Confirm your email address</p>
              </div>
            </div>
            <Button size="sm" variant="outline">Resend</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionTasks;
