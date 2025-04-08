
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, FileText, Globe, Mail, Github, ArrowLeft } from "lucide-react";
import ProfilePreview from "@/components/ProfilePreview";

const ProfileExample = () => {
  // Sample profile data that matches what's in the preview
  const profileData = {
    name: "Sarah Johnson",
    bio: "UX Designer & Developer",
    avatarUrl: "/placeholder.svg",
    username: "sarahjohnson",
    links: [
      {
        id: "1",
        title: "LinkedIn",
        url: "https://linkedin.com/in/sarahjohnson",
        icon: <Linkedin className="h-5 w-5" />,
      },
      {
        id: "2",
        title: "Resume/CV",
        url: "https://sarahjohnson.design/resume.pdf",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        id: "3",
        title: "Portfolio",
        url: "https://sarahjohnson.design",
        icon: <Globe className="h-5 w-5" />,
      },
      {
        id: "4",
        title: "GitHub",
        url: "https://github.com/sarahjohnson",
        icon: <Github className="h-5 w-5" />,
      },
      {
        id: "5",
        title: "Email",
        url: "mailto:hello@sarahjohnson.design",
        icon: <Mail className="h-5 w-5" />,
      },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>
      
      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8 max-w-md">
        <ProfilePreview 
          profile={profileData}
          isPreview={false}
        />
        
        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Powered by <span className="font-medium">PocketCV</span></p>
          <div className="mt-4 flex justify-center items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 px-3" asChild>
              <Link to="/login">Edit Profile</Link>
            </Button>
            <Button size="sm" className="h-8 px-3" asChild>
              <Link to="/get-started">Get your own</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileExample;
