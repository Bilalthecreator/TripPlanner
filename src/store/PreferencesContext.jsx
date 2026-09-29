import { useCallback, useEffect, useMemo, useState } from 'react'
import { PreferencesContext } from './preferencesContext.js'
import {
  DEFAULT_PREFERENCES,
  resolveTheme,
} from '../data/preferences.js'
import {
  estimateLocalStorageBytes,
  loadPreferences,
  savePreferences,
} from '../utils/preferencesStorage.js'

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      return loadPreferences()
    } catch {
      return savePreferences(DEFAULT_PREFERENCES)
    }
  })
  const [savedAt, setSavedAt] = useState(() => Date.now())
  const [storageBytes, setStorageBytes] = useState(() => {
    try {
      return estimateLocalStorageBytes()
    } catch {
      return 0
    }
  })

  const resolvedTheme = useMemo(
    () => resolveTheme(preferences.theme),
    [preferences.theme],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.dataset.highContrast = preferences.highContrast
      ? 'true'
      : 'false'
  }, [resolvedTheme, preferences.highContrast])

  useEffect(() => {
    if (preferences.theme !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      document.documentElement.classList.toggle('dark', mq.matches)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preferences.theme])

  const commit = useCallback((updater) => {
    setPreferences((current) => {
      try {
        const next =
          typeof updater === 'function'
            ? updater(current)
            : { ...current, ...updater }
        const saved = savePreferences(next)
        setSavedAt(Date.now())
        setStorageBytes(estimateLocalStorageBytes())
        return saved
      } catch {
        return current
      }
    })
  }, [])

  const setPreference = useCallback(
    (key, value) => {
      commit((current) => ({ ...current, [key]: value }))
    },
    [commit],
  )

  const setAutomation = useCallback(
    (key, value) => {
      commit((current) => ({
        ...current,
        automation: { ...current.automation, [key]: value },
      }))
    },
    [commit],
  )

  const toggleTravelPreference = useCallback(
    (id) => {
      commit((current) => {
        const exists = current.travelPreferences.includes(id)
        return {
          ...current,
          travelPreferences: exists
            ? current.travelPreferences.filter((item) => item !== id)
            : [...current.travelPreferences, id],
        }
      })
    },
    [commit],
  )

  const resetDefaults = useCallback(() => {
    try {
      const saved = savePreferences(DEFAULT_PREFERENCES)
      setPreferences(saved)
      setSavedAt(Date.now())
      setStorageBytes(estimateLocalStorageBytes())
    } catch {
      setPreferences(DEFAULT_PREFERENCES)
    }
  }, [])

  const replaceAll = useCallback((next) => {
    try {
      const saved = savePreferences(next)
      setPreferences(saved)
      setSavedAt(Date.now())
      setStorageBytes(estimateLocalStorageBytes())
    } catch {
      setPreferences(savePreferences(DEFAULT_PREFERENCES))
    }
  }, [])

  // Theme compatibility API used by AppShell / useTheme
  const setTheme = useCallback(
    (themeOrUpdater) => {
      commit((current) => {
        const nextTheme =
          typeof themeOrUpdater === 'function'
            ? themeOrUpdater(resolveTheme(current.theme))
            : themeOrUpdater
        return { ...current, theme: nextTheme }
      })
    },
    [commit],
  )

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [setTheme])

  const value = useMemo(
    () => ({
      preferences,
      resolvedTheme,
      theme: resolvedTheme,
      themePreference: preferences.theme,
      savedAt,
      storageBytes,
      setPreference,
      setAutomation,
      toggleTravelPreference,
      resetDefaults,
      replaceAll,
      setTheme,
      toggleTheme,
      currency: preferences.currency,
      temperatureUnit: preferences.temperatureUnit,
      defaultTravelers: preferences.defaultTravelers,
      travelPreferences: preferences.travelPreferences,
    }),
    [
      preferences,
      resolvedTheme,
      savedAt,
      storageBytes,
      setPreference,
      setAutomation,
      toggleTravelPreference,
      resetDefaults,
      replaceAll,
      setTheme,
      toggleTheme,
    ],
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}
