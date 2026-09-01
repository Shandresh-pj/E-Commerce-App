export const BRAND_COLORS = {
  primary: '#2563EB',        // Sapphire Blue (Light) / Electric Blue
  primaryHover: '#3B82F6',   // Secondary Blue
  primaryPressed: '#1D4ED8', // Ultra Blue
  primarySoft: 'rgba(37, 99, 235, 0.12)',
  primaryGlow: 'rgba(37, 99, 235, 0.35)',

  navy: '#050816',           // Midnight Navy Dark Background
  navyLight: '#081126',      // Dark Secondary
  navySurface: '#0D172B',    // Dark Surface
  navyElevated: '#111D34',   // Dark Elevated

  gold: '#F6C453',           // Champagne Gold
  goldChampagne: '#F8D889',  // Champagne Accent
  goldPressed: '#F59E0B',    // Warm Amber
  goldSoft: 'rgba(246, 196, 83, 0.15)',
  goldGlow: 'rgba(246, 196, 83, 0.35)',

  auroraCyan: '#22D3EE',     // Cyan Accent
  auroraViolet: '#8B5CF6',   // Violet Accent
  auroraMagenta: '#D946EF',  // Magenta Accent
  auroraEmerald: '#10B981',  // Emerald Accent

  white: '#FFFFFF',
  lightBase: '#F5F7FB',      // Pearl Light Base
  lightSecondary: '#EEF2F8', // Light Secondary
  slate50: '#F5F7FB',
  slate100: '#EEF2F8',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#526078',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0B1220',
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
    cyan: string;
    violet: string;
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
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    primaryHover: '#3B82F6',
    primarySoft: 'rgba(37, 99, 235, 0.10)',
    gold: '#F6C453',
    goldPressed: '#F59E0B',
    goldSoft: 'rgba(246, 196, 83, 0.15)',
    navy: '#0B1220',
    cyan: '#22D3EE',
    violet: '#8B5CF6',
  },
  surface: {
    base: '#F5F7FB',
    secondary: '#EEF2F8',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    floating: '#FFFFFF',
    interactive: '#EEF2F8',
    selected: 'rgba(37, 99, 235, 0.10)',
    glass: 'rgba(255, 255, 255, 0.72)',
    glassBorder: 'rgba(15, 23, 42, 0.08)',
  },
  content: {
    primary: '#0B1220',
    secondary: '#526078',
    tertiary: '#94A3B8',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
    brand: '#2563EB',
    gold: '#D97706',
  },
  border: {
    subtle: 'rgba(15, 23, 42, 0.05)',
    default: 'rgba(15, 23, 42, 0.08)',
    strong: 'rgba(15, 23, 42, 0.16)',
    focus: '#2563EB',
    gold: 'rgba(246, 196, 83, 0.45)',
  },
  semantic: SEMANTIC_COLORS,
};

export const DARK_THEME_COLORS: ThemeColors = {
  brand: {
    primary: '#3B82F6',
    primaryPressed: '#2563EB',
    primaryHover: '#60A5FA',
    primarySoft: 'rgba(59, 130, 246, 0.18)',
    gold: '#F6C453',
    goldPressed: '#F59E0B',
    goldSoft: 'rgba(246, 196, 83, 0.18)',
    navy: '#050816',
    cyan: '#22D3EE',
    violet: '#8B5CF6',
  },
  surface: {
    base: '#050816',
    secondary: '#081126',
    card: '#0D172B',
    elevated: '#111D34',
    floating: '#0D172B',
    interactive: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(59, 130, 246, 0.25)',
    glass: 'rgba(17, 29, 52, 0.72)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
  },
  content: {
    primary: '#F8FAFC',
    secondary: '#A9B5C7',
    tertiary: '#94A3B8',
    disabled: '#475569',
    inverse: '#050816',
    brand: '#60A5FA',
    gold: '#F6C453',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.22)',
    focus: '#60A5FA',
    gold: 'rgba(246, 196, 83, 0.40)',
  },
  semantic: SEMANTIC_COLORS,
};
