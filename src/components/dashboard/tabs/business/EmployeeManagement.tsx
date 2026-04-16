
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Mail, MoreHorizontal } from "lucide-react";
import { Organization, OrganizationMember } from "@/hooks/organization/useOrganization";

interface EmployeeManagementProps {
  organization: Organization;
  members: OrganizationMember[];
  userRole: string | null;
}

const EmployeeManagement = ({ organization, members, userRole }: EmployeeManagementProps) => {
  const canManageEmployees = userRole === 'owner' || userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-muted-foreground">Manage your organization's employees</p>
        </div>
        {canManageEmployees && (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Employee
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.profile?.photo_url || ""} />
                    <AvatarFallback>
                      {member.profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{member.profile?.name || 'Unknown'}</h4>
                    <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
                    {member.position && (
                      <p className="text-xs text-muted-foreground">{member.position}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="capitalize">
                    {member.role}
                  </Badge>
                  {member.department && (
                    <Badge variant="secondary">{member.department}</Badge>
                  )}
                  {canManageEmployees && (
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmployeeManagement;
