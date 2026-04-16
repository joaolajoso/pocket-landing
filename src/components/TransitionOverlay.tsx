
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface TransitionOverlayProps {
  isVisible: boolean;
  theme?: 'wine' | 'purple' | 'default';
}

const themeGradients = {
  wine: 'from-[#C41E5C] via-[#8B1E4B] to-[#1A1A1A]',
  purple: 'from-[#7C3AED] via-[#6D28D9] to-[#1A1A1A]',
  default: 'from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]',
};

const TransitionOverlay: React.FC<TransitionOverlayProps> = ({ 
  isVisible, 
  theme = 'wine' 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed inset-0 z-50 bg-gradient-to-b ${themeGradients[theme]} flex items-center justify-center`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
            <p className="text-white/50 text-sm font-medium">A carregar...</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransitionOverlay;
