import { useWindowDimensions } from 'react-native'

// Breakpoints based on the device's shorter side so orientation doesn't flip
// a phone into "tablet" mode when rotated to landscape.
const TABLET_MIN = 600
const LARGE_TABLET_MIN = 840

export type Breakpoint = 'phone' | 'tablet' | 'large'

export interface Responsive {
  width: number
  height: number
  isLandscape: boolean
  isTablet: boolean
  isLargeTablet: boolean
  breakpoint: Breakpoint
  /** Pick a value per breakpoint, falling back to the phone value. */
  select: <T>(opts: { phone: T; tablet?: T; large?: T }) => T
  /** Number of grid columns for the current width. */
  columns: (phone: number, tablet: number, large: number) => number
  /** Width of one cell in an evenly-gapped grid. */
  cellWidth: (totalWidth: number, cols: number, hPad: number, gutter: number) => number
}

export const useResponsive = (): Responsive => {
  const { width, height } = useWindowDimensions()
  const shortSide = Math.min(width, height)
  const isLandscape = width > height
  const isLargeTablet = shortSide >= LARGE_TABLET_MIN
  const isTablet = shortSide >= TABLET_MIN
  const breakpoint: Breakpoint = isLargeTablet ? 'large' : isTablet ? 'tablet' : 'phone'

  return {
    width,
    height,
    isLandscape,
    isTablet,
    isLargeTablet,
    breakpoint,
    select: opts =>
      breakpoint === 'large'
        ? opts.large ?? opts.tablet ?? opts.phone
        : breakpoint === 'tablet'
        ? opts.tablet ?? opts.phone
        : opts.phone,
    columns: (phone, tablet, large) =>
      isLargeTablet ? large : isTablet ? tablet : phone,
    cellWidth: (totalWidth, cols, hPad, gutter) =>
      Math.floor((totalWidth - hPad * 2 - gutter * (cols - 1)) / cols),
  }
}
