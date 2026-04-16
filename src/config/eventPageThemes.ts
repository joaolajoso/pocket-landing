export interface EventPageTheme {
  key: string;
  name: string;
  namePt: string;
  emoji: string;
  // Page background
  pageBg: string;
  // Header
  headerBg: string;
  // Cover placeholder gradient
  coverGradient: string;
  // Card / input surfaces
  cardBg: string;
  cardBorder: string;
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textPlaceholder: string;
  // Accent dot (timeline)
  accentDot: string;
  // CTA button
  ctaBg: string;
  ctaText: string;
  ctaHoverBg: string;
  ctaShadow: string;
  // Switch active
  switchActive: string;
  // Swatch preview (for theme selector)
  swatch: string;
}

export const eventPageThemes: Record<string, EventPageTheme> = {
  purple: {
    key: 'purple',
    name: 'Cosmic',
    namePt: 'Cósmico',
    emoji: '🔮',
    pageBg: 'hsl(270, 30%, 12%)',
    headerBg: 'hsla(270, 30%, 12%, 0.9)',
    coverGradient: 'linear-gradient(135deg, hsl(300, 70%, 70%), hsl(270, 60%, 60%))',
    cardBg: 'hsla(270, 20%, 20%, 0.6)',
    cardBorder: 'rgba(255,255,255,0.05)',
    textPrimary: 'rgba(255,255,255,1)',
    textSecondary: 'rgba(255,255,255,0.5)',
    textMuted: 'rgba(255,255,255,0.4)',
    textPlaceholder: 'rgba(255,255,255,0.2)',
    accentDot: 'hsl(270, 80%, 65%)',
    ctaBg: '#ffffff',
    ctaText: '#111111',
    ctaHoverBg: 'rgba(255,255,255,0.9)',
    ctaShadow: 'rgba(255,255,255,0.05)',
    switchActive: 'hsl(270, 80%, 65%)',
    swatch: 'linear-gradient(135deg, hsl(300, 70%, 70%), hsl(270, 60%, 60%))',
  },
  sunset: {
    key: 'sunset',
    name: 'Sunset',
    namePt: 'Pôr do Sol',
    emoji: '🌅',
    pageBg: 'hsl(15, 40%, 10%)',
    headerBg: 'hsla(15, 40%, 10%, 0.9)',
    coverGradient: 'linear-gradient(135deg, hsl(30, 90%, 65%), hsl(350, 80%, 55%))',
    cardBg: 'hsla(15, 25%, 18%, 0.6)',
    cardBorder: 'rgba(255,180,120,0.08)',
    textPrimary: 'rgba(255,245,235,1)',
    textSecondary: 'rgba(255,200,160,0.55)',
    textMuted: 'rgba(255,200,160,0.4)',
    textPlaceholder: 'rgba(255,200,160,0.2)',
    accentDot: 'hsl(25, 95%, 60%)',
    ctaBg: 'hsl(25, 95%, 60%)',
    ctaText: '#ffffff',
    ctaHoverBg: 'hsl(25, 95%, 55%)',
    ctaShadow: 'rgba(255,140,50,0.15)',
    switchActive: 'hsl(25, 95%, 60%)',
    swatch: 'linear-gradient(135deg, hsl(30, 90%, 65%), hsl(350, 80%, 55%))',
  },
  midnight: {
    key: 'midnight',
    name: 'Midnight',
    namePt: 'Meia-Noite',
    emoji: '🌙',
    pageBg: 'hsl(220, 35%, 8%)',
    headerBg: 'hsla(220, 35%, 8%, 0.9)',
    coverGradient: 'linear-gradient(135deg, hsl(210, 60%, 50%), hsl(240, 50%, 30%))',
    cardBg: 'hsla(220, 25%, 15%, 0.6)',
    cardBorder: 'rgba(100,160,255,0.06)',
    textPrimary: 'rgba(220,235,255,1)',
    textSecondary: 'rgba(140,180,230,0.55)',
    textMuted: 'rgba(140,180,230,0.4)',
    textPlaceholder: 'rgba(140,180,230,0.2)',
    accentDot: 'hsl(210, 90%, 60%)',
    ctaBg: 'hsl(210, 90%, 60%)',
    ctaText: '#ffffff',
    ctaHoverBg: 'hsl(210, 90%, 55%)',
    ctaShadow: 'rgba(60,140,255,0.15)',
    switchActive: 'hsl(210, 90%, 60%)',
    swatch: 'linear-gradient(135deg, hsl(210, 60%, 50%), hsl(240, 50%, 30%))',
  },
  forest: {
    key: 'forest',
    name: 'Forest',
    namePt: 'Floresta',
    emoji: '🌿',
    pageBg: 'hsl(160, 30%, 8%)',
    headerBg: 'hsla(160, 30%, 8%, 0.9)',
    coverGradient: 'linear-gradient(135deg, hsl(150, 60%, 55%), hsl(180, 50%, 35%))',
    cardBg: 'hsla(160, 20%, 15%, 0.6)',
    cardBorder: 'rgba(80,200,160,0.06)',
    textPrimary: 'rgba(220,255,240,1)',
    textSecondary: 'rgba(130,210,180,0.55)',
    textMuted: 'rgba(130,210,180,0.4)',
    textPlaceholder: 'rgba(130,210,180,0.2)',
    accentDot: 'hsl(155, 75%, 50%)',
    ctaBg: 'hsl(155, 75%, 50%)',
    ctaText: '#0a2018',
    ctaHoverBg: 'hsl(155, 75%, 45%)',
    ctaShadow: 'rgba(40,200,130,0.15)',
    switchActive: 'hsl(155, 75%, 50%)',
    swatch: 'linear-gradient(135deg, hsl(150, 60%, 55%), hsl(180, 50%, 35%))',
  },
  noir: {
    key: 'noir',
    name: 'Noir',
    namePt: 'Noir',
    emoji: '🖤',
    pageBg: 'hsl(0, 0%, 6%)',
    headerBg: 'hsla(0, 0%, 6%, 0.9)',
    coverGradient: 'linear-gradient(135deg, hsl(0, 0%, 35%), hsl(0, 0%, 15%))',
    cardBg: 'hsla(0, 0%, 12%, 0.7)',
    cardBorder: 'rgba(255,255,255,0.04)',
    textPrimary: 'rgba(255,255,255,0.95)',
    textSecondary: 'rgba(255,255,255,0.45)',
    textMuted: 'rgba(255,255,255,0.3)',
    textPlaceholder: 'rgba(255,255,255,0.15)',
    accentDot: 'hsl(0, 0%, 100%)',
    ctaBg: '#ffffff',
    ctaText: '#000000',
    ctaHoverBg: 'rgba(255,255,255,0.85)',
    ctaShadow: 'rgba(255,255,255,0.05)',
    switchActive: 'hsl(0, 0%, 50%)',
    swatch: 'linear-gradient(135deg, hsl(0, 0%, 40%), hsl(0, 0%, 12%))',
  },
};

export const EVENT_THEME_LIST = Object.values(eventPageThemes);
export type EventThemeKey = keyof typeof eventPageThemes;
