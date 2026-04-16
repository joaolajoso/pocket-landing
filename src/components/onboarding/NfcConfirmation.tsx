
import { ShieldAlert, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NfcConfirmationProps {
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const NfcConfirmation = ({
  userName,
  userEmail,
  avatarUrl,
  onConfirm,
  onCancel,
  isLoading = false,
}: NfcConfirmationProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7C3AED] via-[#6D28D9] to-[#1A1A1A] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 md:p-8 space-y-6">
          {/* Warning icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Confirmar Ativação do Cartão
            </h2>
            <p className="text-white/60 text-sm">
              Tem a certeza que pretende associar este cartão NFC à sua conta?
            </p>
          </div>

          {/* Account info card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                <User className="w-6 h-6 text-white/60" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-white font-semibold truncate">{userName || "Utilizador"}</p>
              <p className="text-white/50 text-sm truncate">{userEmail}</p>
            </div>
          </div>

          {/* Warning message */}
          <div className="bg-amber-500/10 border border-amber-400/20 rounded-lg p-3">
            <p className="text-amber-200 text-sm text-center leading-relaxed">
              ⚠️ Este cartão NFC será <strong>permanentemente</strong> associado à conta{" "}
              <strong>{userName || userEmail}</strong>. Esta ação <strong>não pode ser revertida</strong>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full h-12 bg-pocketcv-purple hover:bg-pocketcv-purple/90 text-white font-semibold rounded-xl text-base"
            >
              {isLoading ? "A ativar..." : "Confirmar Ativação"}
            </Button>
            <Button
              onClick={onCancel}
              disabled={isLoading}
              variant="ghost"
              className="w-full h-12 text-white/70 hover:text-white hover:bg-white/10 rounded-xl text-base"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
