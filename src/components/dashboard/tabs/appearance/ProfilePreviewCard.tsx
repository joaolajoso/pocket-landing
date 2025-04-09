
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { LinkType } from "@/components/LinkCard";

interface ProfilePreviewCardProps {
  userData: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  links: LinkType[];
  backgroundColor: string;
  buttonStyle: string;
  font: string;
  primaryColor: string;
  onPreview: () => void;
}

const ProfilePreviewCard = ({ 
  userData, 
  links, 
  backgroundColor, 
  buttonStyle,
  font,
  primaryColor,
  onPreview 
}: ProfilePreviewCardProps) => {
  // Apply preview styles
  useEffect(() => {
    const previewCard = document.getElementById('profile-preview-card');
    if (previewCard) {
      previewCard.style.backgroundColor = backgroundColor;
      previewCard.style.fontFamily = `${font.charAt(0).toUpperCase() + font.slice(1)}, sans-serif`;
    }
    
    // Clean up
    return () => {
      const previewCard = document.getElementById('profile-preview-card');
      if (previewCard) {
        previewCard.style.backgroundColor = '';
        previewCard.style.fontFamily = '';
      }
    };
  }, [backgroundColor, font]);
  
  return (
    <Card className="overflow-hidden h-[520px] shadow-lg">
      <CardContent className="p-0 h-full overflow-auto relative" id="profile-preview-card">
        <div className="pt-8 px-4 flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={userData.avatarUrl} />
              <AvatarFallback>
                {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h2 className="text-xl font-bold mt-4">{userData.name}</h2>
          <p className="text-sm text-center mt-1 text-gray-600 max-w-[90%]">{userData.bio}</p>
          
          <div className="w-full mt-8 space-y-4 px-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500">Links</h3>
            
            {links.map((link, index) => (
              <div 
                key={index}
                className={`w-full ${buttonStyle === 'rounded' ? 'rounded-lg' : 'rounded-none'} p-3 flex items-center justify-between transition-colors`}
                style={{ backgroundColor: primaryColor, color: 'white' }}
              >
                <span>{link.title}</span>
                <span>→</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent pt-16">
          <Button variant="outline" className="w-full" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePreviewCard;
