
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, ExternalLink, MoveUp, MoveDown, Linkedin, Globe, Mail, User } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CSSProperties } from "react";

export interface LinkType {
  id: string;
  title: string;
  url: string;
  icon: string | React.ReactNode;
}

interface LinkCardProps {
  link: LinkType;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isEditable: boolean;
  style?: CSSProperties;
}

const LinkCard = ({ link, onDelete, onEdit, onMoveUp, onMoveDown, isEditable, style = {} }: LinkCardProps) => {
  const [alertOpen, setAlertOpen] = useState(false);
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(link.id);
    }
    setAlertOpen(false);
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(link.id);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isEditable) {
      // Stop propagation to prevent double opening (from parent container)
      e.stopPropagation();
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Render the appropriate icon based on the icon type
  const renderIcon = () => {
    if (typeof link.icon === 'string') {
      switch (link.icon) {
        case 'linkedin':
          return <Linkedin className="h-4 w-4" />;
        case 'globe':
        case 'website':
          return <Globe className="h-4 w-4" />;
        case 'mail':
        case 'email':
          return <Mail className="h-4 w-4" />;
        case 'user':
        default:
          return <User className="h-4 w-4" />;
      }
    }
    // If it's already a ReactNode, return it as is
    return link.icon;
  };
  
  return (
    <Card className="w-full bg-card shadow-sm border">
      <CardContent className="p-4 flex items-center justify-between">
        <div 
          className={`flex items-center gap-3 ${!isEditable ? "cursor-pointer flex-1" : ""}`}
          onClick={!isEditable ? handleClick : undefined}
          style={!isEditable ? style : {}}
        >
          {renderIcon()}
          <div className="flex-1 min-w-0 max-w-full">
            <div className="font-medium truncate">{link.title || 'Untitled Link'}</div>
            <div className="text-sm text-muted-foreground truncate">{link.url}</div>
          </div>
        </div>
        
        {isEditable ? (
          <div className="flex gap-1 ml-2 shrink-0">
            {onMoveUp && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMoveUp(link.id)}>
                <MoveUp className="h-4 w-4" />
              </Button>
            )}
            {onMoveDown && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMoveDown(link.id)}>
                <MoveDown className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the link to "{link.title || 'this link'}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleClick}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkCard;
