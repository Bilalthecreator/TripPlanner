import {
  DEFAULT_PREFERENCES,
  LEGACY_THEME_KEY,
  PREFERENCES_STORAGE_KEY,
} from '../data/preferences.js'

function isObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

export function normalizePreferences(raw) {
  const base = { ...DEFAULT_PREFERENCES, ...(isObject(raw) ? raw : {}) }

  const currency = String(base.currency || 'USD').toUpperCase()
  const temperatureUnit = base.temperatureUnit === 'F' ? 'F' : 'C'
  const distanceUnit = base.distanceUnit === 'mi' ? 'mi' : 'km'
  const weekStartsOn = base.weekStartsOn === 'sunday' ? 'sunday' : 'monday'
  const theme =
    base.theme === 'dark' || base.theme === 'system' || base.theme === 'light'
      ? base.theme
      : 'light'

  let defaultTravelers = Number(base.defaultTravelers)
  if (!Number.isFinite(defaultTravelers) || defaultTravelers < 1) {
    defaultTravelers = 1
  }
  if (defaultTravelers > 30) defaultTravelers = 30
  defaultTravelers = Math.round(defaultTravelers)

  const pacing = ['relaxed', 'balanced', 'fast'].includes(base.pacing)
    ? base.pacing
    : 'balanced'
  const budgetTier = ['backpacker', 'mid', 'luxury'].includes(base.budgetTier)
    ? base.budgetTier
    : 'mid'

  const travelPreferences = Array.isArray(base.travelPreferences)
    ? base.travelPreferences.filter((id) => typeof id === 'string')
    : [...DEFAULT_PREFERENCES.travelPreferences]

  const automationSrc = isObject(base.automation) ? base.automation : {}
  const automation = {
    walkingLegs: Boolean(
      automationSrc.walkingLegs ?? DEFAULT_PREFERENCES.automation.walkingLegs,
    ),
    currencyConvert: Boolean(
      automationSrc.currencyConvert ??
        DEFAULT_PREFERENCES.automation.currencyConvert,
    ),
    weatherAlerts: Boolean(
      automationSrc.weatherAlerts ??
        DEFAULT_PREFERENCES.automation.weatherAlerts,
    ),
    offlineCache: Boolean(
      automationSrc.offlineCache ?? DEFAULT_PREFERENCES.automation.offlineCache,
    ),
  }

  return {
    currency,
    temperatureUnit,
    distanceUnit,
    weekStartsOn,
    theme,
    highContrast: Boolean(base.highContrast),
    compactTimeline: Boolean(base.compactTimeline),
    defaultTravelers,
    pacing,
    budgetTier,
    travelPreferences,
    automation,
  }
}

export function loadPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (raw) {
      return normalizePreferences(JSON.parse(raw))
    }
  } catch {
    /* fall through to defaults / legacy */
  }

  // Migrate legacy theme key once when preferences bag is missing.
  try {
    const legacy = localStorage.getItem(LEGACY_THEME_KEY)
    if (legacy === 'dark' || legacy === 'light') {
      return normalizePreferences({ theme: legacy })
    }
  } catch {
    /* ignore */
  }

  return normalizePreferences(DEFAULT_PREFERENCES)
}

export function savePreferences(prefs) {
  const normalized = normalizePreferences(prefs)
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(normalized))
    // Keep legacy theme key in sync for older readers.
    if (normalized.theme === 'light' || normalized.theme === 'dark') {
      localStorage.setItem(LEGACY_THEME_KEY, normalized.theme)
    }
  } catch {
    /* ignore quota / private mode */
  }
  return normalized
}

export function estimateLocalStorageBytes() {
  try {
    let total = 0
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (!key) continue
      const value = localStorage.getItem(key) || ''
      total += key.length + value.length
    }
    // UTF-16 ≈ 2 bytes per char
    return total * 2
  } catch {
    return 0
  }
}
