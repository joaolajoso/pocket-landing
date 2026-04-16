import { useState, useRef } from "react";
import { Building2, ArrowRight, ArrowLeft, Camera, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface OnboardingStepCompanyProps {
  companyName: string;
  companySize: string;
  companyDescription: string;
  companyLogoUrl: string | null;
  onCompanyNameChange: (value: string) => void;
  onCompanySizeChange: (value: string) => void;
  onCompanyDescriptionChange: (value: string) => void;
  onCompanyLogoChange: (url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const OnboardingStepCompany = ({
  companyName,
  companySize,
  companyDescription,
  companyLogoUrl,
  onCompanyNameChange,
  onCompanySizeChange,
  onCompanyDescriptionChange,
  onCompanyLogoChange,
  onNext,
  onBack,
  onSkip,
}: OnboardingStepCompanyProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { language } = useLanguage();

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error(language === 'pt' ? 'Selecione uma imagem' : 'Please select an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'pt' ? 'Imagem demasiado grande (máx. 5MB)' : 'Image too large (max 5MB)');
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/company_logo_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("organization_logos")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("organization_logos").getPublicUrl(fileName);
      onCompanyLogoChange(data.publicUrl);
      toast.success(language === 'pt' ? 'Logo adicionado!' : 'Logo added!');
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error(language === 'pt' ? 'Erro ao carregar logo' : 'Error uploading logo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
      <h1 className="text-2xl font-bold text-white text-center mb-2">
        {language === 'pt' ? 'Sobre a sua empresa' : 'About your company'} 🏢
      </h1>
      <p className="text-white/60 text-center mb-8">
        {language === 'pt' ? 'Preencha os dados da sua empresa.' : 'Fill in your company details.'}
      </p>

      {/* Logo Upload */}
      <div className="flex justify-center mb-6">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="relative group"
        >
          <Avatar className="w-24 h-24 border-2 border-white/20 group-hover:border-white/40 transition-all">
            <AvatarImage src={companyLogoUrl || undefined} alt="Company logo" className="object-cover" />
            <AvatarFallback className="bg-blue-500/20 text-white">
              {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Building2 className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-[#1a1a2e]">
            {isUploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
          </div>
        </button>
      </div>
      <p className="text-xs text-white/40 text-center mb-6">
        {language === 'pt' ? 'Adicionar logo (opcional)' : 'Add logo (optional)'}
      </p>

      {/* Company Name */}
      <div className="space-y-3 mb-5">
        <label className="text-sm font-medium text-white/80">
          {language === 'pt' ? 'Nome da Empresa' : 'Company Name'} <span className="text-pink-400">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            placeholder={language === 'pt' ? 'Ex: Acme Inc.' : 'E.g.: Acme Inc.'}
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Company Size */}
      <div className="space-y-3 mb-5">
        <label className="text-sm font-medium text-white/80">
          {language === 'pt' ? 'Tamanho da Empresa' : 'Company Size'} <span className="text-pink-400">*</span>
        </label>
        <Select value={companySize} onValueChange={onCompanySizeChange}>
          <SelectTrigger className="h-14 bg-white/10 border-white/20 text-white rounded-xl focus:border-blue-500 focus:ring-blue-500/20 [&>span]:text-white/60">
            <SelectValue placeholder={language === 'pt' ? 'Selecionar tamanho' : 'Select size'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startup">1-10 {language === 'pt' ? 'colaboradores' : 'employees'}</SelectItem>
            <SelectItem value="small">11-50 {language === 'pt' ? 'colaboradores' : 'employees'}</SelectItem>
            <SelectItem value="medium">51-200 {language === 'pt' ? 'colaboradores' : 'employees'}</SelectItem>
            <SelectItem value="large">201-500 {language === 'pt' ? 'colaboradores' : 'employees'}</SelectItem>
            <SelectItem value="enterprise">501+ {language === 'pt' ? 'colaboradores' : 'employees'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Company Description */}
      <div className="space-y-3 mb-8">
        <label className="text-sm font-medium text-white/80">
          {language === 'pt' ? 'Descrição' : 'Description'} <span className="text-white/40">({language === 'pt' ? 'opcional' : 'optional'})</span>
        </label>
        <Textarea
          placeholder={language === 'pt' ? 'Uma breve descrição da sua empresa...' : 'A brief description of your company...'}
          value={companyDescription}
          onChange={(e) => onCompanyDescriptionChange(e.target.value)}
          maxLength={300}
          className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={onNext}
          disabled={!companyName.trim() || !companySize}
          className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-base disabled:opacity-50"
        >
          {language === 'pt' ? 'Continuar' : 'Continue'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full h-12 text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'pt' ? 'Voltar' : 'Back'}
        </Button>
      </div>
    </div>
  );
};
