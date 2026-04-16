import { Link } from "react-router-dom";
import { ArrowLeft, Home, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ErrorStateProps {
  error: string;
  details?: string;
}

export const ErrorState = ({ error, details }: ErrorStateProps) => {
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

      {/* Error Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, -5, 0]
            }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </motion.div>
        </div>
      </motion.div>

      {/* Error Card */}
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
            Link Inválido
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-red-300/80 text-base"
          >
            {error}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {details && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-white/50 text-xs text-center font-mono">
                {details}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full h-12 bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-2xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                asChild 
                className="w-full h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-2xl border-0"
              >
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Ir para página inicial
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
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
