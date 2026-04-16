import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AcceptInvitationDialog from "./AcceptInvitationDialog";

interface Invitation {
  id: string;
  invitation_token: string;
  organization_id: string;
  organization_name: string;
  role: string;
  permissions_requested: string[];
  invited_by_name: string;
}

export const InvitationNotificationPopup = () => {
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [currentInvitation, setCurrentInvitation] = useState<Invitation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchPendingInvitations = async () => {
      // Get user's profile to check email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o perfil.",
          variant: "destructive",
        });
        return;
      }

      if (!profile?.email) {
        console.log("No email found in profile");
        return;
      }

      // Fetch pending invitations for this email
      const { data: invitations, error } = await supabase
        .from("organization_invitations")
        .select(`
          id,
          invitation_token,
          organization_id,
          role,
          permissions_requested,
          organizations(name),
          invited_by
        `)
        .eq("email", profile.email)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString());

      if (error) {
        console.error("Error fetching invitations:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar convites pendentes.",
          variant: "destructive",
        });
        return;
      }

      const formattedInvitations = invitations?.map((inv: any) => ({
        id: inv.id,
        invitation_token: inv.invitation_token,
        organization_id: inv.organization_id,
        organization_name: inv.organizations?.name || "Organização",
        role: inv.role,
        permissions_requested: inv.permissions_requested || [],
        invited_by_name: "Administrador",
      })) || [];

      setPendingInvitations(formattedInvitations);

      if (formattedInvitations.length > 0) {
        setCurrentInvitation(formattedInvitations[0]);
        setIsDialogOpen(true);
      }
    };

    fetchPendingInvitations();
  }, [user?.id]);

  const handleClose = () => {
    setIsDialogOpen(false);
    
    setTimeout(() => {
      if (pendingInvitations.length > 1) {
        const nextInvitations = pendingInvitations.slice(1);
        setPendingInvitations(nextInvitations);
        setCurrentInvitation(nextInvitations[0]);
        setIsDialogOpen(true);
      }
    }, 500);
  };

  if (!currentInvitation) return null;

  return (
    <AcceptInvitationDialog
      isOpen={isDialogOpen}
      onClose={handleClose}
      invitationToken={currentInvitation.invitation_token}
      organizationName={currentInvitation.organization_name}
      role={currentInvitation.role}
      permissionsRequested={currentInvitation.permissions_requested}
    />
  );
};
