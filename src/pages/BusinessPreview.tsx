
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Phone, Mail, Link as LinkIcon, Check, Copy, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BusinessPreview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeView, setActiveView] = useState<"personal" | "business">("personal");
  
  // Mock profile data
  const personalProfile = {
    name: "Adam Noah",
    position: "Sales Director",
    verified: true,
    avatar: "public/lovable-uploads/5f22d884-d765-4061-8f78-434d13f34c14.png",
    contact: {
      phone: "+1 (555) 123-4567",
      email: "adam@company.com",
      website: "adamnoah.com"
    },
    company: {
      name: "Company.com",
      logo: "/placeholder.svg",
      description: "Check our profile to know more about our services"
    },
    links: [
      { name: "Teams", icon: "teams", url: "https://teams.microsoft.com" },
      { name: "WhatsApp", icon: "whatsapp", url: "https://whatsapp.com" },
      { name: "Book A Meeting", icon: "calendar", url: "https://calendly.com" }
    ]
  };
  
  const businessProfile = {
    name: "Company.com",
    subtitle: "Information Technology Consulting",
    logo: "/placeholder.svg",
    contact: {
      phone: "+1 408 925 6961",
      email: "info@company.com",
      fax: "+45432765",
      address: "New York, US"
    },
    links: [
      { name: "Company Website", icon: "company", url: "https://company.com" },
      { name: "Gmail", icon: "gmail", url: "https://gmail.com" }
    ]
  };
  
  const handleCopy = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${description} copied to clipboard`,
    });
  };
  
  const handleSaveContact = () => {
    toast({
      title: "Saving Contact",
      description: "Contact information would be downloaded as vCard",
    });
  };
  
  const handleShareProfile = () => {
    toast({
      title: "Share Profile",
      description: "Sharing options would appear here",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="py-4 px-4 md:px-6 border-b sticky top-0 z-50 bg-background">
        <div className="container mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShareProfile}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* View Selector */}
      <div className="container mx-auto py-6 px-4">
        <div className="bg-secondary/20 rounded-lg p-2 inline-flex gap-2 mx-auto mb-8">
          <Button
            variant={activeView === "personal" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("personal")}
          >
            Personal View
          </Button>
          <Button
            variant={activeView === "business" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("business")}
          >
            Business View
          </Button>
        </div>
        
        <div className="flex justify-center">
          {activeView === "personal" && (
            <div className="bg-black/5 border rounded-3xl p-6 max-w-sm w-full shadow-lg">
              <div className="flex flex-col items-center text-center mb-8">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={personalProfile.avatar} alt={personalProfile.name} />
                  <AvatarFallback>AN</AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold flex items-center gap-1">
                  {personalProfile.name}
                  {personalProfile.verified && (
                    <span className="text-amber-500">
                      <Check className="h-5 w-5" />
                    </span>
                  )}
                </h1>
                
                <p className="text-muted-foreground">{personalProfile.position}</p>
                
                {/* Contact Actions */}
                <div className="flex justify-center gap-6 mt-4">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleCopy(personalProfile.contact.phone, "Phone number")}>
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleCopy(personalProfile.contact.email, "Email address")}>
                    <Mail className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleCopy(personalProfile.contact.website, "Website URL")}>
                    <LinkIcon className="h-5 w-5" />
                  </Button>
                </div>
                
                <Button variant="default" className="w-full mt-4" onClick={handleSaveContact}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Contact
                </Button>
              </div>
              
              {/* Company Section */}
              <Card className="mb-6">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-orange-500 h-12 w-12 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">C</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Our company profile</h3>
                    <p className="text-xs text-muted-foreground">{personalProfile.company.description}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Links */}
              <div className="grid grid-cols-3 gap-4">
                {personalProfile.links.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center"
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-blue-500" : 
                      index === 1 ? "bg-green-500" : "bg-blue-400"
                    }`}>
                      {/* Replace with appropriate icons for each link type */}
                      <span className="text-white text-xl font-bold">
                        {link.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs mt-2">{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {activeView === "business" && (
            <div className="bg-black/5 border rounded-3xl p-6 max-w-sm w-full shadow-lg">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="bg-orange-500 h-20 w-20 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-3xl font-bold">C</span>
                </div>
                
                <h1 className="text-2xl font-bold">{businessProfile.name}</h1>
                <p className="text-sm text-muted-foreground">{businessProfile.subtitle}</p>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      {businessProfile.contact.phone}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-2" 
                        onClick={() => handleCopy(businessProfile.contact.phone, "Phone number")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      {businessProfile.contact.email}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-2" 
                        onClick={() => handleCopy(businessProfile.contact.email, "Email address")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h20v18H2z"></path>
                    <path d="M2 9h20"></path>
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Fax</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      {businessProfile.contact.fax}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-2" 
                        onClick={() => handleCopy(businessProfile.contact.fax, "Fax number")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {businessProfile.contact.address}
                    </p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">Company links</h3>
              
              {/* Links Grid */}
              <div className="grid grid-cols-3 gap-4">
                {businessProfile.links.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center"
                  >
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-orange-500" : "bg-red-400"
                    }`}>
                      {/* Replace with appropriate icons for each link type */}
                      <span className="text-white text-xl font-bold">
                        {link.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-xs mt-2">{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessPreview;
