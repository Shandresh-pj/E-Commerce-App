const COLOR = {
  primary: '#FFE000',
  primaryDark: '#141414',
  primaryLight: '#FFFBE0',
  primarySoft: '#FFF8D6',
  textOnPrimary: '#141414',

  dark: '#141414',
  darkSurface: '#262626',
  darkBorder: '#3a3a3a',

  surface: '#FFFFFF',
  surfaceAlt: '#F4F5F0',
  background: '#F4F5F0',

  glass: 'rgba(255,255,255,0.95)',
  glassBorder: 'rgba(255,255,255,0.65)',
  glassHeader: 'rgba(255,255,255,0.97)',
  glassBtn: 'rgba(255,255,255,0.85)',
  yellowGlass: 'rgba(255,224,0,0.68)',

  textPrimary: '#141414',
  textSecondary: '#6B6B6B',
  textTertiary: '#9a9a9a',
  textMuted: '#8a8a8a',
  textWhite: '#FFFFFF',
  textBlack: '#141414',

  success: '#0C831F',
  successBg: '#E8F7EA',
  successLight: '#E4F6E6',
  successBorder: '#9FD8A8',
  danger: '#C0392B',
  dangerBg: '#FFE4E0',
  dangerBorder: '#F2C7C2',
  warningText: '#D98A1F',
  warningBg: '#FFF0D6',

  border: '#E4E4E2',
  borderLight: '#F2F2F0',
  borderDash: '#D7D7D4',
  headerBorder: '#ECECEA',

  bgWhite: '#FFFFFF',
  bgPurple: '#141414',
  bgHalfWhite: '#F4F5F0',
  bgGrey: '#E4E4E2',
  btnGrey: '#F4F5F0',
  btnPurple: '#FFE000',
  borderWhite: '#FFFFFF',
  textMediumGrey: '#D5D7DA',
  textDarkGrey: '#9a9a9a',
  textRed: '#C0392B',
  textSuccess: '#0C831F',
  warning: '#FFE000',
  overlay: 'rgba(20,20,20,0.55)',
  infoText: '#0C831F',
  infoBg: '#E8F7EA',
}

const FONTWEIGHT = {
  Bold: 'DMSans-Bold',
  Medium: 'DMSans-Medium',
  Regular: 'DMSans-Regular',
}

const RADIUS = {
  xs: 8,
  small: 11,
  medium: 14,
  large: 16,
  xlarge: 18,
  xxlarge: 20,
  pill: 999,
}

const FONTSIZE = {
  xs: 11,
  small: 13,
  medium: 14,
  large: 16,
  xl: 18,
  xxl: 20,
  Exlarge: 20,
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

const SHADOW = {
  sm: {
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 22,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
  green: {
    shadowColor: '#0C831F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    shadowColor: '#1F1C14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
}

const THEME = {
  COLOR,
  FONTWEIGHT,
  RADIUS,
  FONTSIZE,
  SPACING,
  SHADOW,
}

export { THEME }
