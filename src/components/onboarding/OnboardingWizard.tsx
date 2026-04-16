import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/translations/onboarding";
import { OnboardingStepAccountType } from "./OnboardingStepAccountType";
import { OnboardingStepPWAInstall } from "./OnboardingStepPWAInstall";
import { OnboardingStepPhone } from "./OnboardingStepPhone";
import { OnboardingStepTags } from "./OnboardingStepTags";
import { OnboardingStepLinks } from "./OnboardingStepLinks";
import { OnboardingStepDesign } from "./OnboardingStepDesign";
import { OnboardingStepCompany } from "./OnboardingStepCompany";
import { OnboardingStepInviteTeam } from "./OnboardingStepInviteTeam";
import { OnboardingComplete } from "./OnboardingComplete";

export interface OnboardingData {
  username: string;
  headline: string;
  photoUrl: string | null;
  phoneNumber: string;
  countryCode: string;
  enableWhatsApp: boolean;
  professionalRoles: string[];
  industries: string[];
  networkingGoals: string[];
  linkedinUrl: string;
  instagramUrl: string;
  otherUrl: string;
  selectedTheme: "wine" | "green" | "orange" | "gray" | "purple";
  // Business fields
  companyName: string;
  companySize: string;
  companyDescription: string;
  companyLogoUrl: string | null;
  inviteEmails: string[];
}

const initialData: OnboardingData = {
  username: "",
  headline: "",
  photoUrl: null,
  phoneNumber: "",
  countryCode: "+351",
  enableWhatsApp: false,
  professionalRoles: [],
  industries: [],
  networkingGoals: [],
  linkedinUrl: "",
  instagramUrl: "",
  otherUrl: "",
  selectedTheme: "wine",
  companyName: "",
  companySize: "",
  companyDescription: "",
  companyLogoUrl: null,
  inviteEmails: [],
};

type AccountType = 'personal' | 'business' | null;

