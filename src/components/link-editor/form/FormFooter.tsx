
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface FormFooterProps {
  onCancel: () => void;
}

const FormFooter = ({ onCancel }: FormFooterProps) => {
  return (
    <DialogFooter className="pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">Save</Button>
    </DialogFooter>
  );
};

export default FormFooter;
