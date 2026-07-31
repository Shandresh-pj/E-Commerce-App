// Self-contained palette for the Delivery Partner flow.
// Deliberately separate from src/view/assets/styles/theme.tsx so the
// partner flow can evolve its own dark/lime brand without touching
// the customer app's theme tokens.
const PARTNER_COLOR = {
  bg: '#0B0D10',
  grid: '#16191D',
  surface: '#17191D',
  surfaceAlt: '#1D2024',
  border: '#2A2E33',
  borderFocus: '#C6FF4D',

  lime: '#C6FF4D',
  limeSoft: 'rgba(198,255,77,0.12)',
  green: '#1FAE59',
  greenPressed: '#178C48',

  textPrimary: '#FFFFFF',
  textSecondary: '#9A9FA6',
  textMuted: '#6B7076',

  danger: '#FF6B6B',
}

const PARTNER_FONT = {
  bold: 'DMSans-Bold',
  medium: 'DMSans-Medium',
  regular: 'DMSans-Regular',
}

export { PARTNER_COLOR, PARTNER_FONT }
