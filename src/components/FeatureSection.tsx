
import { Linkedin, FileText, Image, Mail, Smartphone, Link2, Eye, Shield, Gauge, Bookmark, QrCode, GraduationCap } from "lucide-react";

const features = [
  {
    icon: <Link2 className="h-6 w-6 text-pocketcv-purple" />,
    title: "Centralize Your Links",
    description: "Store and share all your professional links in one place - LinkedIn, portfolio, resume, and contact information."
  },
  {
    icon: <Smartphone className="h-6 w-6 text-pocketcv-purple" />,
    title: "NFC Enabled",
    description: "Share your profile instantly with a tap of your PocketCV card on any NFC-enabled smartphone."
  },
  {
    icon: <QrCode className="h-6 w-6 text-pocketcv-purple" />,
    title: "QR Code Backup",
    description: "For devices without NFC support, your unique QR code ensures you never miss a connection opportunity."
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-pocketcv-purple" />,
    title: "Student Focused",
    description: "Designed specifically for university students and young professionals entering the job market."
  },
  {
    icon: <Bookmark className="h-6 w-6 text-pocketcv-purple" />,
    title: "Memorable URLs",
    description: "Get your own personalized link that's easy to remember and share with potential employers."
  },
  {
    icon: <FileText className="h-6 w-6 text-pocketcv-purple" />,
    title: "CV Integration",
    description: "Upload and share your resume or CV directly through your personal link for seamless job applications."
  }
];

const FeatureSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-white to-secondary/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything You Need</h2>
          <p className="text-muted-foreground">
            PocketCV combines all the essential networking tools for students and young professionals in one simple platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-background rounded-xl p-6 shadow-sm border border-border/60 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] group"
            >
              <div className="mb-4 w-12 h-12 rounded-lg pocketcv-gradient-bg flex items-center justify-center bg-opacity-10 group-hover:bg-opacity-100 transition-all duration-300">
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-medium mb-2 group-hover:text-pocketcv-purple transition-colors duration-300">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
