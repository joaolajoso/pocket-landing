
import { LinkType } from "@/components/LinkCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from "lucide-react";

interface ProfilePreviewCardProps {
  userData: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  links: LinkType[];
  backgroundColor: string;
  buttonStyle: "rounded" | "square";
  font: string;
  onPreview: () => void;
}

const ProfilePreviewCard = ({ 
  userData, 
  links, 
  backgroundColor, 
  buttonStyle, 
  font,
  onPreview
}: ProfilePreviewCardProps) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Profile Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-8">
        <div className="w-72 h-[500px] border rounded-xl shadow-sm bg-background overflow-hidden"
              style={{ backgroundColor: backgroundColor }}>
          <div className="p-4 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={userData.avatarUrl} alt={userData.name} />
              <AvatarFallback className="text-xl">
                {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{userData.name}</h2>
            <p className="text-sm text-center text-muted-foreground mt-1">{userData.bio}</p>
            
            <div className="w-full mt-8 space-y-3">
              {links.map(link => (
                <div 
                  key={link.id} 
                  className={`w-full p-3 border flex items-center gap-3 hover:bg-muted/50 transition-colors`}
                  style={{ 
                    borderRadius: buttonStyle === "rounded" ? "0.375rem" : "0.125rem",
                    fontFamily: font === "inter" ? "Inter, sans-serif" : 
                              font === "roboto" ? "Roboto, sans-serif" : 
                              font === "poppins" ? "Poppins, sans-serif" : "Open Sans, sans-serif"
                  }}
                >
                  {link.icon}
                  <span>{link.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onPreview} className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Open Full Preview
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfilePreviewCard;
