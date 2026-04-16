import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CreditCard, Check, Sparkles, ArrowRight, Wifi, Share2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NfcActivationSuccessProps {
  userName?: string;
  profileSlug: string;
  onContinue: () => void;
}

// Confetti particle component
const ConfettiParticle = ({ delay, color, startX }: { delay: number; color: string; startX: number }) => (
  <motion.div
    className="absolute w-3 h-3"
    style={{
      left: `${startX}%`,
      backgroundColor: color,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    }}
    initial={{ top: -20, opacity: 1, scale: 1, rotate: 0 }}
    animate={{
      top: "110%",
      opacity: [1, 1, 0],
      scale: [1, 1.2, 0.5],
      rotate: Math.random() * 720 - 360,
      x: (Math.random() - 0.5) * 200,
    }}
    transition={{
      duration: 3 + Math.random() * 2,
      delay: delay,
      ease: "easeOut",
    }}
  />
);

// Sparkle burst component
const SparkleBurst = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute inset-0 flex items-center justify-center pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0] }}
    transition={{ duration: 1, delay }}
  >
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
        initial={{ scale: 0, x: 0, y: 0 }}
        animate={{
          scale: [0, 1, 0],
          x: Math.cos((i * Math.PI * 2) / 8) * 80,
          y: Math.sin((i * Math.PI * 2) / 8) * 80,
        }}
        transition={{ duration: 0.8, delay: delay + i * 0.05 }}
      />
    ))}
  </motion.div>
);

export const NfcActivationSuccess = ({ userName, profileSlug, onContinue }: NfcActivationSuccessProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { toast } = useToast();

  const profileUrl = `https://pocketcv.app/u/${profileSlug}`;
  const shareText = userName 
    ? `Acabei de ativar o meu cartão de visitas digital PocketCV! 🚀 Agora podes conhecer-me melhor com um simples toque. Vê o meu perfil:`
    : `Acabei de ativar o meu cartão de visitas digital PocketCV! 🚀 Vê o meu perfil:`;

  const confettiColors = [
    "#EC4899", // pink-500
    "#8B5CF6", // violet-500
    "#06B6D4", // cyan-500
    "#F59E0B", // amber-500
    "#10B981", // emerald-500
    "#6366F1", // indigo-500
  ];

  useEffect(() => {
    // Trigger animations sequentially
    const confettiTimer = setTimeout(() => setShowConfetti(true), 400);
    const contentTimer = setTimeout(() => setShowContent(true), 800);
    
    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link copiado!",
        description: "O link do seu perfil foi copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName ? userName + ' - ' : ''}PocketCV`,
          text: shareText,
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const shareOptions = [
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      color: "bg-[#0A66C2]",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "X",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: "bg-black",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
    },
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: "bg-[#25D366]",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + profileUrl)}`,
    },
    {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: "bg-[#1877F2]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7C3AED] via-[#6D28D9] to-[#1A1A1A] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Confetti particles */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
            {[...Array(50)].map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 0.08}
                color={confettiColors[i % confettiColors.length]}
                startX={Math.random() * 100}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <img 
            src="/lovable-uploads/pocketcv-logo-white.png" 
            alt="PocketCV" 
            className="h-12 md:h-16"
          />
        </motion.div>

        {/* Animated NFC Card with success state */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mb-8"
        >
          {/* Sparkle burst effect */}
          <SparkleBurst delay={0.6} />
          
          {/* Pulsing ring effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-pink-400"
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            style={{ margin: '-8px' }}
          />
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-purple-400"
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
            style={{ margin: '-8px' }}
          />

          {/* Card container */}
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 30px rgba(236, 72, 153, 0.4)",
                "0 0 60px rgba(139, 92, 246, 0.5)",
                "0 0 30px rgba(236, 72, 153, 0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 rounded-3xl flex items-center justify-center relative"
          >
            {/* NFC waves */}
            <motion.div
              className="absolute top-3 right-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Wifi className="w-5 h-5 text-white/60 rotate-45" />
            </motion.div>

            {/* Card icon with checkmark overlay */}
            <div className="relative">
              <CreditCard className="w-14 h-14 text-white" />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main content card */}
        <AnimatePresence>
          {showContent && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full bg-[#2A2A2A]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
            >
              {/* Success message */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4"
                >
                  <Sparkles className="w-4 h-4" />
                  Cartão Ativado!
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-white mb-3"
                >
                  Parabéns{userName ? `, ${userName}` : ''}! 🎉
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/70 text-base leading-relaxed"
                >
                  O seu cartão NFC PocketCV foi ativado com sucesso e está agora ligado ao seu perfil digital.
                </motion.p>
              </div>

              {/* Features checklist */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 mb-6"
              >
                {[
                  "Partilhe o seu perfil com um simples toque",
                  "Os seus contactos podem aceder instantaneamente",
                  "Atualizações em tempo real no seu perfil",
                ].map((text, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                  >
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-white/80 text-sm">{text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Profile link preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-4 border border-white/5 mb-4"
              >
                <p className="text-xs text-white/40 text-center mb-1">O seu perfil público</p>
                <p className="text-white/90 text-center font-mono text-sm">
                  pocketcv.app/u/{profileSlug}
                </p>
              </motion.div>

              {/* Share Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="mb-6"
              >
                <p className="text-xs text-white/50 text-center mb-3">Partilhar nas redes sociais</p>
                
                {/* Share buttons row */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  {shareOptions.map((option, index) => (
                    <motion.a
                      key={option.name}
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.05 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-10 h-10 ${option.color} rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow`}
                      title={`Partilhar no ${option.name}`}
                    >
                      {option.icon}
                    </motion.a>
                  ))}
                  
                  {/* Copy link button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white border border-white/20 transition-colors"
                    title="Copiar link"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                  
                  {/* Native share button (mobile) */}
                  {typeof navigator !== 'undefined' && navigator.share && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.25 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNativeShare}
                      className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg"
                      title="Mais opções de partilha"
                    >
                      <Share2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onContinue}
                  className="w-full h-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-2xl border-0 text-base shadow-lg shadow-pink-500/25"
                >
                  Ver o meu perfil
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <p className="text-white/30 text-xs">
            PocketCV © 2024 · Seu cartão de visitas digital
          </p>
        </motion.div>
      </div>
    </div>
  );
};
