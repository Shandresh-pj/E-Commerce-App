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

type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeContextType {
  isDark: boolean
  colors: AppColors
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

  // Determine if dark mode is active
  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark')

  const colors = getThemeColors(isDark)

  // Load saved theme preference
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
    <ThemeContext.Provider value={{ isDark, colors, themeMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access current theme colors and settings.
 */
export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    // Fallback theme context
    const systemScheme = Appearance.getColorScheme()
    const isDark = systemScheme === 'dark'
    return {
      isDark,
      colors: getThemeColors(isDark),
      themeMode: 'system',
      toggleTheme: () => {},
      setTheme: () => {},
    }
  }
  return ctx
}
