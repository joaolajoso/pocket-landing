
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";

interface DashboardHeaderProps {
  userData?: {
    id: string;
    name: string;
    bio: string;
    email: string;
    avatarUrl: string;
    username: string;
    profileViews: number;
    totalClicks: number;
  };
}

const DashboardHeader = ({ userData }: DashboardHeaderProps) => {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();

  // Use userData if provided, otherwise use profile data
  const displayName = userData?.name || profile?.name;
  const displayEmail = userData?.email || profile?.email || user?.email;
  const displayAvatar = userData?.avatarUrl || profile?.photo_url;
  
  const avatarInitials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : displayEmail?.substring(0, 2).toUpperCase() || "?";

  return (
    <header className="border-b bg-background px-4 lg:px-6">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-6">
          <Link to="/" className="text-xl font-bold flex items-center">
            <span className="text-primary">Pocket</span>CV
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={displayAvatar || ""} alt={displayName || displayEmail || ""} />
                  <AvatarFallback>{avatarInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard?tab=settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
