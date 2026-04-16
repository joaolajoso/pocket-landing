import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface InteractiveCard3DProps {
  imageSrc: string;
  alt: string;
  className?: string;
}

export const InteractiveCard3D: React.FC<InteractiveCard3DProps> = ({
  imageSrc,
  alt,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Cache the bounding rect to avoid forced reflows on every mousemove
  const updateRect = React.useCallback(() => {
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
  }, []);

  React.useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = rectRef.current;
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -15;
    const rotateYValue = ((x - centerX) / centerX) * 15;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
      style={{
        perspective: '1000px',
      }}
    >
      <motion.div
        animate={{
          rotateX: isHovering ? rotateX : 0,
          rotateY: isHovering ? rotateY : 0,
          scale: isHovering ? 1.05 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        style={{
          transformStyle: 'preserve-3d',
        }}
        className="relative"
      >
        {/* Card thickness/depth layers */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900"
          style={{
            transform: 'translateZ(0px)',
            transformStyle: 'preserve-3d',
          }}
        />
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-600 dark:to-gray-800"
          style={{
            transform: 'translateZ(1px)',
            transformStyle: 'preserve-3d',
          }}
        />
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700"
          style={{
            transform: 'translateZ(2px)',
            transformStyle: 'preserve-3d',
          }}
        />
        
        {/* Main card image */}
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={className}
          style={{
            transform: 'translateZ(3px)',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        />
        
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            background: isHovering
              ? `radial-gradient(circle at ${50 + rotateY * 2}% ${50 - rotateX * 2}%, rgba(255,255,255,0.3) 0%, transparent 70%)`
              : 'transparent',
          }}
          transition={{
            duration: 0.2,
          }}
          style={{
            transform: 'translateZ(3px)',
            transformStyle: 'preserve-3d',
          }}
        />
        
        {/* Enhanced shadow effect */}
        <motion.div
          className="absolute inset-0 -z-10 blur-3xl opacity-40"
          animate={{
            x: isHovering ? -rotateY * 3 : 0,
            y: isHovering ? rotateX * 3 : 10,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--pocketcv-purple)), hsl(var(--pocketcv-coral)))',
            transform: 'translateZ(-20px)',
          }}
        />
      </motion.div>
    </div>
  );
};
