import { useState, useRef, useEffect } from "react";
import { Phone, ArrowRight, Camera, User, Loader2, AtSign, CheckCircle, XCircle, MessageCircle, AlertCircle, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validatePhoneNumber, getPhonePlaceholder, getExpectedLengthText } from "@/data/countryCodes";
import { CountryCodeCombobox } from "@/components/ui/country-code-combobox";
import { useLanguage } from "@/contexts/LanguageContext";
import { onboardingTranslations } from "@/translations/onboarding";

interface OnboardingStepPhoneProps {
  userName: string;
  username: string;
  headline: string;
  phoneNumber: string;
  countryCode: string;
  enableWhatsApp: boolean;
  photoUrl: string | null;
  isBusiness?: boolean;
  onUsernameChange: (value: string) => void;
  onHeadlineChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onWhatsAppChange: (value: boolean) => void;
  onPhotoChange: (url: string | null) => void;
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingStepPhone = ({
  userName,
  username,
  headline,
  phoneNumber,
  countryCode,
  enableWhatsApp,
  photoUrl,
  isBusiness = false,
  onUsernameChange,
  onHeadlineChange,
  onPhoneChange,
  onCountryCodeChange,
  onWhatsAppChange,
  onPhotoChange,
  onNext,
  onSkip,
}: OnboardingStepPhoneProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = onboardingTranslations[language] || onboardingTranslations.en;
  
  const displayPhotoUrl = localPreviewUrl || photoUrl;
  const phoneValidation = validatePhoneNumber(phoneNumber, countryCode);
  const phonePlaceholder = getPhonePlaceholder(countryCode);
  const expectedLengthText = getExpectedLengthText(countryCode);

  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("slug", username.toLowerCase())
          .neq("id", user?.id || "")
          .maybeSingle();

        if (error) throw error;
        setIsUsernameAvailable(data === null);
      } catch (error) {
        console.error("Error checking username:", error);
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, user?.id]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t.selectImage);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t.imageTooLarge);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(previewUrl);

    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile_photos")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("profile_photos").getPublicUrl(fileName);
      if (!data.publicUrl) throw new Error("Could not get public URL");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ photo_url: data.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      onPhotoChange(data.publicUrl);
      setLocalPreviewUrl(null);
      toast.success(t.photoUpdated);
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      setLocalPreviewUrl(null);
      toast.error(t.photoError);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handlePhoneInput = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    onPhoneChange(digitsOnly);
  };

  const isPhoneValidForWhatsApp = phoneNumber.length > 0 && phoneValidation.isValid;

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
      {/* Profile Photo Upload */}
      <div className="flex flex-col items-center mb-8">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        
        <button onClick={handleFileSelect} disabled={isUploading} className="relative group transition-all duration-300">
          {!displayPhotoUrl && !isUploading && (
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 opacity-50 blur-sm animate-breath" />
          )}
          
          <Avatar className={`w-28 h-28 border-4 transition-all duration-300 relative ${
            displayPhotoUrl 
              ? 'border-green-500/50 ring-2 ring-green-500/20' 
              : 'border-pink-500/50 ring-4 ring-pink-500/20 group-hover:ring-pink-500/40'
          }`}>
            <AvatarImage src={displayPhotoUrl || undefined} alt={userName} className="object-cover transition-opacity duration-200" />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-2xl font-bold">
              {userName ? getInitials(userName) : <User className="w-12 h-12" />}
            </AvatarFallback>
          </Avatar>
          
          <div className={`absolute inset-0 flex items-center justify-center rounded-full transition-all duration-300 ${
            displayPhotoUrl 
              ? 'bg-black/0 group-hover:bg-black/50 opacity-0 group-hover:opacity-100' 
              : 'bg-black/30'
          }`}>
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : !displayPhotoUrl ? (
              <div className="flex flex-col items-center">
                <Camera className="w-8 h-8 text-white" />
                <span className="text-[10px] text-white font-medium mt-1">{t.add}</span>
              </div>
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </div>
          
          <div className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center border-3 border-[#1a1a2e] shadow-lg transition-all duration-200 ${
            displayPhotoUrl ? 'bg-green-500' : 'bg-gradient-to-br from-pink-500 to-purple-600'
          }`}>
            {isUploading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : displayPhotoUrl ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </div>
        </button>
        
        <div className="mt-4 text-center">
          {displayPhotoUrl ? (
            <p className="text-sm text-green-400 font-medium flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              {isUploading ? t.saving : t.photoAdded}
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-white font-medium">{t.addPhoto}</p>
              <p className="text-xs text-white/50">{t.photoBoost}</p>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        {t.welcome}{userName ? `, ${userName}` : ""}! 👋
      </h1>
      
      <p className="text-white/60 text-center mb-8">{t.setupProfile}</p>

      {/* Username Input */}
      <div className="space-y-3 mb-6">
        <label className="text-sm font-medium text-white/80">
          {t.username} <span className="text-pink-400">*</span>
        </label>
        <div className="relative">
          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder={t.usernamePlaceholder}
            value={username}
            onChange={(e) => onUsernameChange(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
            className="pl-12 pr-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isCheckingUsername && <Loader2 className="w-5 h-5 text-white/40 animate-spin" />}
            {!isCheckingUsername && isUsernameAvailable === true && username.length >= 3 && <CheckCircle className="w-5 h-5 text-green-500" />}
            {!isCheckingUsername && isUsernameAvailable === false && username.length >= 3 && <XCircle className="w-5 h-5 text-red-500" />}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-white/50">
            {t.publicLink} pocketcv.pt/u/{username || "username"}
          </p>
          {isUsernameAvailable === false && username.length >= 3 && (
            <p className="text-xs text-red-400">{t.usernameTaken}</p>
          )}
          {isUsernameAvailable === true && username.length >= 3 && (
            <p className="text-xs text-green-400">{t.usernameAvailable}</p>
          )}
        </div>
      </div>

      {/* Headline Input */}
      <div className="space-y-3 mb-6">
        <label className="text-sm font-medium text-white/80">
          {isBusiness 
            ? (language === 'pt' ? 'O teu cargo na empresa' : 'Your role at the company')
            : t.headline
          } <span className="text-pink-400">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder={isBusiness 
              ? (language === 'pt' ? 'Ex: CEO, Diretor de Marketing' : 'E.g.: CEO, Marketing Director')
              : t.headlinePlaceholder
            }
            value={headline}
            onChange={(e) => onHeadlineChange(e.target.value)}
            maxLength={100}
            className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-pink-500 focus:ring-pink-500/20"
          />
        </div>
        <p className="text-xs text-white/50">
          {isBusiness 
            ? (language === 'pt' ? 'O teu cargo aparece no perfil público da empresa.' : 'Your role appears on the company public profile.')
            : t.headlineHelp
          }
        </p>
      </div>

      {/* Phone Input */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white/80">{t.phoneNumber}</label>
          {phoneNumber && (
            <span className={`text-xs ${phoneValidation.isValid ? 'text-green-400' : 'text-yellow-400'}`}>
              {expectedLengthText}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <CountryCodeCombobox value={countryCode} onValueChange={onCountryCodeChange} />
          <div className="relative flex-1">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="tel"
              placeholder={phonePlaceholder}
              value={phoneNumber}
              onChange={(e) => handlePhoneInput(e.target.value)}
              className={`pl-12 pr-10 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-pink-500 focus:ring-pink-500/20 ${
                phoneNumber && !phoneValidation.isValid ? 'border-yellow-500/50' : ''
              } ${phoneNumber && phoneValidation.isValid ? 'border-green-500/50' : ''}`}
            />
            {phoneNumber && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {phoneValidation.isValid ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-yellow-500" />}
              </div>
            )}
          </div>
        </div>
        
        {phoneNumber && !phoneValidation.isValid ? (
          <p className="text-xs text-yellow-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {phoneValidation.message}
          </p>
        ) : phoneNumber && phoneValidation.isValid ? (
          <p className="text-xs text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {phoneValidation.message}
          </p>
        ) : (
          <p className="text-xs text-white/50">{t.phoneHelp}</p>
        )}
      </div>

      {/* WhatsApp Toggle */}
      {phoneNumber && (
        <div className={`flex items-center space-x-3 p-4 rounded-xl border mb-8 transition-all ${
          isPhoneValidForWhatsApp ? 'bg-[#25D366]/10 border-[#25D366]/30' : 'bg-white/5 border-white/10'
        }`}>
          <Checkbox
            id="whatsapp"
            checked={enableWhatsApp}
            onCheckedChange={(checked) => onWhatsAppChange(checked as boolean)}
            disabled={!isPhoneValidForWhatsApp}
            className="border-[#25D366] data-[state=checked]:bg-[#25D366] data-[state=checked]:border-[#25D366] disabled:opacity-50"
          />
          <label htmlFor="whatsapp" className={`flex items-center gap-2 text-sm font-medium cursor-pointer flex-1 ${
            isPhoneValidForWhatsApp ? 'text-white' : 'text-white/50'
          }`}>
            <MessageCircle className={`w-5 h-5 ${isPhoneValidForWhatsApp ? 'text-[#25D366]' : 'text-white/30'}`} />
            <div className="flex flex-col">
              <span>{t.addWhatsApp}</span>
              {!isPhoneValidForWhatsApp && (
                <span className="text-xs text-yellow-400/80">{t.fixNumber}</span>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={onNext}
          disabled={isUploading || !username.trim() || username.length < 3 || !headline.trim() || isCheckingUsername || isUsernameAvailable === false}
          className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl text-base disabled:opacity-50"
        >
          {t.continue}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        {!username.trim() && (
          <p className="text-xs text-pink-400 text-center">{t.usernameRequired}</p>
        )}
        {username.trim() && username.length < 3 && (
          <p className="text-xs text-pink-400 text-center">{t.usernameMinLength}</p>
        )}
        {username.length >= 3 && !headline.trim() && (
          <p className="text-xs text-pink-400 text-center">{t.headlineRequired}</p>
        )}
      </div>
    </div>
  );
};
