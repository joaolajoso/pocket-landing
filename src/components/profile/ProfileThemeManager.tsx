
import { useEffect } from 'react';
import { useProfileDesign } from '@/hooks/profile/useProfileDesign';

interface ProfileTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
}

interface ProfileThemeManagerProps {
  theme: ProfileTheme;
  profileId?: string;
}

const ProfileThemeManager = ({ theme, profileId }: ProfileThemeManagerProps) => {
  const { settings } = useProfileDesign(profileId);
  
  // Helper function to convert hex color to HSL format for CSS variables
  const getHslFromHex = (hex: string): string => {
    // This is a simplified conversion - in a real app, you'd use a more accurate conversion
    const colorMap: Record<string, string> = {
      "#8b5cf6": "262.1 83.3% 57.8%", // Purple
      "#3b82f6": "217.2 91.2% 59.8%", // Blue
      "#22c55e": "142.1 70.6% 45.3%", // Green
      "#eab308": "47.9 95.8% 53.1%", // Yellow
      "#ef4444": "0 84.2% 60.2%", // Red
      "#0ea5e9": "199.2 89.7% 48.4%", // Sky Blue
      "#faf5ff": "270 100% 97.6%", // Light Purple
      "#eff6ff": "213.8 100% 96.9%", // Light Blue
      "#f0fdf4": "142.1 76.2% 97.3%", // Light Green
      "#fefce8": "48 100% 96.1%", // Light Yellow
      "#fef2f2": "0 85.7% 97.3%", // Light Red
      "#f0f9ff": "204 100% 97.1%", // Light Sky Blue
    };
    
    return colorMap[hex] || "262.1 83.3% 57.8%"; // Default to purple if not found
  };
  
  useEffect(() => {
    // Set design settings from the database if available
    if (settings) {
      // Apply background
      let backgroundStyle = '';
      if (settings.background_type === 'solid') {
        backgroundStyle = settings.background_color;
        document.documentElement.style.setProperty('--profile-bg', settings.background_color);
      } else if (settings.background_type === 'gradient' && settings.background_gradient_start && settings.background_gradient_end) {
        backgroundStyle = `linear-gradient(135deg, ${settings.background_gradient_start}, ${settings.background_gradient_end})`;
        document.documentElement.style.setProperty('--profile-bg', `linear-gradient(135deg, ${settings.background_gradient_start}, ${settings.background_gradient_end})`);
      } else if (settings.background_type === 'image' && settings.background_image_url) {
        backgroundStyle = `url(${settings.background_image_url}) center/cover no-repeat`;
        document.documentElement.style.setProperty('--profile-bg', `url(${settings.background_image_url})`);
        document.documentElement.style.setProperty('--profile-bg-position', 'center');
        document.documentElement.style.setProperty('--profile-bg-size', 'cover');
      }
      
      // Set text colors
      document.documentElement.style.setProperty('--profile-name-color', settings.name_color);
      document.documentElement.style.setProperty('--profile-description-color', settings.description_color);
      document.documentElement.style.setProperty('--profile-section-title-color', settings.section_title_color);
      document.documentElement.style.setProperty('--profile-link-text-color', settings.link_text_color);
      
      // Set button styles
      document.documentElement.style.setProperty('--profile-button-bg', settings.button_background_color);
      document.documentElement.style.setProperty('--profile-button-text', settings.button_text_color);
      document.documentElement.style.setProperty('--profile-button-icon', settings.button_icon_color);
      
      if (settings.button_border_color) {
        document.documentElement.style.setProperty('--profile-button-border', settings.button_border_color);
      }
      
      // Set layout
      document.documentElement.style.setProperty('--profile-text-align', settings.text_alignment);
      
      // Add font if needed
      if (settings.font_family && settings.font_family !== "Inter, sans-serif") {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.setAttribute('data-pocketcv-font', 'true');
        
        if (settings.font_family.includes('Roboto')) {
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
        } else if (settings.font_family.includes('Poppins')) {
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap';
        } else if (settings.font_family.includes('Open Sans')) {
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;700&display=swap';
        }
        
        if (fontLink.href) {
          document.head.appendChild(fontLink);
        }
        
        document.documentElement.style.setProperty('--profile-font-family', settings.font_family);
      }
    } else {
      // Fall back to the original theme implementation if no database settings
      // Convert hex colors to HSL format for CSS variables
      const primaryColorHsl = getHslFromHex(theme.primaryColor);
      const backgroundColorHsl = getHslFromHex(theme.backgroundColor);
      
      // Set theme based on user preferences
      document.documentElement.style.setProperty('--profile-primary-color', primaryColorHsl);
      document.documentElement.style.setProperty('--profile-bg-color', backgroundColorHsl);
      
      // Add custom font if needed
      if (theme.fontFamily && theme.fontFamily !== "Inter, sans-serif") {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.setAttribute('data-pocketcv-font', 'true');
        
        if (theme.fontFamily.includes('Roboto')) {
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
        } else if (theme.fontFamily.includes('Poppins')) {
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap';
        } else if (theme.fontFamily.includes('Open Sans')) {
          fontLink.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;700&display=swap';
        }
        
        if (fontLink.href) {
          document.head.appendChild(fontLink);
        }
      }
    }
    
    // Clean up custom CSS variables when component unmounts
    return () => {
      document.documentElement.style.removeProperty('--profile-primary-color');
      document.documentElement.style.removeProperty('--profile-bg-color');
      document.documentElement.style.removeProperty('--profile-bg');
      document.documentElement.style.removeProperty('--profile-bg-position');
      document.documentElement.style.removeProperty('--profile-bg-size');
      document.documentElement.style.removeProperty('--profile-name-color');
      document.documentElement.style.removeProperty('--profile-description-color');
      document.documentElement.style.removeProperty('--profile-section-title-color');
      document.documentElement.style.removeProperty('--profile-link-text-color');
      document.documentElement.style.removeProperty('--profile-button-bg');
      document.documentElement.style.removeProperty('--profile-button-text');
      document.documentElement.style.removeProperty('--profile-button-icon');
      document.documentElement.style.removeProperty('--profile-button-border');
      document.documentElement.style.removeProperty('--profile-text-align');
      document.documentElement.style.removeProperty('--profile-font-family');
      
      // Remove any added font links
      document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
        if (link.getAttribute('data-pocketcv-font')) {
          link.remove();
        }
      });
    };
  }, [settings, theme]);
  
  return null; // This component doesn't render anything, it just manages the theme
};

export default ProfileThemeManager;
