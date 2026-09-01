import { Dimensions, PixelRatio } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const baseWidth = 390
const baseHeight = 844

export const responsiveWidth = (size: number) => (SCREEN_WIDTH / baseWidth) * size
export const responsiveHeight = (size: number) => (SCREEN_HEIGHT / baseHeight) * size

export const scaleFont = (size: number) => {
  const scale = SCREEN_WIDTH / baseWidth
  const newSize = size * scale
  return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

export const getGridColumns = () => {
  if (SCREEN_WIDTH >= 1024) return 4
  if (SCREEN_WIDTH >= 768) return 3
  return 2
}

/* -------------------------------------------------------------------------- */
/*             PREMIUM BLUE & YELLOW ENTERPRISE DESIGN SYSTEM                  */
/* -------------------------------------------------------------------------- */
export const LIQUID_GLASS_THEME = {
  colors: {
    primaryBlue: '#2563EB',
    darkBlue: '#1E40AF',
    deepNavy: '#0F172A',
    lightBlue: '#DBEAFE',
    accentYellow: '#FBBF24',
    gold: '#F59E0B',
    slateGray: '#64748B',
    primary: '#2563EB',
    accent: '#FBBF24',
    textPrimary: '#111827',
    textSecondary: '#6B7280',

    backgroundLight: '#F8FAFC',
    backgroundDark: '#0F172A',
    background: '#F8FAFC',
    backgroundGradient: ['#2563EB', '#1E40AF', '#0F172A'],

    headerYellow: ['#FBBF24', '#F59E0B'],
    headerBlue: ['#2563EB', '#1E40AF'],

    glassWhite: 'rgba(255, 255, 255, 0.90)',
    glassWhiteSoft: 'rgba(255, 255, 255, 0.70)',
    glassBlue: 'rgba(37, 99, 235, 0.95)',
    glassBlueSoft: 'rgba(37, 99, 235, 0.15)',
    glassBorder: 'rgba(255, 255, 255, 0.35)',
    cardBorder: 'rgba(251, 191, 36, 0.3)',

    textDark: '#0F172A',
    textLight: '#FFFFFF',
    textMuted: '#64748B',

    categoryColors: [
      { bg: '#EFF6FF', border: '#BFDBFE' },
      { bg: '#FEF3C7', border: '#FDE68A' },
      { bg: '#F0FDF4', border: '#BBF7D0' },
      { bg: '#FAF5FF', border: '#E9D5FF' },
      { bg: '#FFF1F2', border: '#FECDD3' },
      { bg: '#F0FDFA', border: '#99F6E4' },
    ],

    productBgColors: [
      '#EFF6FF', '#FEF3C7', '#F0FDF4', '#FAF5FF',
      '#FFF1F2', '#F0FDFA', '#FEFCE8', '#EEF2FF',
    ],
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },

  shadows: {
    liquidGlass: {
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 18,
      elevation: 6,
    },
    subtleGlow: {
      shadowColor: '#FBBF24',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    glassSoft: {
      shadowColor: '#1E40AF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
    glassCard: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    },
    goldGlow: {
      shadowColor: '#FBBF24',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 18,
      elevation: 6,
    },
  },

  borderRadius: {
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    full: 9999,
  },
}

/* -------------------------------------------------------------------------- */
/*                      DARK / LIGHT MODE TOKEN PALETTES                       */
/* -------------------------------------------------------------------------- */

export const LIGHT_COLORS = {
  background: '#F5F7FB',
  backgroundSecondary: '#EEF2F8',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF2F8',
  surfaceCard: '#FFFFFF',
  headerGradient: ['#2563EB', '#1D4ED8'] as string[],
  headerTextPrimary: '#FFFFFF',
  headerTextSecondary: 'rgba(255, 255, 255, 0.88)',
  textPrimary: '#0B1220',
  textSecondary: '#526078',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  accent: '#F6C453',
  accentText: '#0B1220',
  accentGlow: 'rgba(246, 196, 83, 0.3)',
  border: 'rgba(15, 23, 42, 0.08)',
  borderStrong: 'rgba(15, 23, 42, 0.16)',
  divider: '#EEF2F8',
  sidebar: '#FFFFFF',
  sidebarBorder: 'rgba(15, 23, 42, 0.08)',
  sidebarActive: 'rgba(246, 196, 83, 0.18)',
  sidebarIndicator: '#2563EB',
  sidebarLabel: '#526078',
  sidebarLabelActive: '#1D4ED8',
  sidebarIconBorder: 'rgba(37, 99, 235, 0.12)',
  chip: '#EEF2F8',
  chipBorder: 'rgba(15, 23, 42, 0.08)',
  chipText: '#526078',
  chipActive: '#2563EB',
  chipActiveText: '#FFFFFF',
  cartCard: '#FFFFFF',
  cartBorder: 'rgba(15, 23, 42, 0.08)',
  cartText: '#0B1220',
  cartSubText: '#526078',
  billDivider: '#EEF2F8',
  searchBg: '#FFFFFF',
  searchBorder: 'rgba(15, 23, 42, 0.08)',
  searchText: '#0B1220',
  searchPlaceholder: '#94A3B8',
  statusBarStyle: 'dark-content' as 'dark-content' | 'light-content',
  statusBarBg: '#F5F7FB',
  iconDefault: '#2563EB',
  iconActive: '#F6C453',
  emptyIconBg: 'rgba(37, 99, 235, 0.12)',
  emptyTitle: '#0B1220',
  emptySubtitle: '#526078',
  payBarBg: 'rgba(255, 255, 255, 0.95)',
  payBarBorder: 'rgba(15, 23, 42, 0.08)',
  profileRowBg: '#FFFFFF',
  profileRowBorder: 'rgba(15, 23, 42, 0.08)',
  profileRowText: '#0B1220',
  profileRowSubText: '#526078',
  profileRowChevron: '#2563EB',
}

export const DARK_COLORS = {
  background: '#050816',
  backgroundSecondary: '#081126',
  surface: '#0D172B',
  surfaceSecondary: '#081126',
  surfaceCard: '#0D172B',
  headerGradient: ['#0D172B', '#050816'] as string[],
  headerTextPrimary: '#F8FAFC',
  headerTextSecondary: 'rgba(248, 250, 252, 0.8)',
  textPrimary: '#F8FAFC',
  textSecondary: '#A9B5C7',
  textMuted: '#94A3B8',
  textInverse: '#050816',
  accent: '#F6C453',
  accentText: '#050816',
  accentGlow: 'rgba(246, 196, 83, 0.25)',
  border: 'rgba(255, 255, 255, 0.10)',
  borderStrong: 'rgba(255, 255, 255, 0.22)',
  divider: 'rgba(255, 255, 255, 0.08)',
  sidebar: '#0D172B',
  sidebarBorder: 'rgba(255, 255, 255, 0.10)',
  sidebarActive: 'rgba(246, 196, 83, 0.18)',
  sidebarIndicator: '#F6C453',
  sidebarLabel: '#A9B5C7',
  sidebarLabelActive: '#F6C453',
  sidebarIconBorder: 'rgba(246, 196, 83, 0.25)',
  chip: 'rgba(255, 255, 255, 0.08)',
  chipBorder: 'rgba(255, 255, 255, 0.12)',
  chipText: '#A9B5C7',
  chipActive: '#F6C453',
  chipActiveText: '#050816',
  cartCard: '#0D172B',
  cartBorder: 'rgba(255, 255, 255, 0.10)',
  cartText: '#F8FAFC',
  cartSubText: '#A9B5C7',
  billDivider: 'rgba(255, 255, 255, 0.08)',
  searchBg: '#0D172B',
  searchBorder: 'rgba(255, 255, 255, 0.12)',
  searchText: '#F8FAFC',
  searchPlaceholder: '#64748B',
  statusBarStyle: 'light-content' as 'dark-content' | 'light-content',
  statusBarBg: '#050816',
  iconDefault: '#3B82F6',
  iconActive: '#F6C453',
  emptyIconBg: 'rgba(37, 99, 235, 0.18)',
  emptyTitle: '#F8FAFC',
  emptySubtitle: '#A9B5C7',
  payBarBg: 'rgba(13, 23, 43, 0.95)',
  payBarBorder: 'rgba(255, 255, 255, 0.10)',
  profileRowBg: '#0D172B',
  profileRowBorder: 'rgba(255, 255, 255, 0.10)',
  profileRowText: '#F8FAFC',
  profileRowSubText: '#A9B5C7',
  profileRowChevron: '#3B82F6',
}

export type AppColors = typeof LIGHT_COLORS

export function getThemeColors(isDark: boolean): AppColors {
  return isDark ? (DARK_COLORS as AppColors) : LIGHT_COLORS
}
