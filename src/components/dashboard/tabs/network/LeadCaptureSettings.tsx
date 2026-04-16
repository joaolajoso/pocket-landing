
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, MessageCircle, Info, Calendar, ChevronDown } from 'lucide-react';
import { useLeadCaptureSettings } from '@/hooks/useLeadCaptureSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const LeadCaptureSettings = () => {
  const { 
    leadCaptureEnabled, 
    followUpReminderDays, 
    loading, 
    error, 
    updateLeadCaptureSettings,
    updateFollowUpReminderDays 
  } = useLeadCaptureSettings();
  
  const [daysInput, setDaysInput] = useState(followUpReminderDays.toString());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setDaysInput(followUpReminderDays.toString());
  }, [followUpReminderDays]);

  const handleToggle = async (enabled: boolean) => {
    await updateLeadCaptureSettings(enabled);
  };

  const handleDaysChange = (value: string) => {
    setDaysInput(value);
  };

  const handleDaysBlur = async () => {
    const days = parseInt(daysInput);
    if (isNaN(days) || days < 1 || days > 30) {
      toast.error('Please enter a valid number between 1 and 30');
      setDaysInput(followUpReminderDays.toString());
      return;
    }
    
    const success = await updateFollowUpReminderDays(days);
    if (success) {
      toast.success(`Follow-up reminder set to ${days} business days`);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Lead Capture
                </CardTitle>
                <CardDescription className="mt-1">
                  Control whether the lead capture form is displayed on your profile
                </CardDescription>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {error && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Error loading settings: {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="lead-capture-toggle" className="text-sm font-medium">
                  Enable Lead Capture
                </Label>
                <p className="text-sm text-muted-foreground">
                  When active, visitors will see a floating button and popup to contact you
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Switch 
                  id="lead-capture-toggle"
                  checked={leadCaptureEnabled}
                  onCheckedChange={handleToggle}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="follow-up-days" className="text-sm font-medium">
                    Automatic Follow-up Reminder
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set how many business days after receiving a contact you want to be reminded to follow up
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    id="follow-up-days"
                    type="number"
                    min="1"
                    max="30"
                    value={daysInput}
                    onChange={(e) => handleDaysChange(e.target.value)}
                    onBlur={handleDaysBlur}
                    className="w-20"
                    disabled={loading}
                  />
                  <span className="text-sm text-muted-foreground">business days (Mon-Fri)</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">How it works:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Floating button appears in the bottom right corner of your profile</li>
                <li>• Contact popup occupies 2/3 of the screen when activated</li>
                <li>• Visitors can fill out a form to contact you</li>
                <li>• You receive the messages in the "Lead Capture" tab above</li>
                <li>• Follow-up dates are automatically set based on your reminder settings</li>
                <li>• Business days exclude weekends (Saturday and Sunday)</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default LeadCaptureSettings;
