
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Trash2, ExternalLink, Edit, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LinkType = {
  id: string;
  title: string;
  url: string;
  icon: React.ReactNode;
};

interface LinkCardProps {
  link: LinkType;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isEditable?: boolean;
}

const LinkCard = ({ link, onEdit, onDelete, isEditable = true }: LinkCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn(
      "link-card group",
      isEditable ? "hover:bg-secondary/50" : "hover:bg-muted/30"
    )}>
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
        {link.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-medium truncate">{link.title}</h4>
        <p className="text-sm text-muted-foreground truncate">{link.url}</p>
      </div>
      
      <div className={cn(
        "flex items-center gap-1",
        isEditable ? "opacity-0 group-hover:opacity-100 transition-opacity" : ""
      )}>
        {isEditable ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete && onDelete(link.id)}
              aria-label="Delete link"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit && onEdit(link.id)}
              aria-label="Edit link"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleCopy(link.url)}
              aria-label={copied ? "Copied" : "Copy link"}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(link.url, "_blank")}
              aria-label="Open link"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default LinkCard;
