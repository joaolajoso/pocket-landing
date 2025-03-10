
import { Linkedin, FileText, Image, Mail, Smartphone, Link2, Eye, Shield, Gauge } from "lucide-react";

const features = [
  {
    icon: <Link2 className="h-6 w-6 text-primary" />,
    title: "Centralize Your Links",
    description: "Store and share all your important links in one place - LinkedIn, portfolio, resume, and more."
  },
  {
    icon: <Smartphone className="h-6 w-6 text-primary" />,
    title: "NFC Enabled",
    description: "Instantly share your profile with a tap when paired with an NFC card or chip."
  },
  {
    icon: <Eye className="h-6 w-6 text-primary" />,
    title: "Live Preview",
    description: "See how your page looks in real-time as you make changes to ensure it's perfect."
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Secure Platform",
    description: "Your data is protected with state-of-the-art security practices and encryption."
  },
  {
    icon: <Gauge className="h-6 w-6 text-primary" />,
    title: "Fast Performance",
    description: "Optimized for speed with fast-loading pages to ensure a seamless experience."
  },
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "CV Integration",
    description: "Upload and share your resume or CV directly through your personal link."
  }
];

const FeatureSection = () => {
  return (
    <section id="features" className="py-20 bg-secondary/50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything You Need</h2>
          <p className="text-muted-foreground">
            PocketCV combines all the essential tools for creating your professional online presence in one simple platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-background rounded-xl p-6 shadow-sm border border-border/60 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
            >
              <div className="mb-4 w-12 h-12 rounded-lg bg-secondary/80 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
