import { useEffect, useState } from 'react'
import { ThemeContext } from './themeContext.js'
import { usePreferences } from './usePreferences.js'

/**
 * Compatibility provider: theme now lives in PreferencesProvider.
 * Keeps existing useTheme() consumers working.
 */
export function ThemeProvider({ children }) {
  const {
    theme,
    setTheme,
    toggleTheme,
    themePreference,
  } = usePreferences()

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, themePreference }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

/** Standalone theme bootstrap when PreferencesProvider is unavailable (tests). */
export function LegacyThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme: () =>
          setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
