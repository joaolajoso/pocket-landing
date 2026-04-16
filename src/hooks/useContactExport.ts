
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ContactExportData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  created_at: string;
  follow_up_date?: string | null;
  description?: string | null;
}

export const useContactExport = () => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const fetchAllContacts = async (): Promise<ContactExportData[]> => {
    if (!user?.id) return [];

    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('profile_owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const escapeCSVField = (field: string | null | undefined): string => {
    if (!field) return '';
    
    // Convert to string and handle special characters
    const stringField = String(field);
    
    // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    
    return stringField;
  };

  const convertToCSV = (contacts: ContactExportData[]): string => {
    // English column headers including description
    const headers = ['Name', 'Email', 'Phone', 'CaptureDate', 'CaptureTime', 'FollowUpDate', 'Description', 'Message'];
    
    // Create array with the data
    const csvData = [headers];
    
    contacts.forEach(contact => {
      const row = [
        escapeCSVField(contact.name),
        escapeCSVField(contact.email),
        escapeCSVField(contact.phone),
        escapeCSVField(format(new Date(contact.created_at), 'dd/MM/yyyy')),
        escapeCSVField(format(new Date(contact.created_at), 'HH:mm:ss')),
        contact.follow_up_date ? escapeCSVField(format(new Date(contact.follow_up_date), 'dd/MM/yyyy')) : '',
        escapeCSVField(contact.description),
        escapeCSVField(contact.message)
      ];
      csvData.push(row);
    });

    // Convert to CSV with comma separator
    return csvData.map(row => row.join(',')).join('\r\n');
  };

  const downloadCSV = async () => {
    try {
      setIsExporting(true);
      const contacts = await fetchAllContacts();
      
      if (contacts.length === 0) {
        toast.error('No contacts found to export');
        return;
      }

      const csvContent = convertToCSV(contacts);
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${contacts.length} contacts exported successfully!`);
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast.error('Error exporting contacts');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    downloadCSV
  };
};
