/**
 * Theme Context for dark / light mode management.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useColorScheme, Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getThemeColors, AppColors } from '../../constants/theme'
import { LIGHT_THEME_COLORS, DARK_THEME_COLORS, ThemeColors } from '../../design-system/tokens/colors'

type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeContextType {
  isDark: boolean
  colors: AppColors
  tokens: ThemeColors
  themeMode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const STORAGE_KEY = '@app_theme_mode'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system')

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark')

  const colors = getThemeColors(isDark)
  const tokens = isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeModeState(stored as ThemeMode)
      }
    })
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
    AsyncStorage.setItem(STORAGE_KEY, mode)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  return (
    <ThemeContext.Provider value={{ isDark, colors, tokens, themeMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    const systemScheme = Appearance.getColorScheme()
    const isDark = systemScheme === 'dark'
    return {
      isDark,
      colors: getThemeColors(isDark),
      tokens: isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS,
      themeMode: 'system',
      toggleTheme: () => {},
      setTheme: () => {},
    }
  }
  return ctx
}

