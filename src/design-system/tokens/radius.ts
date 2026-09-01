export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,       // Small controls / badges
  md: 12,      // Medium chips / steppers
  lg: 16,      // Large buttons / inner elements
  card: 20,    // Premium Product Cards
  floating: 24,// Floating Tab Bar / Search / Floating Headers
  xl: 24,      // Extended radius
  sheet: 32,   // Bottom Sheet / Product Detail Modals
  full: 9999,
} as const;

export type RadiusValue = keyof typeof RADIUS;
