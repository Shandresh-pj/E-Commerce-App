export const BRAND_COLORS = {
  primary: '#2563EB',        // Electric Blue
  primaryPressed: '#1D4ED8',
  primaryHover: '#3B82F6',
  primarySoft: '#EFF6FF',
  primaryGlow: 'rgba(37, 99, 235, 0.25)',

  navy: '#0F172A',           // Deep Navy
  navyLight: '#1E293B',
  navyMuted: '#334155',

  gold: '#FBBF24',           // Premium Gold / Accent Yellow
  goldPressed: '#F59E0B',
  goldSoft: '#FEF3C7',
  goldGlow: 'rgba(251, 191, 36, 0.25)',

  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
} as const;

export const SEMANTIC_COLORS = {
  success: '#10B981',
  successSoft: '#ECFDF5',
  warning: '#F59E0B',
  warningSoft: '#FFFBEB',
  error: '#EF4444',
  errorSoft: '#FEF2F2',
  info: '#3B82F6',
  infoSoft: '#EFF6FF',
} as const;

export interface ThemeColors {
  brand: {
    primary: string;
    primaryPressed: string;
    primaryHover: string;
    primarySoft: string;
    gold: string;
    goldPressed: string;
    goldSoft: string;
    navy: string;
  };
  surface: {
    base: string;
    secondary: string;
    card: string;
    elevated: string;
    floating: string;
    interactive: string;
    selected: string;
    glass: string;
    glassBorder: string;
  };
  content: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    brand: string;
    gold: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
    focus: string;
    gold: string;
  };
  semantic: {
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    error: string;
    errorSoft: string;
    info: string;
    infoSoft: string;
  };
}

export const LIGHT_THEME_COLORS: ThemeColors = {
  brand: {
    primary: BRAND_COLORS.primary,
    primaryPressed: BRAND_COLORS.primaryPressed,
    primaryHover: BRAND_COLORS.primaryHover,
    primarySoft: BRAND_COLORS.primarySoft,
    gold: BRAND_COLORS.gold,
    goldPressed: BRAND_COLORS.goldPressed,
    goldSoft: BRAND_COLORS.goldSoft,
    navy: BRAND_COLORS.navy,
  },
  surface: {
    base: BRAND_COLORS.slate50,
    secondary: BRAND_COLORS.white,
    card: BRAND_COLORS.white,
    elevated: BRAND_COLORS.white,
    floating: BRAND_COLORS.white,
    interactive: BRAND_COLORS.slate100,
    selected: BRAND_COLORS.primarySoft,
    glass: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
  },
  content: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
    brand: BRAND_COLORS.primary,
    gold: '#D97706',
  },
  border: {
    subtle: '#F1F5F9',
    default: '#E2E8F0',
    strong: '#CBD5E1',
    focus: BRAND_COLORS.primary,
    gold: 'rgba(251, 191, 36, 0.4)',
  },
  semantic: SEMANTIC_COLORS,
};

export const DARK_THEME_COLORS: ThemeColors = {
  brand: {
    primary: '#3B82F6',
    primaryPressed: '#2563EB',
    primaryHover: '#60A5FA',
    primarySoft: 'rgba(37, 99, 235, 0.2)',
    gold: BRAND_COLORS.gold,
    goldPressed: BRAND_COLORS.goldPressed,
    goldSoft: 'rgba(251, 191, 36, 0.15)',
    navy: BRAND_COLORS.navy,
  },
  surface: {
    base: '#0B1329',
    secondary: '#0F172A',
    card: '#1E293B',
    elevated: '#334155',
    floating: '#1E293B',
    interactive: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(59, 130, 246, 0.25)',
    glass: 'rgba(30, 41, 59, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
  },
  content: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
    disabled: '#475569',
    inverse: '#0F172A',
    brand: '#60A5FA',
    gold: BRAND_COLORS.gold,
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.12)',
    strong: 'rgba(255, 255, 255, 0.24)',
    focus: '#60A5FA',
    gold: 'rgba(251, 191, 36, 0.35)',
  },
  semantic: SEMANTIC_COLORS,
};

