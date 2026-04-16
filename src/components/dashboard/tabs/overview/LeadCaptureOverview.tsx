
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, Mail, Phone, Calendar, ArrowRight } from "lucide-react";
import { useContactSubmissions } from "@/hooks/network/useContactSubmissions";
import { useLeadCaptureSettings } from "@/hooks/useLeadCaptureSettings";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface LeadCaptureOverviewProps {
  onNavigateToNetwork: () => void;
}

const LeadCaptureOverview = ({ onNavigateToNetwork }: LeadCaptureOverviewProps) => {
  const { submissions, loading } = useContactSubmissions();
  const { leadCaptureEnabled, updateLeadCaptureSettings, loading: settingsLoading } = useLeadCaptureSettings();
  const { toast } = useToast();
  
  // Show the 3 most recent submissions
  const recentSubmissions = submissions.slice(0, 3);
  
  const handleToggleLeadCapture = async (enabled: boolean) => {
    const success = await updateLeadCaptureSettings(enabled);
    if (success) {
      toast({
        title: enabled ? "Lead Capture Enabled" : "Lead Capture Disabled",
        description: enabled 
          ? "Visitors can now submit contact forms on your profile" 
          : "Contact form has been disabled on your profile",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update lead capture settings",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-medium truncate">Lead Capture</CardTitle>
          <CardDescription className="text-xs truncate">Recent contact form submissions</CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">
              {leadCaptureEnabled ? 'Ativado' : 'Desativado'}
            </p>
            <p className="text-xs text-muted-foreground">
              {leadCaptureEnabled ? 'Aceitar contatos' : 'Não aceitar contatos'}
            </p>
          </div>
          <Switch
            checked={leadCaptureEnabled}
            onCheckedChange={handleToggleLeadCapture}
            disabled={settingsLoading}
            className="flex-shrink-0"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentSubmissions.length > 0 ? (
          <div className="space-y-4">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="border-l-2 border-primary/20 pl-3 md:pl-4 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{submission.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{submission.email}</span>
                    </div>
                    {submission.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{submission.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{format(new Date(submission.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    New
                  </Badge>
                </div>
              </div>
            ))}
            
            {submissions.length > 3 && (
              <div className="text-center pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onNavigateToNetwork}
                  className="text-xs"
                >
                  View {submissions.length - 3} more submissions
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No contact submissions yet</p>
            <p className="text-xs mt-1">Submissions will appear here when visitors contact you</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadCaptureOverview;
