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
    darkBlue: '#0B1B36',
    deepNavy: '#0B1B36',
    accentYellow: '#ffff00',
    gold: '#ffff00',
    slateGray: '#64748B',
    primary: '#2563EB',
    accent: '#ffff00',
    textPrimary: '#0B1B36',

    backgroundLight: '#F8FAFC',
    backgroundDark: '#0B1B36',
    background: '#F8FAFC',
    backgroundGradient: ['#2563EB', '#0B1B36', '#050E1E'],

    headerYellow: ['#ffff00', '#ffff00'],
    headerBlue: ['#ffff00', '#ffff00'],

    glassWhite: 'rgba(255, 255, 255, 0.88)',
    glassWhiteSoft: 'rgba(255, 255, 255, 0.65)',
    glassBlue: 'rgba(11, 27, 54, 0.96)',
    glassBlueSoft: 'rgba(37, 99, 235, 0.25)',
    glassBorder: 'rgba(255, 255, 255, 0.35)',
    cardBorder: 'rgba(255, 255, 0, 0.3)',

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
      shadowColor: '#ffff00',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 18,
      elevation: 6,
    },
    subtleGlow: {
      shadowColor: '#ffff00',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
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
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
    goldGlow: {
      shadowColor: '#ffff00',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
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
  headerGradient: ['#FFFFFF', '#FFFFFF'] as string[],
  headerTextPrimary: '#0B1B36',
  headerTextSecondary: 'rgba(11,27,54,0.75)',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  accent: '#ffff00',
  accentText: '#0B1B36',
  accentGlow: 'rgba(255,255,0,0.25)',
  border: 'rgba(11,27,54,0.08)',
  borderStrong: 'rgba(11,27,54,0.16)',
  divider: '#E2E8F0',
  sidebar: '#FFFFFF',
  sidebarBorder: '#E2E8F0',
  sidebarActive: '#FEF3C7',
  sidebarIndicator: '#0B1B36',
  sidebarLabel: '#64748B',
  sidebarLabelActive: '#0B1B36',
  sidebarIconBorder: 'rgba(0,0,0,0.06)',
  chip: '#F1F5F9',
  chipBorder: '#E2E8F0',
  chipText: '#475569',
  chipActive: '#0B1B36',
  chipActiveText: '#ffff00',
  cartCard: '#FFFFFF',
  cartBorder: '#E2E8F0',
  cartText: '#0F172A',
  cartSubText: '#64748B',
  billDivider: '#E2E8F0',
  searchBg: '#FFFFFF',
  searchBorder: 'rgba(11, 27, 54, 0.15)',
  searchText: '#0B1B36',
  searchPlaceholder: '#475569',
  statusBarStyle: 'dark-content' as 'dark-content' | 'light-content',
  statusBarBg: '#FFFFFF',
  iconDefault: '#0066CC',
  iconActive: '#0066CC',
  emptyIconBg: '#F1F5F9',
  emptyTitle: '#0F172A',
  emptySubtitle: '#64748B',
  payBarBg: 'rgba(255,255,255,0.98)',
  payBarBorder: 'rgba(0,0,0,0.08)',
  profileRowBg: '#FFFFFF',
  profileRowBorder: '#E2E8F0',
  profileRowText: '#0F172A',
  profileRowSubText: '#64748B',
  profileRowChevron: '#0066CC',
}

export const DARK_COLORS = {
  background: '#071224',
  backgroundSecondary: '#040D1A',
  surface: 'rgba(11,27,54,0.96)',
  surfaceSecondary: 'rgba(7,18,36,0.98)',
  surfaceCard: 'rgba(11,27,54,0.96)',
  headerGradient: ['#FFFFFF', '#FFFFFF'] as string[],
  headerTextPrimary: '#0B1B36',
  headerTextSecondary: 'rgba(11,27,54,0.75)',
  textPrimary: '#FFFFFF',
  textSecondary: '#829AB8',
  textMuted: '#4D6280',
  textInverse: '#0B1B36',
  accent: '#ffff00',
  accentText: '#0B1B36',
  accentGlow: 'rgba(255,255,0,0.2)',
  border: 'rgba(255,255,0,0.15)',
  borderStrong: 'rgba(255,255,0,0.3)',
  divider: 'rgba(255,255,255,0.07)',
  sidebar: 'rgba(7,18,36,0.98)',
  sidebarBorder: 'rgba(255,255,0,0.15)',
  sidebarActive: 'rgba(255,255,0,0.12)',
  sidebarIndicator: '#ffff00',
  sidebarLabel: '#829AB8',
  sidebarLabelActive: '#ffff00',
  sidebarIconBorder: 'rgba(255,255,0,0.2)',
  chip: 'rgba(255,255,255,0.07)',
  chipBorder: 'rgba(255,255,255,0.15)',
  chipText: '#829AB8',
  chipActive: '#ffff00',
  chipActiveText: '#0B1B36',
  cartCard: 'rgba(11,27,54,0.96)',
  cartBorder: 'rgba(255,255,0,0.15)',
  cartText: '#FFFFFF',
  cartSubText: '#829AB8',
  billDivider: 'rgba(255,255,0,0.2)',
  searchBg: '#FFFFFF',
  searchBorder: 'rgba(11,27,54,0.15)',
  searchText: '#0B1B36',
  searchPlaceholder: '#475569',
  statusBarStyle: 'dark-content' as 'dark-content' | 'light-content',
  statusBarBg: '#FFFFFF',
  iconDefault: '#0066CC',
  iconActive: '#0066CC',
  emptyIconBg: 'rgba(255,255,0,0.1)',
  emptyTitle: '#FFFFFF',
  emptySubtitle: '#829AB8',
  payBarBg: 'rgba(7,18,36,0.97)',
  payBarBorder: 'rgba(255,255,0,0.2)',
  profileRowBg: 'rgba(11,27,54,0.96)',
  profileRowBorder: 'rgba(255,255,0,0.15)',
  profileRowText: '#FFFFFF',
  profileRowSubText: '#829AB8',
  profileRowChevron: '#0066CC',
}

export type AppColors = typeof LIGHT_COLORS

export function getThemeColors(isDark: boolean): AppColors {
  return isDark ? (DARK_COLORS as AppColors) : LIGHT_COLORS
}
