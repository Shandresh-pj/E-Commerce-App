import { Dimensions, PixelRatio, Platform } from 'react-native'

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

export const LIQUID_GLASS_THEME = {
  colors: {
    // Original vibrant background colors
    background: '#F4F5F0',
    backgroundGradient: ['#F4F5F0', '#FFFCE8', '#E9EDEE'],
    
    // Header Colors
    headerYellow: ['#FFE500', '#FFDD00'],
    
    // Liquid Glass Overlay Tints
    glassWhite: 'rgba(255, 255, 255, 0.88)',
    glassWhiteSoft: 'rgba(255, 255, 255, 0.65)',
    glassBorder: 'rgba(255, 255, 255, 0.9)',
    cardBorder: '#ECECEA',
    
    // Primary Accents
    primary: '#0C831F', // Fresh green accent
    primaryBlue: '#1D63FF',
    accent: '#FF4757',
    textDark: '#141414',
    textMuted: '#757575',
    
    // Category Pill Colors (Restored Original Palette with Glass Polish)
    categoryColors: [
      { bg: '#E4F6E6', border: '#C2EBC7' },
      { bg: '#FFF4D6', border: '#FCE4A6' },
      { bg: '#FFE9E0', border: '#FCD2C4' },
      { bg: '#E0F0FF', border: '#BCDDFC' },
      { bg: '#FFF0D6', border: '#FCE0B3' },
      { bg: '#EBE4FF', border: '#D4C7FC' },
    ],

    // Product Card Background Tints
    productBgColors: [
      '#FFE0E0', '#FFF4D6', '#E0F0FF', '#E4F6E6',
      '#EBE4FF', '#FFE9E0', '#E0FFE8', '#F4E8FF',
    ],
  },
  
  shadows: {
    glassSoft: {
      shadowColor: '#1F1C14',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 4,
    },
    glassCard: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 18,
      elevation: 5,
    },
  },
  
  borderRadius: {
    sm: 10,
    md: 16,
    lg: 20,
    xl: 26,
    full: 9999,
  },
}
