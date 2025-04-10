
import React from 'react';
import { ProfileDesignSettings } from '@/hooks/profile/useProfileDesign';

interface ProfileBackgroundProps {
  children: React.ReactNode;
  designSettings?: ProfileDesignSettings;
}

const ProfileBackground: React.FC<ProfileBackgroundProps> = ({ 
  children,
  designSettings 
}) => {
  // Create a function to generate background style based on design settings
  const getBackgroundStyle = () => {
    if (!designSettings) {
      return {
        background: "var(--profile-bg, var(--profile-bg-color))",
        backgroundPosition: "var(--profile-bg-position, center)",
        backgroundSize: "var(--profile-bg-size, cover)",
        fontFamily: "var(--profile-font-family, Inter, sans-serif)",
        textAlign: "var(--profile-text-align, center)" as "left" | "center" | "right"
      };
    }

    let style: React.CSSProperties = {
      fontFamily: designSettings.font_family || "Inter, sans-serif",
      textAlign: designSettings.text_alignment as "left" | "center" | "right"
    };

    // Set background based on type
    if (designSettings.background_type === 'solid') {
      style.backgroundColor = designSettings.background_color;
    } else if (designSettings.background_type === 'gradient' && 
               designSettings.background_gradient_start && 
               designSettings.background_gradient_end) {
      style.background = `linear-gradient(135deg, ${designSettings.background_gradient_start}, ${designSettings.background_gradient_end})`;
    } else if (designSettings.background_type === 'image' && designSettings.background_image_url) {
      style.backgroundImage = `url(${designSettings.background_image_url})`;
      style.backgroundPosition = 'center';
      style.backgroundSize = 'cover';
    }

    return style;
  };

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={getBackgroundStyle()}
    >
      {children}
    </div>
  );
};

export default ProfileBackground;
