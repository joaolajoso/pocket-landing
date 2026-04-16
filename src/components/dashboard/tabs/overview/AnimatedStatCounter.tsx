import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnimatedStatCounterProps {
  total: number;
  weeklyNew: number;
  label: string;
  loading?: boolean;
  storageKey: string;
  valueClassName?: string;
  labelClassName?: string;
}

const AnimatedStatCounter = ({
  total,
  weeklyNew,
  label,
  loading = false,
  storageKey,
  valueClassName = "text-pocketcv-purple dark:text-purple-300",
  labelClassName = "text-muted-foreground",
}: AnimatedStatCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<"adding" | "counting" | "done">("done");
  const hasAnimated = useRef(false);
  
  useEffect(() => {
    if (loading || hasAnimated.current) return;
    
    const sessionKey = `animated_stat_${storageKey}`;
    const hasShownThisSession = sessionStorage.getItem(sessionKey);
    
    if (!hasShownThisSession && weeklyNew > 0) {
      sessionStorage.setItem(sessionKey, "true");
      hasAnimated.current = true;
      
      const baseValue = Math.max(0, total - weeklyNew);
      setDisplayValue(baseValue);
      setAnimationPhase("adding");
      
      // Brief pause to show base value, then count up
      setTimeout(() => {
        setAnimationPhase("counting");
        
        // Fast counting animation - rapid unit increments
        const totalSteps = Math.min(weeklyNew, 20); // Max 20 steps for speed
        const stepValue = weeklyNew / totalSteps;
        const stepDuration = 600 / totalSteps; // Complete in 600ms
        let currentStep = 0;
        
        const interval = setInterval(() => {
          currentStep++;
          if (currentStep >= totalSteps) {
            setDisplayValue(total);
            clearInterval(interval);
            setTimeout(() => setAnimationPhase("done"), 300);
          } else {
            setDisplayValue(Math.round(baseValue + stepValue * currentStep));
          }
        }, stepDuration);
      }, 800);
    } else {
      setDisplayValue(total);
      setAnimationPhase("done");
      hasAnimated.current = true;
    }
  }, [loading, total, weeklyNew, storageKey]);
  
  useEffect(() => {
    if (animationPhase === "done" && !loading) {
      setDisplayValue(total);
    }
  }, [total, animationPhase, loading]);

  if (loading) {
    return (
      <div className="flex flex-col min-w-0">
        <div className={`text-2xl md:text-3xl font-bold ${valueClassName}`}>
          ...
        </div>
        <div className={`text-xs ${labelClassName} break-words leading-tight`}>
          {label}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex flex-col min-w-0 cursor-pointer group">
            {/* Subtle "+X" indicator during adding phase */}
            {animationPhase === "adding" && weeklyNew > 0 && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute -top-5 left-0 text-xs font-medium text-green-600 dark:text-green-400"
              >
                +{weeklyNew}
              </motion.span>
            )}

            {/* Main counter value */}
            <div className={`text-2xl md:text-3xl font-bold ${valueClassName} tabular-nums`}>
              <span className={animationPhase === "counting" ? "transition-opacity duration-75" : ""}>
                {displayValue.toLocaleString()}
              </span>
            </div>
            
            {/* Label */}
            <div className={`text-xs ${labelClassName} break-words leading-tight`}>
              {label}
            </div>
            
            {/* Subtle underline on hover when there's weekly data */}
            {weeklyNew !== 0 && animationPhase === "done" && (
              <div className="absolute -bottom-0.5 left-0 right-0 h-px bg-green-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent 
          side="top" 
          className="bg-card border shadow-lg p-3"
        >
          <div className="flex flex-col gap-1 text-center">
            <span className="text-xs text-muted-foreground">Esta semana</span>
            <span className={`text-lg font-semibold ${
              weeklyNew > 0 
                ? 'text-green-600 dark:text-green-400' 
                : weeklyNew < 0 
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-muted-foreground'
            }`}>
              {weeklyNew > 0 ? '+' : ''}{weeklyNew}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AnimatedStatCounter;
