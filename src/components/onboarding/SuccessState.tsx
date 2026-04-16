import { Link } from "react-router-dom";
import { ArrowLeft, Home, UserPlus, Sparkles, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SuccessStateProps {
  publicLink?: string | null;
  linkId: string;
  onSignupClick: () => void;
}

export const SuccessState = ({ publicLink, linkId, onSignupClick }: SuccessStateProps) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center">
      {/* Logo with animation */}
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

      {/* Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-2 mb-6"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white/90 hover:text-white hover:bg-white/10 gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4" 
          asChild
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white/90 hover:text-white hover:bg-white/10 gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4" 
          asChild
        >
          <Link to="/">
            <Home className="h-4 w-4" />
            Início
          </Link>
        </Button>
      </motion.div>

      {/* NFC Card Icon Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative">
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(236, 72, 153, 0.3)",
                "0 0 40px rgba(236, 72, 153, 0.5)",
                "0 0 20px rgba(236, 72, 153, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center"
          >
            <CreditCard className="w-12 h-12 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full bg-[#2A2A2A]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
      >
        <div className="text-center mb-6">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-white mb-3"
          >
            {publicLink ? "Perfil Encontrado!" : "Bem-vindo ao PocketCV"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-pink-300/80 text-base"
          >
            {publicLink 
              ? "Este cartão já está ativado e associado a um perfil." 
              : "O seu cartão de visitas digital está pronto para ser ativado."}
          </motion.p>
        </div>

        {publicLink ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <p className="text-white/70 text-center text-sm">
              Aceda ao perfil associado a este cartão clicando no botão abaixo.
            </p>
            <Button 
              asChild 
              className="w-full h-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-2xl border-0 text-base"
            >
              <Link to={`/u/${publicLink}`}>
                Ver perfil
              </Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-5"
          >
            {/* Features */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {[
                { icon: Zap, text: "Ativação instantânea" },
                { icon: CreditCard, text: "Cartão digital ilimitado" },
                { icon: Sparkles, text: "Partilha com um toque" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3"
                >
                  <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-pink-400" />
                  </div>
                  <span className="text-white/80 text-sm">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Card ID */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-xs text-white/40 text-center">
                ID do cartão: <span className="text-white/60 font-mono">{linkId.slice(0, 16)}...</span>
              </p>
            </div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={onSignupClick} 
                className="w-full h-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-2xl border-0 text-base shadow-lg shadow-pink-500/25"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Criar minha conta
              </Button>
            </motion.div>

            <p className="text-white/40 text-xs text-center">
              Já tem conta? <Link to="/login" className="text-pink-400 hover:text-pink-300 underline">Fazer login</Link>
            </p>
          </motion.div>
        )}
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
