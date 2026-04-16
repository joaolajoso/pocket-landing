import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodSectionProps {
  paymentMethod: 'pix' | 'mbway';
  paymentKey: string;
  themeHex: string;
}

// PIX Icon SVG
const PixIcon = ({ className, color }: { className?: string; color?: string }) => (
  <svg 
    viewBox="0 0 512 512" 
    className={className}
    fill={color || "currentColor"}
  >
    <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.9 231.1 518.9 200.8 488.6L103.3 391.2H112.6C132.6 391.2 151.5 383.4 165.7 369.2L242.4 292.5zM262.5 218.9C257.1 224.4 247.9 224.4 242.4 218.9L165.7 142.2C151.5 128 132.6 120.2 112.6 120.2H103.3L200.4 23.1C230.7-7.2 279.9-7.2 310.2 23.1L407.3 120.2H392.6C372.6 120.2 353.7 128 339.5 142.2L262.5 218.9z" />
    <path d="M112.6 142.7C126.4 142.7 139.1 148.3 148.7 157.9L225.4 234.6C233.6 242.8 244.8 247.3 256.3 247.3C267.9 247.3 279.1 242.8 287.3 234.6L364 157.9C373.6 148.3 386.3 142.7 400.1 142.7H407.7L310.6 45.6C289.3 24.4 255.6 24.4 234.4 45.6L137.3 142.7H112.6zM400.1 368.8C386.3 368.8 373.6 363.2 364 353.6L287.3 276.9C270.5 260.1 241.8 260.1 225 276.9L148.3 353.6C138.7 363.2 126 368.8 112.2 368.8H137.3L234.4 465.9C255.6 487.1 289.3 487.1 310.6 465.9L407.7 368.8H400.1z" />
    <path d="M488.6 200.4L434.4 146.3C432.2 147.4 429.8 148.1 427.2 148.1H400.1C390.5 148.1 381.6 152.3 374.9 159L298.2 235.7C286.9 247 272.1 253.2 256.3 253.2C240.5 253.2 225.7 247 214.4 235.7L137.7 159C131 152.3 122.1 148.1 112.5 148.1H85.4C82.8 148.1 80.4 147.4 78.2 146.3L23.1 200.4C-7.2 230.7-7.2 279.9 23.1 310.2L78.2 365.3C80.4 364.2 82.8 363.5 85.4 363.5H112.5C122.1 363.5 131 359.3 137.7 352.6L214.4 275.9C237 253.3 275.5 253.3 298.2 275.9L374.9 352.6C381.6 359.3 390.5 363.5 400.1 363.5H427.2C429.8 363.5 432.2 362.8 434.4 361.7L488.6 310.2C518.9 279.9 518.9 230.7 488.6 200.4z" />
  </svg>
);

// MB WAY Icon
const MbWayIcon = ({ className, color }: { className?: string; color?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    fill={color || "currentColor"}
  >
    <circle cx="50" cy="50" r="45" fill="none" stroke={color || "currentColor"} strokeWidth="6" />
    <text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill={color || "currentColor"}>MB</text>
  </svg>
);

const PaymentMethodSection = ({ paymentMethod, paymentKey, themeHex }: PaymentMethodSectionProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentKey);
      setCopied(true);
      toast({
        title: "Chave copiada!",
        description: `A chave ${paymentMethod === 'pix' ? 'PIX' : 'MB WAY'} foi copiada para a área de transferência.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a chave.",
        variant: "destructive",
      });
    }
  };

  const isPix = paymentMethod === 'pix';
  const iconColor = isPix ? '#32BCAD' : '#CC0000';
  const bgColor = isPix ? 'rgba(50, 188, 173, 0.1)' : 'rgba(204, 0, 0, 0.1)';

  // Truncate long keys for display
  const displayKey = paymentKey.length > 30 
    ? `${paymentKey.slice(0, 15)}...${paymentKey.slice(-10)}`
    : paymentKey;

  return (
    <div className="rounded-xl bg-[#2A2A2A]/80 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
        {isPix ? (
            <PixIcon className="w-5 h-5" color={iconColor} />
          ) : (
            <MbWayIcon className="w-5 h-5" color={iconColor} />
          )}
        </div>
        <h2 className="text-sm font-bold text-white">
          {isPix ? 'Chave PIX' : 'MB WAY'}
        </h2>
      </div>
      
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between gap-3 p-3 rounded-lg bg-[#1A1A1A]/60 hover:bg-[#1A1A1A] transition-colors active:scale-[0.98] touch-manipulation"
      >
        <span className="text-white/90 text-sm font-mono truncate flex-1 text-left">
          {displayKey}
        </span>
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${themeHex}30` }}
        >
          {copied ? (
            <Check className="w-4 h-4" style={{ color: themeHex }} />
          ) : (
            <Copy className="w-4 h-4" style={{ color: themeHex }} />
          )}
        </div>
      </button>
      
      <p className="text-white/50 text-xs mt-2 text-center">
        Toque para copiar
      </p>
    </div>
  );
};

export default PaymentMethodSection;
