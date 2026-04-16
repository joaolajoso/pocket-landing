
import React, { useState } from 'react';
import { downloadVCard } from '@/lib/vcard';
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useActiveEventContext } from '@/hooks/useActiveEventContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SaveContactButtonProps {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  bio?: string;
  photoUrl?: string;
  publicLinks?: Array<{title: string; url: string}>;
  profileUrl?: string;
  jobTitle?: string;
  headline?: string;
  className?: string;
  profileOwnerId?: string;
}

const SaveContactButton = ({
  name,
  email,
  phone,
  website,
  bio,
  photoUrl,
  publicLinks,
  profileUrl,
  jobTitle,
  headline,
  className,
  profileOwnerId
}: SaveContactButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { eventId, isActive } = useActiveEventContext();
  const { user } = useAuth();
  
  const handleSaveContact = async () => {
    try {
      setIsGenerating(true);
      
      // Download vCard with iOS-compatible approach
      downloadVCard({
        name,
        email,
        phone,
        website,
        bio,
        photoUrl,
        publicLinks,
        profileUrl,
        jobTitle,
        headline
      });
      
      // Capture event metric if in active event context
      if (eventId && isActive && profileOwnerId) {
        try {
          await supabase.rpc('capture_event_metric', {
            _event_id: eventId,
            _participant_id: profileOwnerId,
            _metric_type: 'lead_capture',
            _metadata: {
              saved_by: user?.id || 'anonymous',
              timestamp: new Date().toISOString(),
              name: name,
              action: 'contact_saved'
            }
          });
          console.log('Event metric captured successfully');
        } catch (metricError) {
          console.error('Failed to capture event metric:', metricError);
          // Don't block contact save if metric capture fails
        }
      }

      toast({
        title: "Contacto salvo",
        description: "O contacto foi salvo com sucesso com foto e links!",
      });
    } catch (error) {
      console.error("Error generating contact:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o contacto.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button 
      onClick={handleSaveContact}
      disabled={isGenerating}
      className={cn(
        "w-auto px-8 py-3 h-12 rounded-full bg-gradient-to-r from-[#FE6479] to-[#8B5CF6] text-white hover:from-[#FE6479] hover:to-[#9B87F5] border-none",
        className
      )}
    >
      <UserRound className="mr-2 h-4 w-4" />
      {isGenerating ? "Gerando..." : "Salvar Contacto"}
    </Button>
  );
};

export default SaveContactButton;
