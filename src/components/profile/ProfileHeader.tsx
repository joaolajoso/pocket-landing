
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileHeaderProps {
  name: string;
  bio: string;
  avatarUrl: string;
}

const ProfileHeader = ({ name, bio, avatarUrl }: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <Avatar className="w-32 h-32 border-4 border-white shadow-lg mb-4">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="text-2xl">
          {name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <h1 className="text-3xl font-bold text-center">{name}</h1>
      {bio && (
        <p className="text-center text-xl mt-2 text-muted-foreground">{bio}</p>
      )}
    </div>
  );
};

export default ProfileHeader;
