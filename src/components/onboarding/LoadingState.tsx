import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Logo with animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-12"
      >
        <img 
          src="/lovable-uploads/pocketcv-logo-white.png" 
          alt="PocketCV" 
          className="h-12 md:h-16"
        />
      </motion.div>

      {/* Animated NFC Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            boxShadow: [
              "0 0 30px rgba(236, 72, 153, 0.3)",
              "0 0 60px rgba(236, 72, 153, 0.5)",
              "0 0 30px rgba(236, 72, 153, 0.3)"
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-28 h-28 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center"
        >
          <CreditCard className="w-14 h-14 text-white" />
        </motion.div>
      </motion.div>

      {/* Loading Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full bg-[#2A2A2A]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
      >
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <div className="w-10 h-10 border-3 border-pink-500/30 border-t-pink-500 rounded-full" style={{ borderWidth: '3px' }} />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl font-semibold text-white mb-2"
          >
            A verificar o seu cartão...
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/50 text-sm text-center"
          >
            Aguarde enquanto validamos o seu link de registo
          </motion.p>

          {/* Progress dots */}
          <div className="flex gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-pink-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-center"
      >
        <p className="text-white/30 text-xs">
          PocketCV © 2024 · Seu cartão de visitas digital
        </p>
      </motion.div>
    </div>
  );
};
