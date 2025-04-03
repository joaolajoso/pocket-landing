
import { useState } from "react";
import { 
  PlusCircle, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Pencil,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkType } from "@/components/LinkCard";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface ProfileSection {
  id: string;
  title: string;
  links: string[]; // Link IDs
}

interface ProfileSectionsTabProps {
  sections: ProfileSection[];
  onUpdateSections: (sections: ProfileSection[]) => void;
  links: LinkType[];
  onOpenLinkEditor: (linkId?: string, sectionId?: string) => void;
}

const ProfileSectionsTab = ({ sections, onUpdateSections, links, onOpenLinkEditor }: ProfileSectionsTabProps) => {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddSection = () => {
    if (!sectionTitle.trim()) {
      toast({
        title: "Section title is required",
        variant: "destructive"
      });
      return;
    }

    const newSection: ProfileSection = {
      id: `section-${Date.now()}`,
      title: sectionTitle,
      links: []
    };

    onUpdateSections([...sections, newSection]);
    setSectionTitle("");
    setIsAddDialogOpen(false);
    
    toast({
      title: "Section added",
      description: `"${sectionTitle}" has been added to your profile`
    });
  };

  const handleUpdateSection = () => {
    if (!sectionTitle.trim() || !editingSectionId) return;
    
    const updatedSections = sections.map(section =>
      section.id === editingSectionId ? { ...section, title: sectionTitle } : section
    );
    
    onUpdateSections(updatedSections);
    setSectionTitle("");
    setEditingSectionId(null);
    
    toast({
      title: "Section updated",
      description: "Your section has been updated"
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = sections.filter(section => section.id !== sectionId);
    onUpdateSections(updatedSections);
    
    toast({
      title: "Section deleted",
      description: "The section and its organization (not the links) have been removed"
    });
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updatedSections = [...sections];
    const [movedSection] = updatedSections.splice(index, 1);
    updatedSections.splice(newIndex, 0, movedSection);
    
    onUpdateSections(updatedSections);
  };

  const openEditDialog = (section: ProfileSection) => {
    setEditingSectionId(section.id);
    setSectionTitle(section.title);
  };

  const getLinkCount = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.links.length : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Profile Sections</h1>
          <p className="text-muted-foreground">Organize your links into custom sections</p>
        </div>
        
        <Button onClick={() => {
          setSectionTitle("");
          setIsAddDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Section
        </Button>
      </div>
      
      {sections.length === 0 ? (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No sections yet</h3>
            <p className="text-muted-foreground mb-6">
              Create sections to organize your profile links
            </p>
            <Button onClick={() => {
              setSectionTitle("");
              setIsAddDialogOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={section.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{getLinkCount(section.id)} links</Badge>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(section)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSection(section.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={index === 0}
                      onClick={() => handleMoveSection(index, "up")}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      disabled={index === sections.length - 1}
                      onClick={() => handleMoveSection(index, "down")}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Organize links in the "{section.title}" section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => onOpenLinkEditor(undefined, section.id)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Link to This Section
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Section Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Create a new section to organize your profile links
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Section Title"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSection}>
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Section Dialog */}
      <Dialog open={!!editingSectionId} onOpenChange={(open) => {
        if (!open) setEditingSectionId(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Section Title"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSectionId(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSection}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileSectionsTab;
