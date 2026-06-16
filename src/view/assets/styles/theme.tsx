
const COLOR = {
  textBlack: "#2a2c40",
  textWhite: "#ffffff",
  textMediumGrey: "#D5D7DA",
  textDarkGrey: "#A4A7AE",
  textRed: "#dd4f4f",
  textSuccess: "#61b057",
  warning: "#fcce03",

  bgWhite: "#ffffff",
  bgPurple: "#e91e63",
  bgHalfWhite: "#F5F5F5",
  bgGrey: "#D5D7DA",

  btnGrey: "#E8EAEC",
  btnPurple: "#e91e63",
  border: "#E8EAEC",
  borderWhite: "#ffffff",

  // ── Semantic tokens (additive) ──────────────────────────────────────────────
  // Brand
  primary: "#e91e63",
  primaryDark: "#c2185b",
  primaryLight: "#FCE4EC",
  primarySoft: "#FFF1F6",

  // Surfaces & background
  surface: "#ffffff",
  surfaceAlt: "#F7F8FA",
  background: "#F6F7FB",
  overlay: "rgba(20,20,31,0.45)",

  // Text (higher-contrast secondary for better a11y than textDarkGrey)
  textPrimary: "#1F2230",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",

  // Status
  success: "#16A34A",
  successBg: "#E7F6EC",
  danger: "#DC2626",
  dangerBg: "#FDECEC",
  warningText: "#B45309",
  warningBg: "#FEF3E2",
  infoText: "#6C63FF",
  infoBg: "#EDE9FE",
};

const FONTWEIGHT = {
  Bold: 'DMSans-Bold',
  Medium: 'DMSans-Medium',
  Regular: 'DMSans-Regular',
};

const RADIUS = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  pill: 999,
};

const FONTSIZE = {
  small: 13,
  medium: 14,
  large: 16,
  Exlarge: 20,
};

// 4-point spacing scale for consistent rhythm across screens.
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Cross-platform elevation presets (iOS shadow + Android elevation).
const SHADOW = {
  sm: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  card: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
  },
};

const THEME = {
  COLOR,
  FONTWEIGHT,
  RADIUS,
  FONTSIZE,
  SPACING,
  SHADOW,
};

export { THEME };
