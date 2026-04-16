
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { motion, PanInfo } from 'framer-motion';
import LeadCaptureForm from './LeadCaptureForm';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface LeadCapturePopupProps {
  profileOwnerId: string;
  profileOwnerName: string;
  profileOwnerEmail?: string;
  profileOwnerPhotoUrl?: string;
  onClose: () => void;
}

const LeadCapturePopup = ({ 
  profileOwnerId, 
  profileOwnerName, 
  profileOwnerEmail,
  profileOwnerPhotoUrl,
  onClose 
}: LeadCapturePopupProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get viewport height for calculations
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const collapsedHeight = Math.round(viewportHeight * 0.67); // 2/3 of screen
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const expandThreshold = -100; // Drag up threshold to expand
    const closeThreshold = 150; // Drag down threshold to close
    
    console.log('Drag info:', { offsetY: info.offset.y, velocityY: info.velocity.y, isExpanded });
    
    if (info.offset.y < expandThreshold && !isExpanded) {
      // Dragged up from collapsed state, expand
      console.log('Expanding popup');
      setIsExpanded(true);
    } else if (info.offset.y > closeThreshold) {
      // Dragged down significantly, close the popup
      console.log('Closing popup');
      onClose();
    }
    // If already expanded and dragged up, don't do anything (stay expanded)
    // If dragged down but not enough to close, return to current state
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Popup Container */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 pointer-events-auto"
        initial={{ y: "100%" }}
        animate={{
          y: 0,
          height: isExpanded ? "100vh" : `${collapsedHeight}px`
        }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <motion.div
          className="h-full bg-background shadow-2xl overflow-hidden flex flex-col"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          dragMomentum={false}
          animate={{
            borderRadius: isExpanded ? "0px" : "16px 16px 0px 0px"
          }}
          transition={{ duration: 0.3 }}
          style={{
            // Prevent the popup from moving beyond its container
            position: 'relative'
          }}
        >
          {/* Drag Handle */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-border cursor-grab active:cursor-grabbing">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto" />
                <button
                  onClick={toggleExpanded}
                  className="p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <ChevronUp 
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="text-center mb-6">
                {profileOwnerPhotoUrl && (
                  <div className="flex justify-center mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profileOwnerPhotoUrl} alt={profileOwnerName} />
                      <AvatarFallback className="text-sm">
                        {profileOwnerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Conecte-se com {profileOwnerName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhe seus dados para manter contato e receber atualizações
                </p>
              </div>
              
              <LeadCaptureForm
                profileOwnerId={profileOwnerId}
                profileOwnerName={profileOwnerName}
                profileOwnerEmail={profileOwnerEmail}
                profileOwnerPhotoUrl={profileOwnerPhotoUrl}
                onFormSubmitted={() => {
                  // Keep the popup open after form submission
                  // User can close it manually if they want
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LeadCapturePopup;
