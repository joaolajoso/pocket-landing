
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, FileText, Globe, Mail, Github, Twitter, ArrowLeft } from "lucide-react";

const ProfileExample = () => {
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
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src="/placeholder.svg" alt="Sarah Johnson" />
            <AvatarFallback className="bg-gradient-to-r from-pocketcv-purple to-pocketcv-orange text-white">SJ</AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold mb-1">Sarah Johnson</h1>
          <p className="text-muted-foreground mb-4">UX Designer & Developer</p>
          
          <div className="w-20 h-1 bg-gradient-to-r from-pocketcv-purple to-pocketcv-orange rounded-full mb-6"></div>
          
          <p className="text-sm text-center max-w-xs">
            I create intuitive digital experiences with a focus on accessibility and user-centered design.
          </p>
        </div>
        
        {/* Links Section */}
        <div className="space-y-3 mb-8">
          <a href="https://linkedin.com/in/sarahjohnson" target="_blank" rel="noopener noreferrer">
            <Card className="link-card">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
                <Linkedin className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium truncate">LinkedIn</h4>
                <p className="text-sm text-muted-foreground truncate">Connect with me</p>
              </div>
            </Card>
          </a>
          
          <a href="https://sarahjohnson.design/resume.pdf" target="_blank" rel="noopener noreferrer">
            <Card className="link-card">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium truncate">Resume/CV</h4>
                <p className="text-sm text-muted-foreground truncate">View my experience</p>
              </div>
            </Card>
          </a>
          
          <a href="https://sarahjohnson.design" target="_blank" rel="noopener noreferrer">
            <Card className="link-card">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium truncate">Portfolio</h4>
                <p className="text-sm text-muted-foreground truncate">View my projects</p>
              </div>
            </Card>
          </a>
          
          <a href="https://github.com/sarahjohnson" target="_blank" rel="noopener noreferrer">
            <Card className="link-card">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
                <Github className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium truncate">GitHub</h4>
                <p className="text-sm text-muted-foreground truncate">Check my code</p>
              </div>
            </Card>
          </a>
          
          <a href="https://twitter.com/sarahjohnsonux" target="_blank" rel="noopener noreferrer">
            <Card className="link-card">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
                <Twitter className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium truncate">Twitter</h4>
                <p className="text-sm text-muted-foreground truncate">Follow my updates</p>
              </div>
            </Card>
          </a>
          
          <a href="mailto:hello@sarahjohnson.design" target="_blank" rel="noopener noreferrer">
            <Card className="link-card">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-md bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium truncate">Email</h4>
                <p className="text-sm text-muted-foreground truncate">Contact me directly</p>
              </div>
            </Card>
          </a>
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by <span className="font-medium">PocketCV</span></p>
          <div className="mt-4 flex justify-center items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 px-3">
              Edit Profile
            </Button>
            <Button size="sm" className="h-8 px-3">
              Get your own
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileExample;
