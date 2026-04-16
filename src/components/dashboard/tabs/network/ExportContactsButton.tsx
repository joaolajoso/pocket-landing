
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useContactExport } from '@/hooks/useContactExport';

const ExportContactsButton = () => {
  const { isExporting, downloadCSV } = useContactExport();

  return (
    <Button variant="outline" size="sm" className="gap-1" disabled={isExporting} onClick={downloadCSV}>
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isExporting ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
};

export default ExportContactsButton;
