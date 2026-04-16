import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/translations/onboarding";
import { OnboardingStepPhone } from "./OnboardingStepPhone";
import { OnboardingStepTags } from "./OnboardingStepTags";
import { OnboardingStepDesign } from "./OnboardingStepDesign";

interface ParticipantOnboardingWizardProps {
  eventId: string;
}

interface ParticipantData {
  username: string;
  headline: string;
  photoUrl: string | null;
  phoneNumber: string;
  countryCode: string;
  enableWhatsApp: boolean;
  professionalRoles: string[];
  industries: string[];
  networkingGoals: string[];
  selectedTheme: "wine" | "green" | "orange" | "gray" | "purple";
}

const initialData: ParticipantData = {
  username: "",
  headline: "",
  photoUrl: null,
  phoneNumber: "",
  countryCode: "+351",
  enableWhatsApp: false,
  professionalRoles: [],
  industries: [],
  networkingGoals: [],
  selectedTheme: "wine",
};

export const ParticipantOnboardingWizard = ({ eventId }: ParticipantOnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ParticipantData>(initialData);
  const [userName, setUserName] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = onboardingTranslations[language] || onboardingTranslations.en;

  const totalSteps = 3; // Profile → Tags → Design

  const generateUsernameFromName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .slice(0, 20);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, photo_url, slug")
        .eq("id", user.id)
        .single();

      if (profile?.name) {
        const firstName = profile.name.split(" ")[0];
        setUserName(firstName);

        if (!data.username) {
          // Use existing slug if available
          if (profile.slug) {
            updateData({ username: profile.slug });
          } else {
            const generatedUsername = generateUsernameFromName(profile.name);
            if (generatedUsername.length >= 3) {
              const { data: existing } = await supabase
                .from("profiles")
                .select("id")
                .eq("slug", generatedUsername)
                .neq("id", user.id)
                .maybeSingle();

              if (!existing) {
                updateData({ username: generatedUsername });
              } else {
                let suffix = 1;
                let candidate = `${generatedUsername}${suffix}`;
                while (suffix <= 99) {
                  const { data: existingS } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("slug", candidate)
                    .neq("id", user.id)
                    .maybeSingle();
                  if (!existingS) {
                    updateData({ username: candidate });
                    break;
                  }
                  suffix++;
                  candidate = `${generatedUsername}${suffix}`;
                }
              }
            }
          }
        }
      }

      if (profile?.photo_url && !data.photoUrl) {
        updateData({ photoUrl: profile.photo_url });
      }
    };

    fetchUserData();
  }, [user]);

  const updateData = (updates: Partial<ParticipantData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const getWhatsAppUrl = (): string => {
    const cleanCountryCode = data.countryCode.replace(/\D/g, "");
    const cleanPhoneNumber = data.phoneNumber.replace(/\D/g, "");
    return `https://wa.me/${cleanCountryCode}${cleanPhoneNumber}`;
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      // Save profile
      const profileUpdate: Record<string, any> = {};
      if (data.headline.trim()) profileUpdate.headline = data.headline.trim();
      if (data.phoneNumber) profileUpdate.phone_number = `${data.countryCode}${data.phoneNumber}`;
      const trimmedUsername = data.username.trim();
      if (trimmedUsername) profileUpdate.slug = trimmedUsername.toLowerCase();

      if (Object.keys(profileUpdate).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", user.id);
        if (error) throw error;
      }

      // Save tags
      const hasInterests = data.professionalRoles.length > 0 || data.industries.length > 0 || data.networkingGoals.length > 0;
      if (hasInterests) {
        try {
          await supabase.from("user_interests").upsert({
            user_id: user.id,
            professional_roles: data.professionalRoles,
            industries: data.industries,
            networking_goals: data.networkingGoals,
          }, { onConflict: "user_id" });
        } catch (e) { console.warn("Error saving interests:", e); }
      }

      // Save WhatsApp link if enabled
      if (data.enableWhatsApp && data.phoneNumber) {
        try {
          await supabase.from("links").insert({
            user_id: user.id,
            title: "WhatsApp",
            url: getWhatsAppUrl(),
            icon: "whatsapp",
            position: 0,
            active: true,
          });
        } catch (e) { console.warn("Error saving WhatsApp link:", e); }
      }

      // Save design theme
      const themeColors = {
        wine: { bg: "#C41E5C", button: "#C41E5C" },
        green: { bg: "#059669", button: "#059669" },
        orange: { bg: "#EA580C", button: "#EA580C" },
        gray: { bg: "#4B5563", button: "#4B5563" },
        purple: { bg: "#7C3AED", button: "#7C3AED" },
      };
      const selectedColors = themeColors[data.selectedTheme];
      try {
        await supabase.from("profile_design_settings").upsert({
          user_id: user.id,
          background_color: selectedColors.bg,
          button_background_color: selectedColors.button,
        }, { onConflict: "user_id" });
      } catch (e) { console.warn("Error saving design:", e); }

      // Mark onboarding complete
      await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);

      // Clear event_registration metadata
      await supabase.auth.updateUser({ data: { event_registration: null } });

      toast.success(language === 'pt' ? 'Perfil configurado!' : 'Profile set up!');

      // Redirect to event focus mode
      navigate(`/events/${eventId}/app`, { replace: true });
    } catch (error) {
      console.error("Error completing participant onboarding:", error);
      toast.error(t.saveError);
    }
  };

  const handleSkipOnboarding = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
    await supabase.auth.updateUser({ data: { event_registration: null } });
    navigate(`/events/${eventId}/app`, { replace: true });
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStepPhone
            userName={userName}
            username={data.username}
            headline={data.headline}
            phoneNumber={data.phoneNumber}
            countryCode={data.countryCode}
            enableWhatsApp={data.enableWhatsApp}
            photoUrl={data.photoUrl}
            isBusiness={false}
            onUsernameChange={(v) => updateData({ username: v })}
            onHeadlineChange={(v) => updateData({ headline: v })}
            onPhoneChange={(v) => updateData({ phoneNumber: v })}
            onCountryCodeChange={(v) => updateData({ countryCode: v })}
            onWhatsAppChange={(v) => updateData({ enableWhatsApp: v })}
            onPhotoChange={(url) => updateData({ photoUrl: url })}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        );
      case 2:
        return (
          <OnboardingStepTags
            professionalRoles={data.professionalRoles}
            industries={data.industries}
            networkingGoals={data.networkingGoals}
            onChange={updateData}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 3:
        return (
          <OnboardingStepDesign
            selectedTheme={data.selectedTheme}
            userName={userName}
            onChange={(theme) => updateData({ selectedTheme: theme })}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex flex-col">
      {/* Progress Bar + Skip */}
      <div className="w-full px-6 pt-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">{t.step} {currentStep} {t.of} {totalSteps}</span>
            <button
              onClick={handleSkipOnboarding}
              className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              {language === 'pt' ? 'Saltar e ir ao evento' : 'Skip & go to event'}
            </button>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
