
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getProfileUrl } from "@/lib/supabase";

interface ProfileLinkCopyProps {
  username: string;
}

export const ProfileLinkCopy = ({ username }: ProfileLinkCopyProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const copyProfileLink = () => {
    if (!username) {
      toast({
        title: "No username set",
        description: "Please set a username first",
        variant: "destructive"
      });
      return;
    }
    
    const profileUrl = getProfileUrl(username);
    navigator.clipboard.writeText(profileUrl);
    
    setCopied(true);
    toast({
      title: "Profile link copied",
      description: `${profileUrl} copied to clipboard`
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="ml-2"
      onClick={copyProfileLink}
      disabled={!username}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};
