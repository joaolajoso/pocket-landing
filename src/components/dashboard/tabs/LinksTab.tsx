
import { PlusCircle, User, Image, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LinkCard, { LinkType } from "@/components/LinkCard";

interface LinksTabProps {
  links: LinkType[];
  onOpenLinkEditor: (linkId?: string) => void;
  onDeleteLink: (linkId: string) => void;
}

const LinksTab = ({ links, onOpenLinkEditor, onDeleteLink }: LinksTabProps) => {
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
      
      <Card>
        <CardContent className="pt-6">
          {links.length > 0 ? (
            <div className="space-y-3">
              {links.map(link => (
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
      
      <Card>
        <CardHeader>
          <CardTitle>Link Templates</CardTitle>
          <CardDescription>
            Quick-add common professional links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => onOpenLinkEditor()}>
              <User className="h-8 w-8 mb-2" />
              <span className="font-medium">LinkedIn</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => onOpenLinkEditor()}>
              <Image className="h-8 w-8 mb-2" />
              <span className="font-medium">Portfolio</span>
            </Button>
            
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" onClick={() => onOpenLinkEditor()}>
              <Mail className="h-8 w-8 mb-2" />
              <span className="font-medium">Contact Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinksTab;
