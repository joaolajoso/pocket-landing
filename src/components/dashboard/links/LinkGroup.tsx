
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LinkCard, { LinkType } from "@/components/LinkCard";
import { Edit2, Trash2, MoveUp, MoveDown, GripVertical, Eye, EyeOff, PlusCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LinkGroupProps {
  id: string;
  title: string;
  displayTitle: boolean;
  links: LinkType[];
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onMoveGroupUp: (groupId: string) => void;
  onMoveGroupDown: (groupId: string) => void;
  onToggleGroupVisibility: (groupId: string) => void;
  onOpenLinkEditor: (linkId?: string, sectionId?: string) => void;
  onDeleteLink: (linkId: string) => void;
  onMoveLinkUp: (linkId: string) => void;
  onMoveLinkDown: (linkId: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export const LinkGroup = ({
  id,
  title,
  displayTitle,
  links,
  onEditGroup,
  onDeleteGroup,
  onMoveGroupUp,
  onMoveGroupDown,
  onToggleGroupVisibility,
  onOpenLinkEditor,
  onDeleteLink,
  onMoveLinkUp,
  onMoveLinkDown,
  isFirst,
  isLast,
}: LinkGroupProps) => {
  // Fix: Make sure to pass the id parameter to all handlers
  const handleToggleVisibility = () => {
    onToggleGroupVisibility(id);
  };

  const handleMoveUp = () => {
    onMoveGroupUp(id);
  };

  const handleMoveDown = () => {
    onMoveGroupDown(id);
  };

  const handleEditGroup = () => {
    onEditGroup(id);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleVisibility}
            title={displayTitle ? "Hide section" : "Show section"}
          >
            {displayTitle ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          {!isFirst && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMoveUp}
            >
              <MoveUp className="h-4 w-4" />
            </Button>
          )}
          {!isLast && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMoveDown}
            >
              <MoveDown className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEditGroup}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Section</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the section "{title}" and all its links. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteGroup(id)}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-2 space-y-3">
        {links.map((link, index) => (
          <LinkCard
            key={link.id}
            link={link}
            onEdit={() => onOpenLinkEditor(link.id)}
            onDelete={() => onDeleteLink(link.id)}
            onMoveUp={() => index > 0 && onMoveLinkUp(link.id)}
            onMoveDown={() => index < links.length - 1 && onMoveLinkDown(link.id)}
            isEditable={true}
          />
        ))}
        
        {/* Add Link button within the section */}
        <Button 
          variant="outline" 
          className="w-full border-dashed justify-start gap-2"
          onClick={() => onOpenLinkEditor(undefined, id)}
        >
          <PlusCircle className="h-4 w-4" />
          Add Link
        </Button>
      </CardContent>
    </Card>
  );
};
