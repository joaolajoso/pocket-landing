import { useState } from "react";
import { Users, ArrowRight, ArrowLeft, X, Mail, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface OnboardingStepInviteTeamProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const OnboardingStepInviteTeam = ({
  emails,
  onEmailsChange,
  onNext,
  onBack,
  onSkip,
}: OnboardingStepInviteTeamProps) => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const { language } = useLanguage();

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email.trim());

  const addEmail = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Support comma/space separated emails
    const newEmails = trimmed.split(/[,;\s]+/).filter(e => e.length > 0);
    const validEmails: string[] = [];
    
    for (const email of newEmails) {
      if (!isValidEmail(email)) {
        setInputError(language === 'pt' ? `"${email}" não é um email válido` : `"${email}" is not a valid email`);
        return;
      }
      if (emails.includes(email.toLowerCase())) {
        setInputError(language === 'pt' ? 'Este email já foi adicionado' : 'This email is already added');
        return;
      }
      validEmails.push(email.toLowerCase());
    }

    setInputError("");
    onEmailsChange([...emails, ...validEmails]);
    setInputValue("");
  };

  const removeEmail = (index: number) => {
    onEmailsChange(emails.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">
        {language === 'pt' ? 'Convide a sua equipa' : 'Invite your team'} 🎉
      </h1>
      <p className="text-white/60 text-center mb-8 text-sm">
        {language === 'pt' 
          ? 'Adicione os emails dos seus colaboradores. Pode sempre convidar mais pessoas depois no dashboard.' 
          : 'Add your team members\' emails. You can always invite more people later from the dashboard.'}
      </p>

      {/* Email Input */}
      <div className="space-y-3 mb-4">
        <label className="text-sm font-medium text-white/80">
          {language === 'pt' ? 'Email do colaborador' : 'Team member email'}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="email"
              placeholder={language === 'pt' ? 'nome@empresa.com' : 'name@company.com'}
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setInputError(""); }}
              onKeyDown={handleKeyDown}
              className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <Button
            type="button"
            onClick={addEmail}
            disabled={!inputValue.trim()}
            className="h-14 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl border border-blue-500/30"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        {inputError && <p className="text-xs text-red-400">{inputError}</p>}
        <p className="text-xs text-white/40">
          {language === 'pt' ? 'Pressione Enter ou vírgula para adicionar' : 'Press Enter or comma to add'}
        </p>
      </div>

      {/* Email List */}
      {emails.length > 0 && (
        <div className="space-y-2 mb-6 max-h-[200px] overflow-y-auto">
          {emails.map((email, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm text-white truncate">{email}</span>
              </div>
              <button
                onClick={() => removeEmail(index)}
                className="text-white/30 hover:text-red-400 transition-colors shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <p className="text-xs text-white/40 text-center">
            {emails.length} {language === 'pt' 
              ? (emails.length === 1 ? 'convite pendente' : 'convites pendentes') 
              : (emails.length === 1 ? 'pending invite' : 'pending invites')}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {emails.length > 0 ? (
          <Button
            onClick={onNext}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-base"
          >
            <Send className="w-5 h-5 mr-2" />
            {language === 'pt' ? `Enviar ${emails.length} convite${emails.length > 1 ? 's' : ''} e concluir` : `Send ${emails.length} invite${emails.length > 1 ? 's' : ''} & finish`}
          </Button>
        ) : (
          <Button
            onClick={onSkip}
            className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-base"
          >
            {language === 'pt' ? 'Concluir sem convidar' : 'Finish without inviting'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
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
