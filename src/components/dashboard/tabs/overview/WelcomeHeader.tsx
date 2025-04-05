
import { Link } from "react-router-dom";
import { Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeHeaderProps {
  firstName: string;
}

const WelcomeHeader = ({ firstName }: WelcomeHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground">Manage your PocketCV profile and links</p>
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link to="/preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Link>
        </Button>
        
        <Button>
          <Share2 className="mr-2 h-4 w-4" />
          Share Profile
        </Button>
      </div>
    </div>
  );
};

export default WelcomeHeader;
