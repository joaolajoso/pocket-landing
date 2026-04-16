
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';
import LeadCaptureDialog from './LeadCaptureDialog';
import ContactMeForm from './ContactMeForm';

interface ConnectionSplashProps {
  onComplete: () => void;
}

const ConnectionSplash = ({ onComplete }: ConnectionSplashProps) => {
  const { profile } = useProfile();
  const [isVisible, setIsVisible] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenSplash = localStorage.getItem(`pocketcv-splash-${profile?.id}`);
    
    if (!hasSeenSplash && profile?.id) {
      console.log("First time visiting this profile, showing splash and contact form");
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        
        // Show contact form after splash animation completes
        setTimeout(() => {
          setShowContactForm(true);
        }, 500);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      // If already seen, complete immediately
      console.log("Already visited this profile, skipping splash");
      onComplete();
    }
  }, [onComplete, profile?.id]);

  const handleCloseContactForm = () => {
    if (profile?.id) {
      localStorage.setItem(`pocketcv-splash-${profile.id}`, 'true');
    }
    setShowContactForm(false);
    onComplete();
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #8c52ff 0%, #ff914d 100%)"
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center text-white px-6 max-w-md"
            >
              <h1 className="text-4xl font-semibold mb-4 font-outfit">
                Você está conectado com
              </h1>
              {profile?.name && (
                <h2 className="text-3xl font-bold">{profile.name}</h2>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {profile && profile.email && profile.name && profile.id && (
        <LeadCaptureDialog 
          isOpen={showContactForm} 
          onClose={handleCloseContactForm} 
          ownerEmail={profile.email}
          ownerName={profile.name}
          profileOwnerId={profile.id}
          ownerPhotoUrl={profile.photo_url}
        />
      )}
    </>
  );
};

export default ConnectionSplash;
