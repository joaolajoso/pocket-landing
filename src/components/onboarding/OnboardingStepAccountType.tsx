import { User, Building2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface OnboardingStepAccountTypeProps {
  onSelect: (type: 'personal' | 'business') => void;
}

export const OnboardingStepAccountType = ({ onSelect }: OnboardingStepAccountTypeProps) => {
  const { language } = useLanguage();

  const options = [
    {
      type: 'personal' as const,
      icon: User,
      title: language === 'pt' ? 'Pessoal' : 'Personal',
      description: language === 'pt' 
        ? 'Crie o seu perfil profissional e partilhe os seus contactos' 
        : 'Create your professional profile and share your contacts',
      gradient: 'from-pink-500 to-purple-600',
      hoverGradient: 'from-pink-600 to-purple-700',
      iconBg: 'bg-pink-500/20',
    },
    {
      type: 'business' as const,
      icon: Building2,
      title: 'Business',
      description: language === 'pt' 
        ? 'Gerencie a sua equipa, empresa e cartões de visita digitais' 
        : 'Manage your team, company and digital business cards',
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'from-blue-600 to-indigo-700',
      iconBg: 'bg-blue-500/20',
    },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        {language === 'pt' ? 'Como pretende utilizar o PocketCV?' : 'How do you want to use PocketCV?'}
      </h1>
      <p className="text-white/60 text-center mb-8">
        {language === 'pt' ? 'Pode alterar isto mais tarde nas definições.' : 'You can change this later in settings.'}
      </p>

      <div className="space-y-4">
        {options.map((option, index) => (
          <motion.button
            key={option.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => onSelect(option.type)}
            className="w-full group"
          >
            <div className="relative flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 text-left">
              <div className={`w-14 h-14 rounded-xl ${option.iconBg} flex items-center justify-center shrink-0`}>
                <option.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white">{option.title}</h3>
                <p className="text-sm text-white/50 mt-0.5">{option.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
