
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LinkCard, { LinkType } from "@/components/LinkCard";
import { useProfileDesign } from "@/hooks/profile/useProfileDesign";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProfileDesignPreview from "./appearance/ProfileDesignPreview";

interface LinksTabProps {
  links: LinkType[];
  onOpenLinkEditor: (linkId?: string) => void;
  onDeleteLink: (linkId: string) => void;
}

const LinksTab = ({ links, onOpenLinkEditor, onDeleteLink }: LinksTabProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { settings } = useProfileDesign();
  const [saving, setSaving] = useState(false);
  const [currentLinks, setCurrentLinks] = useState<LinkType[]>(links);

  const handleSaveProfile = async (linkData: LinkType) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to save links",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Update the profile with the new link data
      const linkField = getLinkFieldName(linkData);
      
      if (linkField) {
        const { error } = await supabase
          .from('profiles')
          .update({ [linkField]: linkData.url })
          .eq('id', user.id);
        
        if (error) throw error;
        
        toast({
          title: "Link updated",
          description: `Your ${linkData.title} link has been updated.`
        });
      }
    } catch (error) {
      console.error('Error saving link:', error);
      toast({
        title: "Error saving link",
        description: "There was a problem updating your profile link",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper function to map link types to profile fields
  const getLinkFieldName = (link: LinkType): string | null => {
    const title = link.title.toLowerCase();
    if (title.includes('linkedin')) return 'linkedin';
    if (title.includes('website') || title.includes('portfolio')) return 'website';
    if (title.includes('email')) return 'email';
    return null;
  };

  // Create user data for the preview
  const userData = {
    name: profile?.name || user?.email?.split('@')[0] || 'User',
    bio: profile?.bio || 'Your professional bio',
    avatarUrl: profile?.photo_url || '',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Links</h1>
          <p className="text-muted-foreground">Add and organize your professional links</p>
        </div>
        
        <Button onClick={() => onOpenLinkEditor()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Link
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="pt-6">
              {currentLinks.length > 0 ? (
                <div className="space-y-3">
                  {currentLinks.map(link => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onEdit={onOpenLinkEditor}
                      onDelete={onDeleteLink}
                      isEditable={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No links yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add your first link to start building your profile
                  </p>
                  <Button onClick={() => onOpenLinkEditor()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Live Preview</h3>
          <ProfileDesignPreview 
            userData={userData}
            links={currentLinks}
            designSettings={settings}
          />
        </div>
      </div>
    </div>
  );
};

export default LinksTab;
