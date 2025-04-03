
import { LinkType } from "@/components/LinkCard";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LinkEditorForm } from "./LinkEditorForm";

interface LinkEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Omit<LinkType, "id"> & {id?: string}) => void;
  editingLink?: LinkType;
}

const LinkEditor = ({ isOpen, onClose, onSave, editingLink }: LinkEditorProps) => {
  const handleSave = (link: Omit<LinkType, "id"> & {id?: string}) => {
    onSave(link);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingLink ? "Edit Link" : "Add New Link"}</DialogTitle>
        </DialogHeader>
        
        <LinkEditorForm 
          onSave={handleSave}
          onCancel={onClose}
          editingLink={editingLink}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LinkEditor;
