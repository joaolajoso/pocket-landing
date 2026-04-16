
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface FormFooterProps {
  onCancel: () => void;
  maxLinksReached?: boolean;
}

const FormFooter = ({ onCancel, maxLinksReached }: FormFooterProps) => {
  return (
    <DialogFooter className="pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={maxLinksReached}>
        {maxLinksReached ? "Limite de 5 links atingido" : "Save"}
      </Button>
    </DialogFooter>
  );
};

export default FormFooter;
