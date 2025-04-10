
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";

interface ProfileHeaderProps {
  name: string;
  bio: string;
  headline?: string;
  avatarUrl: string;
  nameColor?: string;
  bioColor?: string;
}

const ProfileHeader = ({ 
  name, 
  bio, 
  headline, 
  avatarUrl,
  nameColor,
  bioColor 
}: ProfileHeaderProps) => {
  const initials = useMemo(() => {
    return name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [name]);

  return (
    <div className="flex flex-col items-center mb-8">
      <Avatar className="w-24 h-24 mb-4">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      
      <h1 
        className="text-2xl font-bold text-center"
        style={{ color: nameColor || 'var(--profile-name-color, inherit)' }}
      >
        {name}
      </h1>
      
      {headline && (
        <p 
          className="mt-1 text-muted-foreground font-medium text-center"
          style={{ color: bioColor || 'var(--profile-description-color, var(--muted-foreground))' }}
        >
          {headline}
        </p>
      )}
      
      {bio && (
        <p 
          className="mt-2 text-muted-foreground text-center max-w-sm"
          style={{ color: bioColor || 'var(--profile-description-color, var(--muted-foreground))' }}
        >
          {bio}
        </p>
      )}
    </div>
  );
};

export default ProfileHeader;
