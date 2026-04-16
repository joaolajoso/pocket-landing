// Color themes for Business Public Page
export interface BusinessColorTheme {
  hex: string;
  name: string;
  gradient: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  textAccent: string;
  textLight: string;
  textMuted: string;
  border: string;
  buttonGradient: string;
}

// Predefined color themes for Business
export const businessColorThemes: Record<string, BusinessColorTheme> = {
  sky: {
    hex: "#0ea5e9",
    name: "Sky Blue",
    gradient: "from-[#0ea5e9] via-[#0284c7] to-[#1A1A1A]",
    accent: "bg-sky-500",
    accentHover: "hover:bg-sky-600",
    accentLight: "bg-sky-500/20",
    textAccent: "text-sky-400",
    textLight: "text-sky-300",
    textMuted: "text-sky-200/70",
    border: "border-sky-400/50",
    buttonGradient: "from-sky-500 to-cyan-400",
  },
  orange: {
    hex: "#f97316",
    name: "Orange",
    gradient: "from-[#f97316] via-[#ea580c] to-[#1A1A1A]",
    accent: "bg-orange-500",
    accentHover: "hover:bg-orange-600",
    accentLight: "bg-orange-500/20",
    textAccent: "text-orange-400",
    textLight: "text-orange-300",
    textMuted: "text-orange-200/70",
    border: "border-orange-400/50",
    buttonGradient: "from-orange-500 to-amber-400",
  },
  emerald: {
    hex: "#10b981",
    name: "Emerald",
    gradient: "from-[#10b981] via-[#059669] to-[#1A1A1A]",
    accent: "bg-emerald-500",
    accentHover: "hover:bg-emerald-600",
    accentLight: "bg-emerald-500/20",
    textAccent: "text-emerald-400",
    textLight: "text-emerald-300",
    textMuted: "text-emerald-200/70",
    border: "border-emerald-400/50",
    buttonGradient: "from-emerald-500 to-teal-400",
  },
  purple: {
    hex: "#8b5cf6",
    name: "Purple",
    gradient: "from-[#8b5cf6] via-[#7c3aed] to-[#1A1A1A]",
    accent: "bg-violet-500",
    accentHover: "hover:bg-violet-600",
    accentLight: "bg-violet-500/20",
    textAccent: "text-violet-400",
    textLight: "text-violet-300",
    textMuted: "text-violet-200/70",
    border: "border-violet-400/50",
    buttonGradient: "from-violet-500 to-purple-400",
  },
  rose: {
    hex: "#f43f5e",
    name: "Rose",
    gradient: "from-[#f43f5e] via-[#e11d48] to-[#1A1A1A]",
    accent: "bg-rose-500",
    accentHover: "hover:bg-rose-600",
    accentLight: "bg-rose-500/20",
    textAccent: "text-rose-400",
    textLight: "text-rose-300",
    textMuted: "text-rose-200/70",
    border: "border-rose-400/50",
    buttonGradient: "from-rose-500 to-pink-400",
  },
  amber: {
    hex: "#f59e0b",
    name: "Amber",
    gradient: "from-[#f59e0b] via-[#d97706] to-[#1A1A1A]",
    accent: "bg-amber-500",
    accentHover: "hover:bg-amber-600",
    accentLight: "bg-amber-500/20",
    textAccent: "text-amber-400",
    textLight: "text-amber-300",
    textMuted: "text-amber-200/70",
    border: "border-amber-400/50",
    buttonGradient: "from-amber-500 to-yellow-400",
  },
  teal: {
    hex: "#14b8a6",
    name: "Teal",
    gradient: "from-[#14b8a6] via-[#0d9488] to-[#1A1A1A]",
    accent: "bg-teal-500",
    accentHover: "hover:bg-teal-600",
    accentLight: "bg-teal-500/20",
    textAccent: "text-teal-400",
    textLight: "text-teal-300",
    textMuted: "text-teal-200/70",
    border: "border-teal-400/50",
    buttonGradient: "from-teal-500 to-cyan-400",
  },
  indigo: {
    hex: "#6366f1",
    name: "Indigo",
    gradient: "from-[#6366f1] via-[#4f46e5] to-[#1A1A1A]",
    accent: "bg-indigo-500",
    accentHover: "hover:bg-indigo-600",
    accentLight: "bg-indigo-500/20",
    textAccent: "text-indigo-400",
    textLight: "text-indigo-300",
    textMuted: "text-indigo-200/70",
    border: "border-indigo-400/50",
    buttonGradient: "from-indigo-500 to-blue-400",
  },
};

// Export preset colors as an array for UI pickers
export const BUSINESS_COLOR_PRESETS = Object.values(businessColorThemes).map(theme => ({
  hex: theme.hex,
  name: theme.name,
}));

// Helper to darken a hex color
export const darkenHex = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
};

// Generate theme from custom HEX
export const generateThemeFromHex = (hex: string): BusinessColorTheme => {
  const darkerHex = darkenHex(hex, 15);
  
  return {
    hex,
    name: "Custom",
    gradient: `from-[${hex}] via-[${darkerHex}] to-[#1A1A1A]`,
    accent: `bg-[${hex}]`,
    accentHover: `hover:bg-[${darkerHex}]`,
    accentLight: `bg-[${hex}]/20`,
    textAccent: `text-[${hex}]`,
    textLight: `text-[${hex}]/80`,
    textMuted: `text-[${hex}]/60`,
    border: `border-[${hex}]/50`,
    buttonGradient: `from-[${hex}] to-[${darkerHex}]`,
  };
};

// Get theme from accent_color
export const getBusinessTheme = (accentColor?: string | null): BusinessColorTheme => {
  if (!accentColor) return businessColorThemes.sky;
  
  // Check if it matches a predefined theme
  const predefinedKey = Object.keys(businessColorThemes).find(
    key => businessColorThemes[key].hex.toLowerCase() === accentColor.toLowerCase()
  );
  
  if (predefinedKey) {
    return businessColorThemes[predefinedKey];
  }
  
  // Generate custom theme
  return generateThemeFromHex(accentColor);
};
