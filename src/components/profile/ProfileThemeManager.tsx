
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
  
  // Helper function to load fonts
  const loadFont = (fontFamily: string) => {
    // Remove existing fonts first
    document.querySelectorAll('link[data-pocketcv-font]').forEach(link => {
      link.remove();
    });
    
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.setAttribute('data-pocketcv-font', 'true');
    
    if (fontFamily.includes('Roboto')) {
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
    } else if (fontFamily.includes('Poppins')) {
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap';
    } else if (fontFamily.includes('Open Sans')) {
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;700&display=swap';
    } else if (fontFamily.includes('Inter')) {
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap';
    }
    
    if (fontLink.href) {
      document.head.appendChild(fontLink);
      console.log('Loaded font:', fontFamily);
    }
  };
  
  useEffect(() => {
    console.log('ProfileThemeManager: Applying settings', settings);
    
    // Create a unique style ID for the applied styles
    const styleId = 'profile-theme-manager-styles';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    // Set design settings from the database if available
    if (settings) {
      // Prepare CSS rules
      let css = '';
      
      // Apply background
      let backgroundStyle = '';
      if (settings.background_type === 'solid') {
        backgroundStyle = settings.background_color;
        css += `
          :root {
            --profile-bg: ${settings.background_color};
          }
        `;
      } else if (settings.background_type === 'gradient' && settings.background_gradient_start && settings.background_gradient_end) {
        backgroundStyle = `linear-gradient(135deg, ${settings.background_gradient_start}, ${settings.background_gradient_end})`;
        css += `
          :root {
            --profile-bg: ${backgroundStyle};
          }
        `;
        console.log('Setting gradient for public profile:', backgroundStyle);
      } else if (settings.background_type === 'image' && settings.background_image_url) {
        backgroundStyle = `url(${settings.background_image_url})`;
        css += `
          :root {
            --profile-bg: ${backgroundStyle};
            --profile-bg-position: center;
            --profile-bg-size: cover;
          }
        `;
      }
      
      // Set text colors
      css += `
        :root {
          --profile-name-color: ${settings.name_color};
          --profile-description-color: ${settings.description_color};
          --profile-section-title-color: ${settings.section_title_color};
          --profile-link-text-color: ${settings.link_text_color};
          
          --profile-button-bg: ${settings.button_background_color};
          --profile-button-text: ${settings.button_text_color};
          --profile-button-icon: ${settings.button_icon_color};
          
          --profile-text-align: ${settings.text_alignment};
          --profile-font-family: ${settings.font_family};
        }
      `;
      
      if (settings.button_border_color) {
        css += `
          :root {
            --profile-button-border: ${settings.button_border_color};
          }
        `;
      }
      
      // Set the CSS in the style element
      styleEl.textContent = css;
      
      // Add font if needed
      if (settings.font_family) {
        loadFont(settings.font_family);
      }
    } else {
      // Fall back to the original theme implementation if no database settings
      // Convert hex colors to HSL format for CSS variables
      const primaryColorHsl = getHslFromHex(theme.primaryColor);
      const backgroundColorHsl = getHslFromHex(theme.backgroundColor);
      
      // Set theme based on user preferences
      const css = `
        :root {
          --profile-primary-color: ${primaryColorHsl};
          --profile-bg-color: ${backgroundColorHsl};
        }
      `;
      
      styleEl.textContent = css;
      
      // Add custom font if needed
      if (theme.fontFamily) {
        loadFont(theme.fontFamily);
      }
    }
    
    // Clean up custom CSS variables when component unmounts
    return () => {
      if (styleEl) {
        styleEl.remove();
      }
      
      // Remove any added font links
      document.querySelectorAll('link[data-pocketcv-font]').forEach(link => {
        link.remove();
      });
    };
  }, [settings, theme]);
  
  return null; // This component doesn't render anything, it just manages the theme
};

export default ProfileThemeManager;
