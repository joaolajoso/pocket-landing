
import { Link } from "react-router-dom";
import { Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";

interface WelcomeHeaderProps {
  firstName: string;
}

const WelcomeHeader = ({ firstName }: WelcomeHeaderProps) => {
  const { toast } = useToast();
  const { profile } = useProfile();
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  
  const getProfileUrl = (slug: string) => {
    return `https://pocketcv.pt/u/${slug}`;
  };
  
  const handleShareProfile = () => {
    if (!profile?.slug) {
      toast({
        title: t.messages.usernameNotSet,
        description: t.messages.usernameNotSetDescription,
        variant: "destructive"
      });
      return;
    }
    
    const profileUrl = getProfileUrl(profile.slug);
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: t.messages.linkCopied,
      description: t.messages.linkCopiedDescription,
    });
  };
  
  const handleViewPublicProfile = () => {
    if (!profile?.slug) {
      toast({
        title: t.messages.usernameNotSet,
        description: t.messages.usernameNotSetDescription,
        variant: "destructive"
      });
      return;
    }
    
    const profileUrl = getProfileUrl(profile.slug);
    window.open(profileUrl, '_blank');
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">{t.overview.welcome}, {firstName || 'there'}</h1>
        <p className="text-muted-foreground">{t.overview.subtitle}</p>
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleViewPublicProfile}>
          <Eye className="mr-2 h-4 w-4" />
          {t.overview.quickActions.viewPublicPage}
        </Button>
        
        <Button className="bg-[#8c52ff] hover:bg-[#8c52ff]/90" onClick={handleShareProfile}>
          <Share2 className="mr-2 h-4 w-4" />
          {t.overview.quickActions.shareProfile}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeHeader;
