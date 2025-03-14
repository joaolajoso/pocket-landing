
import { Linkedin, FileText, Image, Mail, Smartphone, Link2, Eye, Shield, Gauge, Bookmark, GraduationCap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const featureIcons = [
  <Link2 className="h-6 w-6 text-white" />,
  <Smartphone className="h-6 w-6 text-white" />,
  <GraduationCap className="h-6 w-6 text-white" />,
  <Bookmark className="h-6 w-6 text-white" />,
  <FileText className="h-6 w-6 text-white" />,
  <Mail className="h-6 w-6 text-white" />
];

const FeatureSection = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-white to-secondary/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t.features.title}</h2>
          <p className="text-muted-foreground">
            {t.features.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.features.items.map((feature, index) => (
            <div 
              key={index} 
              className="bg-background rounded-xl p-6 shadow-sm border border-border/60 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] group"
            >
              <div className="mb-4 w-12 h-12 rounded-lg pocketcv-gradient-bg flex items-center justify-center">
                {featureIcons[index]}
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
