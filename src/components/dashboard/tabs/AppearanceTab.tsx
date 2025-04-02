
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { LinkType } from "@/components/LinkCard";

interface AppearanceTabProps {
  userData: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  links: LinkType[];
}

const AppearanceTab = ({ userData, links }: AppearanceTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">Customize how your profile looks</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="w-72 h-[500px] border rounded-xl shadow-sm bg-background overflow-hidden">
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
                    <div key={link.id} className="w-full p-3 border rounded-md flex items-center gap-3 hover:bg-muted/50 transition-colors">
                      {link.icon}
                      <span>{link.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/preview">Open Full Preview</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                  <div className="h-12 bg-white rounded mb-2"></div>
                  <p className="text-xs font-medium text-center">Light</p>
                </div>
                <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                  <div className="h-12 bg-zinc-900 rounded mb-2"></div>
                  <p className="text-xs font-medium text-center">Dark</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Background Color</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    <div className="h-6 w-6 rounded-full bg-purple-500 cursor-pointer ring-2 ring-offset-2 ring-purple-500"></div>
                    <div className="h-6 w-6 rounded-full bg-blue-500 cursor-pointer"></div>
                    <div className="h-6 w-6 rounded-full bg-green-500 cursor-pointer"></div>
                    <div className="h-6 w-6 rounded-full bg-yellow-500 cursor-pointer"></div>
                    <div className="h-6 w-6 rounded-full bg-red-500 cursor-pointer"></div>
                  </div>
                </div>
                
                <div>
                  <Label>Button Color</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    <div className="h-6 w-6 rounded-full bg-purple-500 cursor-pointer ring-2 ring-offset-2 ring-purple-500"></div>
                    <div className="h-6 w-6 rounded-full bg-blue-500 cursor-pointer"></div>
                    <div className="h-6 w-6 rounded-full bg-green-500 cursor-pointer"></div>
                    <div className="h-6 w-6 rounded-full bg-yellow-500 cursor-pointer"></div>
                    <div className="h-6 w-6 rounded-full bg-red-500 cursor-pointer"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Font</Label>
                  <select className="w-full mt-2 p-2 border rounded-md">
                    <option value="inter">Inter (Default)</option>
                    <option value="roboto">Roboto</option>
                    <option value="poppins">Poppins</option>
                    <option value="opensans">Open Sans</option>
                  </select>
                </div>
                
                <div>
                  <Label>Button Style</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                      <div className="h-8 border rounded-md mb-1"></div>
                      <p className="text-xs font-medium text-center">Rounded</p>
                    </div>
                    <div className="border rounded-md p-2 cursor-pointer hover:border-primary">
                      <div className="h-8 border rounded-sm mb-1"></div>
                      <p className="text-xs font-medium text-center">Square</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppearanceTab;
