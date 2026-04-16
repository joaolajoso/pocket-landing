import { Users, ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "./OnboardingWizard";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/translations/onboarding";

interface OnboardingStepTagsProps {
  professionalRoles: string[];
  industries: string[];
  networkingGoals: string[];
  onChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const PROFESSIONAL_ROLES = [
  "Founder / CEO",
  "Developer",
  "Designer",
  "Marketing",
  "Sales",
  "Product Manager",
  "Investor",
  "Student",
  "Freelancer",
  "Consultant",
  "HR/Recruiter",
  "Data Scientist",
  "Engineer",
  "Researcher",
  "Professor/Teacher",
  "Lawyer",
  "Accountant",
  "Project Manager",
  "Content Creator",
  "Analyst",
];

const INDUSTRIES = [
  "Tech / Software",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "Media & Entertainment",
  "Real Estate",
  "Legal",
  "Consulting",
  "AI/Machine Learning",
  "Cybersecurity",
  "Blockchain/Web3",
  "Food & Beverage",
  "Tourism/Hospitality",
  "Sustainability/CleanTech",
  "Biotech/Pharma",
  "Sports/Fitness",
  "Logistics/Supply Chain",
  "Other",
];

const getNetworkingGoals = (t: typeof onboardingTranslations.pt) => [
  t.goalFindJob,
  t.goalRecruit,
  t.goalInvestors,
  t.goalPartnerships,
  t.goalLearn,
  t.goalMentoring,
  t.goalNetworking,
];

export const OnboardingStepTags = ({
  professionalRoles,
  industries,
  networkingGoals,
  onChange,
  onNext,
  onBack,
  onSkip,
}: OnboardingStepTagsProps) => {
  const { language } = useLanguage();
  const t = onboardingTranslations[language] || onboardingTranslations.en;

  const toggleTag = (category: "professionalRoles" | "industries" | "networkingGoals", tag: string) => {
    const currentTags = category === "professionalRoles" 
      ? professionalRoles 
      : category === "industries" 
        ? industries 
        : networkingGoals;
    
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    
    onChange({ [category]: newTags });
  };

  const TagButton = ({ tag, isSelected, onClick }: { tag: string; isSelected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        isSelected
          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
          : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
      }`}
    >
      {tag}
    </button>
  );

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 mx-auto">
        <Users className="w-8 h-8 text-white" />
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">{t.tellAboutYou}</h1>
      <p className="text-white/60 text-center mb-6">{t.helpConnect}</p>

      <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto scrollbar-hide">
        <div>
          <label className="text-sm font-medium text-white/80 mb-3 block">{t.yourArea}</label>
          <div className="flex flex-wrap gap-2">
            {PROFESSIONAL_ROLES.map((role) => (
              <TagButton key={role} tag={role} isSelected={professionalRoles.includes(role)} onClick={() => toggleTag("professionalRoles", role)} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white/80 mb-3 block">{t.yourIndustry}</label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => (
              <TagButton key={industry} tag={industry} isSelected={industries.includes(industry)} onClick={() => toggleTag("industries", industry)} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white/80 mb-3 block">{t.lookingFor}</label>
          <div className="flex flex-wrap gap-2">
            {getNetworkingGoals(t).map((goal) => (
              <TagButton key={goal} tag={goal} isSelected={networkingGoals.includes(goal)} onClick={() => toggleTag("networkingGoals", goal)} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="h-14 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button onClick={onNext} className="flex-1 h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl text-base">
            {t.continue}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        <button onClick={onSkip} className="text-sm text-white/50 hover:text-white/70 transition-colors flex items-center justify-center gap-1">
          {t.skipStep}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
