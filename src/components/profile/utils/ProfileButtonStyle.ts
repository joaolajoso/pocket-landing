
import { ProfileDesignSettings } from "@/hooks/profile/useProfileDesign";
import { CSSProperties } from "react";

export const getButtonStyle = (designSettings?: ProfileDesignSettings): CSSProperties => {
  if (!designSettings) return {};
  
  let style: React.CSSProperties = {
    backgroundColor: designSettings.button_background_color || '#0ea5e9',
    color: designSettings.button_text_color || 'white',
  };
  
  if (designSettings.button_border_color) {
    style.border = `1px solid ${designSettings.button_border_color}`;
  }
  
  if (designSettings.button_border_style === 'all') {
    style.borderRadius = '0.375rem';
  }
  
  return style;
};
