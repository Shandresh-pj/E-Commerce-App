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
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceCard: '#FFFFFF',
  headerGradient: ['#2563EB', '#1E40AF'] as string[],
  headerTextPrimary: '#FFFFFF',
  headerTextSecondary: 'rgba(255, 255, 255, 0.85)',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  accent: '#FBBF24',
  accentText: '#1E1B4B',
  accentGlow: 'rgba(251, 191, 36, 0.25)',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  divider: '#F1F5F9',
  sidebar: '#FFFFFF',
  sidebarBorder: '#E5E7EB',
  sidebarActive: '#FEF3C7',
  sidebarIndicator: '#2563EB',
  sidebarLabel: '#6B7280',
  sidebarLabelActive: '#1E40AF',
  sidebarIconBorder: 'rgba(37, 99, 235, 0.1)',
  chip: '#F1F5F9',
  chipBorder: '#E5E7EB',
  chipText: '#475569',
  chipActive: '#2563EB',
  chipActiveText: '#FFFFFF',
  cartCard: '#FFFFFF',
  cartBorder: '#E5E7EB',
  cartText: '#111827',
  cartSubText: '#6B7280',
  billDivider: '#F1F5F9',
  searchBg: '#FFFFFF',
  searchBorder: '#E5E7EB',
  searchText: '#111827',
  searchPlaceholder: '#9CA3AF',
  statusBarStyle: 'dark-content' as 'dark-content' | 'light-content',
  statusBarBg: '#FFFFFF',
  iconDefault: '#2563EB',
  iconActive: '#FBBF24',
  emptyIconBg: '#EFF6FF',
  emptyTitle: '#111827',
  emptySubtitle: '#6B7280',
  payBarBg: 'rgba(255, 255, 255, 0.98)',
  payBarBorder: '#E5E7EB',
  profileRowBg: '#FFFFFF',
  profileRowBorder: '#E5E7EB',
  profileRowText: '#111827',
  profileRowSubText: '#6B7280',
  profileRowChevron: '#2563EB',
}

export const DARK_COLORS = {
  background: '#0F172A',
  backgroundSecondary: '#020617',
  surface: '#1E293B',
  surfaceSecondary: '#0F172A',
  surfaceCard: '#1E293B',
  headerGradient: ['#1E293B', '#0F172A'] as string[],
  headerTextPrimary: '#F8FAFC',
  headerTextSecondary: 'rgba(248, 250, 252, 0.75)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  accent: '#FBBF24',
  accentText: '#0F172A',
  accentGlow: 'rgba(251, 191, 36, 0.2)',
  border: 'rgba(255, 255, 255, 0.1)',
  borderStrong: 'rgba(255, 255, 255, 0.2)',
  divider: 'rgba(255, 255, 255, 0.08)',
  sidebar: '#1E293B',
  sidebarBorder: 'rgba(255, 255, 255, 0.1)',
  sidebarActive: 'rgba(251, 191, 36, 0.15)',
  sidebarIndicator: '#FBBF24',
  sidebarLabel: '#94A3B8',
  sidebarLabelActive: '#FBBF24',
  sidebarIconBorder: 'rgba(251, 191, 36, 0.2)',
  chip: 'rgba(255, 255, 255, 0.08)',
  chipBorder: 'rgba(255, 255, 255, 0.12)',
  chipText: '#94A3B8',
  chipActive: '#FBBF24',
  chipActiveText: '#0F172A',
  cartCard: '#1E293B',
  cartBorder: 'rgba(255, 255, 255, 0.1)',
  cartText: '#F8FAFC',
  cartSubText: '#94A3B8',
  billDivider: 'rgba(255, 255, 255, 0.1)',
  searchBg: '#1E293B',
  searchBorder: 'rgba(255, 255, 255, 0.12)',
  searchText: '#F8FAFC',
  searchPlaceholder: '#64748B',
  statusBarStyle: 'light-content' as 'dark-content' | 'light-content',
  statusBarBg: '#0F172A',
  iconDefault: '#60A5FA',
  iconActive: '#FBBF24',
  emptyIconBg: 'rgba(37, 99, 235, 0.15)',
  emptyTitle: '#F8FAFC',
  emptySubtitle: '#94A3B8',
  payBarBg: 'rgba(30, 41, 59, 0.98)',
  payBarBorder: 'rgba(255, 255, 255, 0.1)',
  profileRowBg: '#1E293B',
  profileRowBorder: 'rgba(255, 255, 255, 0.1)',
  profileRowText: '#F8FAFC',
  profileRowSubText: '#94A3B8',
  profileRowChevron: '#60A5FA',
}

export type AppColors = typeof LIGHT_COLORS

export function getThemeColors(isDark: boolean): AppColors {
  return isDark ? (DARK_COLORS as AppColors) : LIGHT_COLORS
}
