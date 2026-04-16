import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { Shield } from 'lucide-react';
import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const AdminAuditLogs = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Force dark mode for admin pages
    setTheme('dark');
  }, [setTheme]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Auditoria & Compliance</h1>
            <p className="text-muted-foreground">
              Sistema de auditoria GDPR com retenção de 2 anos
            </p>
          </div>
        </div>
        
        <AuditLogViewer />
      </div>
    </div>
  );
};

export default AdminAuditLogs;
