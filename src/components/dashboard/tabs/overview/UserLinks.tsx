
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LinkCard, { LinkType } from "@/components/LinkCard";
import { useState, useEffect } from "react";

interface UserLinksProps {
  links: LinkType[];
  onOpenLinkEditor: (linkId?: string) => void;
  onDeleteLink: (linkId: string) => void;
  onNavigateToLinksTab: () => void;
}

const UserLinks = ({ 
  links, 
  onOpenLinkEditor, 
  onDeleteLink,
  onNavigateToLinksTab 
}: UserLinksProps) => {
  const [currentLinks, setCurrentLinks] = useState<LinkType[]>(links);

  // Update when props change
  useEffect(() => {
    setCurrentLinks(links);
  }, [links]);

  const handleMoveUp = (linkId: string) => {
    setCurrentLinks(prevLinks => {
      const index = prevLinks.findIndex(link => link.id === linkId);
      if (index <= 0) return prevLinks;
      
      const newLinks = [...prevLinks];
      const temp = newLinks[index];
      newLinks[index] = newLinks[index - 1];
      newLinks[index - 1] = temp;
      
      return newLinks;
    });
  };

  const handleMoveDown = (linkId: string) => {
    setCurrentLinks(prevLinks => {
      const index = prevLinks.findIndex(link => link.id === linkId);
      if (index < 0 || index >= prevLinks.length - 1) return prevLinks;
      
      const newLinks = [...prevLinks];
      const temp = newLinks[index];
      newLinks[index] = newLinks[index + 1];
      newLinks[index + 1] = temp;
      
      return newLinks;
    });
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Your Links</CardTitle>
        <CardDescription>
          Manage your professional links
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {currentLinks.length > 0 ? (
          currentLinks.slice(0, 3).map(link => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={onOpenLinkEditor}
              onDelete={onDeleteLink}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isEditable={true}
            />
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No links added yet</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onNavigateToLinksTab} 
          variant="outline" 
          className="w-full bg-gradient-to-r from-[#FE6479] to-[#8B5CF6] text-white hover:from-[#FE6479] hover:to-[#9B87F5] border-none"
        >
          View All Links
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserLinks;
