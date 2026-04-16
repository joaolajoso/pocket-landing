
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { format, differenceInDays, parseISO, isAfter, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { Mail, Phone, Calendar, Search, Loader2, UserPlus, X, ExternalLink, RefreshCw, Clock, FileText, Edit3, Save, Download, Paperclip } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import ExportContactsButton from './ExportContactsButton';
import LeadCaptureSettings from './LeadCaptureSettings';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  created_at: string;
  follow_up_date?: string | null;
  description?: string | null;
  file_url?: string | null;
  file_name?: string | null;
}

const ContactSubmissions = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'week' | 'overdue'>('all');

  const fetchContactSubmissions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('profile_owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContacts(data || []);
    } catch (err: any) {
      console.error('Error fetching contact submissions:', err);
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactSubmissions();
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContactSubmissions();
    setRefreshing(false);
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', contactToDelete);

      if (error) throw error;

      setContacts(contacts.filter(contact => contact.id !== contactToDelete));
      setShowDeleteDialog(false);
      toast.success("Contact removed successfully");
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      toast.error("Error removing contact");
    }
  };

  const confirmDelete = (id: string) => {
    setContactToDelete(id);
    setShowDeleteDialog(true);
  };

  const openDescriptionDialog = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    setSelectedContactId(id);
    setEditingDescription(contact?.description || '');
    setShowDescriptionDialog(true);
  };

  const saveDescription = async () => {
    if (!selectedContactId) return;
    
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ description: editingDescription || null })
        .eq('id', selectedContactId);
      
      if (error) throw error;
      
      // Update the local state
      setContacts(contacts.map(contact => 
        contact.id === selectedContactId 
          ? { ...contact, description: editingDescription || null } 
          : contact
      ));
      
      setShowDescriptionDialog(false);
      toast.success("Description saved successfully");
    } catch (err: any) {
      console.error('Error saving description:', err);
      toast.error("Error saving description");
    }
  };
  
  const getFollowUpStatus = (followUpDate: string | null | undefined) => {
    if (!followUpDate) return { color: 'default', text: 'No date', isOverdue: false };
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      const dueDate = parseISO(followUpDate);
      dueDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      const daysRemaining = differenceInDays(dueDate, today);
      const isOverdue = isAfter(today, dueDate);
      
      if (isOverdue) {
        return { color: 'destructive', text: 'Overdue', isOverdue: true };
      } else if (daysRemaining === 0) {
        return { color: 'orange', text: 'Today', isOverdue: false };
      } else if (daysRemaining <= 3) {
        return { color: 'warning', text: `In ${daysRemaining} days`, isOverdue: false };
      } else if (daysRemaining <= 7) {
        return { color: 'secondary', text: `In ${daysRemaining} days`, isOverdue: false };
      } else {
        return { color: 'success', text: `In ${daysRemaining} days`, isOverdue: false };
      }
    } catch (err) {
      console.error('Error parsing follow_up_date:', err);
      return { color: 'destructive', text: 'Invalid date', isOverdue: false };
    }
  };
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'destructive': return 'destructive';
      case 'orange': return 'default'; // Using default with custom styling
      case 'warning': return 'warning';
      case 'secondary': return 'secondary'; 
      case 'success': return 'success';
      default: return 'secondary';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.email.toLowerCase().includes(searchLower) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchLower)) ||
      (contact.description && contact.description.toLowerCase().includes(searchLower))
    );

    if (!matchesSearch) return false;

    // Date/Status filter
    if (filterTab === 'all') return true;

    if (!contact.follow_up_date) {
      return false;
    }

    const today = startOfDay(new Date());
    const followUpDate = startOfDay(parseISO(contact.follow_up_date));
    const isOverdue = isAfter(today, followUpDate);

    if (filterTab === 'today') {
      return format(followUpDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    } else if (filterTab === 'week') {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      return followUpDate >= weekStart && followUpDate <= weekEnd;
    } else if (filterTab === 'overdue') {
      return isOverdue;
    }

    return true;
  });

  const getFilterCount = (filter: 'all' | 'today' | 'week' | 'overdue') => {
    if (filter === 'all') return contacts.length;

    return contacts.filter(contact => {
      if (!contact.follow_up_date) return false;

      const today = startOfDay(new Date());
      const followUpDate = startOfDay(parseISO(contact.follow_up_date));
      const isOverdue = isAfter(today, followUpDate);

      if (filter === 'today') {
        return format(followUpDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      } else if (filter === 'week') {
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        return followUpDate >= weekStart && followUpDate <= weekEnd;
      } else if (filter === 'overdue') {
        return isOverdue;
      }

      return false;
    }).length;
  };

  if (!loading && contacts.length === 0) {
    return (
      <div className="space-y-4">
        <LeadCaptureSettings />
        
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Contacts Received</h3>
          <div className="flex gap-2">
            <ExportContactsButton />
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="mb-2">No contacts received</CardTitle>
            <CardDescription className="max-w-md">
              When someone shares their contact details by visiting your profile, they will appear here.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LeadCaptureSettings />
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Contacts Received</h3>
        <div className="flex gap-2">
          <ExportContactsButton />
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <Tabs value={filterTab} onValueChange={(value) => setFilterTab(value as typeof filterTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Todos ({getFilterCount('all')})
            </TabsTrigger>
            <TabsTrigger value="today" className="text-xs sm:text-sm">
              Hoje ({getFilterCount('today')})
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs sm:text-sm">
              Esta Semana ({getFilterCount('week')})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="text-xs sm:text-sm">
              Atrasados ({getFilterCount('overdue')})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {searchTerm && (
            <Button variant="ghost" size="icon" onClick={() => setSearchTerm('')}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 p-3 rounded-md text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredContacts.length > 0 ? (
        <div className="space-y-4">
          {filteredContacts.map((contact) => {
            const followUpStatus = getFollowUpStatus(contact.follow_up_date);
            const statusVariant = getStatusVariant(followUpStatus.color);
            
            return (
              <Card key={contact.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 bg-primary/10">
                        <AvatarFallback className="text-primary">
                          {contact.name.split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base font-medium">{contact.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => confirmDelete(contact.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a 
                        href={`mailto:${contact.email}`} 
                        className="text-primary hover:underline truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                    
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a 
                          href={`tel:${contact.phone}`} 
                          className="text-primary hover:underline"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Follow-up:</span>
                      <Badge 
                        variant={statusVariant}
                        className={`${
                          followUpStatus.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 
                          followUpStatus.isOverdue ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' : ''
                        }`}
                      >
                        {contact.follow_up_date 
                          ? `${followUpStatus.text} (${format(parseISO(contact.follow_up_date), 'dd/MM/yyyy')})`
                          : followUpStatus.text
                        }
                      </Badge>
                    </div>

                    {contact.description && (
                      <div className="flex items-start gap-2 text-sm mt-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-muted-foreground text-xs">Description:</span>
                          <p className="text-sm mt-1 p-2 bg-muted/50 rounded border-l-2 border-primary/20">
                            {contact.description}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {contact.file_url && contact.file_name && (
                      <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-muted/50 rounded-lg border">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                          {contact.file_name.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                              src={`${contact.file_url}#page=1&view=FitH`}
                              className="w-full h-full pointer-events-none scale-[1.5] origin-top-left"
                              title="Preview"
                              tabIndex={-1}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contact.file_name}</p>
                          <p className="text-xs text-muted-foreground">Ficheiro anexado</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-8" asChild>
                          <a href={contact.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    )}

                    {contact.message && (
                      <div className="mt-2 text-sm border-l-2 border-muted pl-3 py-1">
                        <span className="text-muted-foreground text-xs">Message:</span>
                        <p className="mt-1">{contact.message}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-3">
                  <div className="flex flex-wrap gap-2 w-full">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      asChild
                    >
                      <a href={`mailto:${contact.email}`}>
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        Reply
                      </a>
                    </Button>
                    
                    {contact.phone && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 text-xs"
                        asChild
                      >
                        <a href={`tel:${contact.phone}`}>
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          Call
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => openDescriptionDialog(contact.id)}
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1" />
                      {contact.description ? 'Edit Description' : 'Add Description'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-muted-foreground">No contacts found for "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this contact? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Description</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Add a description to remember why you spoke with this person:
              </p>
              <Textarea
                placeholder="e.g., Met at networking event, interested in collaboration, potential client..."
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDescriptionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveDescription}>
              <Save className="h-4 w-4 mr-1" />
              Save Description
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactSubmissions;