export const OnboardingWizard = () => {
  const [showPWAStep, setShowPWAStep] = useState(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSInstalled = (window.navigator as any).standalone === true;
    return !(isStandalone || isIOSInstalled);
  });
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isComplete, setIsComplete] = useState(false);
  const [userName, setUserName] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const t = onboardingTranslations[language] || onboardingTranslations.en;

  const isBusiness = accountType === 'business';
  // Personal: 4 steps (profile, tags, links, design)
  // Business: 5 steps (profile, company, links, design, invite)
  const totalSteps = isBusiness ? 5 : 4;

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

      // Check if account_type already set (e.g. from previous session)
      const existingAccountType = user.user_metadata?.account_type;
      if (existingAccountType === 'personal' || existingAccountType === 'business') {
        setAccountType(existingAccountType);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, photo_url")
        .eq("id", user.id)
        .single();

      if (profile?.name) {
        const fullName = profile.name;
        const firstName = fullName.split(" ")[0];
        setUserName(firstName);

        if (!data.username) {
          const generatedUsername = generateUsernameFromName(fullName);
          if (generatedUsername.length >= 3) {
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("id")
              .eq("slug", generatedUsername)
              .neq("id", user.id)
              .maybeSingle();

            if (!existingProfile) {
              updateData({ username: generatedUsername });
            } else {
              let suffix = 1;
              let usernameWithSuffix = `${generatedUsername}${suffix}`;
              while (suffix <= 99) {
                const { data: existingWithSuffix } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("slug", usernameWithSuffix)
                  .neq("id", user.id)
                  .maybeSingle();

                if (!existingWithSuffix) {
                  updateData({ username: usernameWithSuffix });
                  break;
                }
                suffix++;
                usernameWithSuffix = `${generatedUsername}${suffix}`;
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

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleAccountTypeSelect = async (type: 'personal' | 'business') => {
    setAccountType(type);
    // Persist in user metadata
    await supabase.auth.updateUser({ data: { account_type: type } });
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
    } else {
      // Go back to account type selection
      setAccountType(null);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const generateSlug = (username: string): string => {
    return username.toLowerCase().trim();
  };

  const getWhatsAppUrl = (): string => {
    const cleanCountryCode = data.countryCode.replace(/\D/g, "");
    const cleanPhoneNumber = data.phoneNumber.replace(/\D/g, "");
    return `https://wa.me/${cleanCountryCode}${cleanPhoneNumber}`;
  };

  const formatSocialUrl = (input: string, platform: 'instagram' | 'linkedin'): string => {
    if (!input) return '';
    let cleanInput = input.trim();
    if (cleanInput.includes('://')) return cleanInput;
    if (cleanInput.startsWith('@')) cleanInput = cleanInput.substring(1);
    const domains = { instagram: 'https://instagram.com/', linkedin: 'https://linkedin.com/in/' };
    if (cleanInput.includes('.com') || cleanInput.includes('.')) return `https://${cleanInput}`;
    return `${domains[platform]}${cleanInput}`;
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      // Save profile
      const profileUpdate: Record<string, string> = {};
      if (data.headline.trim()) profileUpdate.headline = data.headline.trim();
      if (data.phoneNumber) profileUpdate.phone_number = `${data.countryCode}${data.phoneNumber}`;
      const trimmedUsername = data.username.trim();
      if (trimmedUsername) profileUpdate.slug = generateSlug(trimmedUsername);

      if (Object.keys(profileUpdate).length > 0) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", user.id);
        if (profileError) throw profileError;
      }

      // Save tags (personal flow)
      if (!isBusiness) {
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
      }

      // Create organization for business accounts
      if (isBusiness && data.companyName.trim()) {
        try {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: data.companyName.trim(),
              size_category: data.companySize,
              description: data.companyDescription.trim() || null,
              logo_url: data.companyLogoUrl || null,
              created_by: user.id,
            })
            .select()
            .single();

          if (orgError) throw orgError;

          if (orgData) {
            // Add user as owner
            await supabase.from('organization_members').insert({
              organization_id: orgData.id,
              user_id: user.id,
              role: 'owner',
              status: 'active',
              joined_at: new Date().toISOString(),
            });

            // Update profile with org
            await supabase.from('profiles').update({ organization_id: orgData.id }).eq('id', user.id);

            // Send invitations
            if (data.inviteEmails.length > 0) {
              const invitations = data.inviteEmails.map(email => ({
                organization_id: orgData.id,
                email,
                role: 'employee',
                invited_by: user.id,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              }));
              
              try {
                await supabase.from('organization_invitations').insert(invitations);
              } catch (e) { console.warn("Error sending invitations:", e); }
            }
          }
        } catch (e) {
          console.error("Error creating organization:", e);
          toast.error(language === 'pt' ? 'Erro ao criar organização' : 'Error creating organization');
        }
      }

      // Save links
      const linksToInsert = [];
      let position = 0;
      if (data.linkedinUrl) {
        linksToInsert.push({ user_id: user.id, title: "LinkedIn", url: formatSocialUrl(data.linkedinUrl, 'linkedin'), icon: "linkedin", position: position++, active: true });
      }
      if (data.instagramUrl) {
        linksToInsert.push({ user_id: user.id, title: "Instagram", url: formatSocialUrl(data.instagramUrl, 'instagram'), icon: "instagram", position: position++, active: true });
      }
      if (data.enableWhatsApp && data.phoneNumber) {
        linksToInsert.push({ user_id: user.id, title: "WhatsApp", url: getWhatsAppUrl(), icon: "whatsapp", position: position++, active: true });
      }
      if (data.otherUrl) {
        linksToInsert.push({ user_id: user.id, title: "Website", url: data.otherUrl, icon: "website", position: position++, active: true });
      }
      if (linksToInsert.length > 0) {
        try { await supabase.from("links").insert(linksToInsert); } catch (e) { console.warn("Error saving links:", e); }
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

      // Check for pending stand onboarding link and claim it
      const onboardingLinkId = searchParams.get('onboarding') || user.user_metadata?.stand_onboarding_link;
      if (onboardingLinkId) {
        try {
          console.log('[Onboarding] Claiming stand with link:', onboardingLinkId);
          await supabase.functions.invoke('claim-stand-onboarding', {
            body: { linkId: onboardingLinkId, userId: user.id },
          });
          await supabase.auth.updateUser({ data: { stand_onboarding_link: null } });
          console.log('[Onboarding] Stand claimed successfully');
        } catch (e) {
          console.warn('[Onboarding] Error claiming stand:', e);
        }
      }

      setIsComplete(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error(t.saveError);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  const handleSkipOnboarding = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
    navigate("/dashboard", { replace: true });
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  if (isComplete) {
    return <OnboardingComplete userName={userName} onContinue={handleGoToDashboard} />;
  }

  // Show PWA install step
  if (showPWAStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex flex-col">
        <div className="w-full px-6 pt-6">
          <div className="max-w-md mx-auto flex justify-end">
            <button
              onClick={handleSkipOnboarding}
              className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              {language === 'pt' ? 'Saltar configuração' : 'Skip setup'}
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingStepPWAInstall onNext={() => setShowPWAStep(false)} />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Show account type selection if not yet chosen
  if (accountType === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex flex-col">
        <div className="w-full px-6 pt-6">
          <div className="max-w-md mx-auto flex justify-end">
            <button
              onClick={handleSkipOnboarding}
              className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              {language === 'pt' ? 'Saltar configuração' : 'Skip setup'}
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OnboardingStepAccountType onSelect={handleAccountTypeSelect} />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Render steps based on account type
  const renderStep = () => {
    if (isBusiness) {
      // Business: 1=Profile, 2=Company, 3=Links, 4=Design, 5=Invite
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
              isBusiness={true}
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
            <OnboardingStepCompany
              companyName={data.companyName}
              companySize={data.companySize}
              companyDescription={data.companyDescription}
              companyLogoUrl={data.companyLogoUrl}
              onCompanyNameChange={(v) => updateData({ companyName: v })}
              onCompanySizeChange={(v) => updateData({ companySize: v })}
              onCompanyDescriptionChange={(v) => updateData({ companyDescription: v })}
              onCompanyLogoChange={(url) => updateData({ companyLogoUrl: url })}
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
            />
          );
        case 3:
          return (
            <OnboardingStepLinks
              linkedinUrl={data.linkedinUrl}
              instagramUrl={data.instagramUrl}
              otherUrl={data.otherUrl}
              onChange={updateData}
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
            />
          );
        case 4:
          return (
            <OnboardingStepDesign
              selectedTheme={data.selectedTheme}
              userName={userName}
              onChange={(theme) => updateData({ selectedTheme: theme })}
              onNext={handleNext}
              onBack={handleBack}
            />
          );
        case 5:
          return (
            <OnboardingStepInviteTeam
              emails={data.inviteEmails}
              onEmailsChange={(emails) => updateData({ inviteEmails: emails })}
              onNext={handleComplete}
              onBack={handleBack}
              onSkip={() => handleComplete()}
            />
          );
      }
    } else {
      // Personal: 1=Profile, 2=Tags, 3=Links, 4=Design
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
            <OnboardingStepLinks
              linkedinUrl={data.linkedinUrl}
              instagramUrl={data.instagramUrl}
              otherUrl={data.otherUrl}
              onChange={updateData}
              onNext={handleNext}
              onBack={handleBack}
              onSkip={handleSkip}
            />
          );
        case 4:
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
              {language === 'pt' ? 'Saltar configuração' : 'Skip setup'}
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
              key={`${accountType}-${currentStep}`}
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
