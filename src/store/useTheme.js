import { usePreferences } from './usePreferences.js'

/** Theme API backed by shared preferences (single source of truth). */
export function useTheme() {
  const {
    theme,
    setTheme,
    toggleTheme,
    themePreference,
  } = usePreferences()

  return { theme, setTheme, toggleTheme, themePreference }
}
