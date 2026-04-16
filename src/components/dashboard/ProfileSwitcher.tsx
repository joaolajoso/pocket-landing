import { useState, useEffect } from "react";
import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileMode, ProfileModeType } from "@/hooks/useProfileMode";
import { useOrganization } from "@/hooks/organization/useOrganization";
import { motion } from "framer-motion";

interface ProfileSwitcherProps {
  className?: string;
}

const ProfileSwitcher = ({ className }: ProfileSwitcherProps) => {
  const { activeNfcProfile, setActiveNfcProfile, hasBusinessProfile, loading } = useProfileMode();
  const { organization } = useOrganization();
  
  // Local optimistic state for instant feedback
  const [optimisticMode, setOptimisticMode] = useState<ProfileModeType>(activeNfcProfile);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync optimistic state with actual state
  useEffect(() => {
    setOptimisticMode(activeNfcProfile);
  }, [activeNfcProfile]);

  // Don't render if user doesn't have business profile
  if (!hasBusinessProfile || loading) {
    return null;
  }

  const modes: { id: ProfileModeType; label: string; icon: typeof User }[] = [
    { id: 'personal', label: 'Pessoal', icon: User },
    { id: 'business', label: 'Business', icon: Building2 },
  ];

  const handleModeChange = async (mode: ProfileModeType) => {
    if (mode === optimisticMode || isUpdating) return;
    
    // Optimistic update - instant visual feedback
    setOptimisticMode(mode);
    setIsUpdating(true);
    
    // Persist to database
    const success = await setActiveNfcProfile(mode);
    
    // If failed, revert optimistic update
    if (!success) {
      setOptimisticMode(activeNfcProfile);
    }
    
    setIsUpdating(false);
  };

  return (
    <div className={cn("inline-flex", className)}>
      <div className="relative flex items-center p-0.5 bg-muted/40 border border-border/20 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-full bg-primary shadow-sm"
          initial={false}
          animate={{
            left: optimisticMode === 'personal' ? 2 : '50%',
          }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
        
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = optimisticMode === mode.id;
          
          return (
            <button
              key={mode.id}
              type="button"
              disabled={isUpdating}
              className={cn(
                "relative z-10 flex items-center justify-center rounded-full",
                "h-9 w-9 md:h-7 md:w-7",
                "transition-colors duration-200",
                "active:scale-95",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
                isUpdating && "opacity-70 cursor-wait"
              )}
              onClick={() => handleModeChange(mode.id)}
              title={mode.label}
            >
              <Icon className="h-5 w-5 md:h-3.5 md:w-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileSwitcher;
