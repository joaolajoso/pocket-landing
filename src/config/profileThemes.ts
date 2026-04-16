// Centralized theme configuration — single source of truth for all profile color themes.
// Every component that needs theme colors MUST import from here.

export interface ProfileColorTheme {
  key: string;
  name: string;
  hex: string; // canonical hex stored in DB
  gradient: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  textAccent: string;
  textLight: string;
  textMuted: string;
  border: string;
  buttonGradient: string;
  swatch: string;
}

export const profileThemes: Record<string, ProfileColorTheme> = {
  wine: {
    key: 'wine',
    name: 'Vinho',
    hex: '#C41E5C',
    gradient: 'from-[#C41E5C] via-[#8B1E4B] to-[#1A1A1A]',
    accent: 'bg-pink-600',
    accentHover: 'hover:bg-pink-700',
    accentLight: 'bg-pink-600/20',
    textAccent: 'text-pink-500',
    textLight: 'text-pink-300',
    textMuted: 'text-pink-200/70',
    border: 'border-pink-400/50',
    buttonGradient: 'from-pink-600 to-purple-500',
    swatch: 'bg-[#C41E5C]',
  },
  green: {
    key: 'green',
    name: 'Verde',
    hex: '#059669',
    gradient: 'from-[#059669] via-[#047857] to-[#1A1A1A]',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    accentLight: 'bg-emerald-600/20',
    textAccent: 'text-emerald-500',
    textLight: 'text-emerald-300',
    textMuted: 'text-emerald-200/70',
    border: 'border-emerald-400/50',
    buttonGradient: 'from-emerald-600 to-teal-500',
    swatch: 'bg-[#059669]',
  },
  orange: {
    key: 'orange',
    name: 'Laranja',
    hex: '#EA580C',
    gradient: 'from-[#EA580C] via-[#C2410C] to-[#1A1A1A]',
    accent: 'bg-orange-600',
    accentHover: 'hover:bg-orange-700',
    accentLight: 'bg-orange-600/20',
    textAccent: 'text-orange-500',
    textLight: 'text-orange-300',
    textMuted: 'text-orange-200/70',
    border: 'border-orange-400/50',
    buttonGradient: 'from-orange-600 to-amber-500',
    swatch: 'bg-[#EA580C]',
  },
  gray: {
    key: 'gray',
    name: 'Cinza',
    hex: '#4B5563',
    gradient: 'from-[#4B5563] via-[#374151] to-[#1A1A1A]',
    accent: 'bg-gray-600',
    accentHover: 'hover:bg-gray-700',
    accentLight: 'bg-gray-600/20',
    textAccent: 'text-gray-400',
    textLight: 'text-gray-300',
    textMuted: 'text-gray-200/70',
    border: 'border-gray-400/50',
    buttonGradient: 'from-gray-600 to-slate-500',
    swatch: 'bg-[#4B5563]',
  },
  purple: {
    key: 'purple',
    name: 'Roxo',
    hex: '#7C3AED',
    gradient: 'from-[#7C3AED] via-[#6D28D9] to-[#1A1A1A]',
    accent: 'bg-violet-600',
    accentHover: 'hover:bg-violet-700',
    accentLight: 'bg-violet-600/20',
    textAccent: 'text-violet-500',
    textLight: 'text-violet-300',
    textMuted: 'text-violet-200/70',
    border: 'border-violet-400/50',
    buttonGradient: 'from-violet-600 to-purple-500',
    swatch: 'bg-[#7C3AED]',
  },
};

export type ThemeKey = keyof typeof profileThemes;

// All known legacy hex aliases mapped to their canonical theme key
const hexAliases: Record<string, ThemeKey> = {
  // Canonical
  '#C41E5C': 'wine',
  '#059669': 'green',
  '#EA580C': 'orange',
  '#4B5563': 'gray',
  '#7C3AED': 'purple',
  // Legacy aliases from old DashboardHeader palette
  '#722F37': 'wine',
  '#2D6A4F': 'green',
  '#E76F51': 'orange',
  '#6B7280': 'gray',
  // Gradient mid-points that might have been saved
  '#8B1E4B': 'wine',
  '#047857': 'green',
  '#C2410C': 'orange',
  '#374151': 'gray',
  '#6D28D9': 'purple',
};

/**
 * Resolve a theme from either a theme_key or a background_color hex.
 * Priority: theme_key > hex lookup > fallback to 'wine'.
 */
export const resolveTheme = (themeKey?: string | null, bgColor?: string | null): ProfileColorTheme => {
  // 1. Direct theme_key match
  if (themeKey && profileThemes[themeKey]) {
    return profileThemes[themeKey];
  }

  // 2. Hex alias lookup
  if (bgColor) {
    const normalized = bgColor.toUpperCase();
    const aliasKey = Object.keys(hexAliases).find(
      alias => normalized === alias.toUpperCase()
    );
    if (aliasKey) {
      return profileThemes[hexAliases[aliasKey]];
    }
  }

  // 3. Fallback
  return profileThemes.wine;
};

/** Array of themes for rendering palette pickers */
export const PROFILE_THEME_LIST = Object.values(profileThemes);
