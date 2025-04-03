
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
  onSave: (link: Omit<LinkType, "id"> & {id?: string, section?: string}) => void;
  editingLink?: LinkType & {section?: string};
  sections?: {id: string, title: string}[];
}

const LinkEditor = ({ isOpen, onClose, onSave, editingLink, sections = [] }: LinkEditorProps) => {
  const handleSave = (link: Omit<LinkType, "id"> & {id?: string, section?: string}) => {
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
          sections={sections}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LinkEditor;
