import {
  CURRENCIES,
  DEFAULT_PREFERENCES,
  LEGACY_THEME_KEY,
  PREFERENCES_STORAGE_KEY,
  TRAVEL_AFFINITIES,
} from '../data/preferences.js'

const CURRENCY_IDS = new Set(CURRENCIES.map((c) => c.id))
const TRAVEL_IDS = new Set(TRAVEL_AFFINITIES.map((a) => a.id))

function isObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function stableStringify(prefs) {
  return JSON.stringify(prefs)
}

/**
 * Coerce any raw preferences blob into a safe, complete preferences object.
 * Never throws.
 */
export function normalizePreferences(raw) {
  const base = {
    ...DEFAULT_PREFERENCES,
    ...(isObject(raw) ? raw : {}),
  }

  const currencyRaw = String(base.currency || DEFAULT_PREFERENCES.currency)
    .trim()
    .toUpperCase()
  const currency = CURRENCY_IDS.has(currencyRaw)
    ? currencyRaw
    : DEFAULT_PREFERENCES.currency

  const temperatureUnit = base.temperatureUnit === 'F' ? 'F' : 'C'
  const distanceUnit = base.distanceUnit === 'mi' ? 'mi' : 'km'
  const weekStartsOn = base.weekStartsOn === 'sunday' ? 'sunday' : 'monday'
  const theme =
    base.theme === 'dark' || base.theme === 'system' || base.theme === 'light'
      ? base.theme
      : DEFAULT_PREFERENCES.theme

  let defaultTravelers = Number(base.defaultTravelers)
  if (!Number.isFinite(defaultTravelers) || defaultTravelers < 1) {
    defaultTravelers = DEFAULT_PREFERENCES.defaultTravelers
  }
  if (defaultTravelers > 30) defaultTravelers = 30
  defaultTravelers = Math.round(defaultTravelers)

  const pacing = ['relaxed', 'balanced', 'fast'].includes(base.pacing)
    ? base.pacing
    : DEFAULT_PREFERENCES.pacing
  const budgetTier = ['backpacker', 'mid', 'luxury'].includes(base.budgetTier)
    ? base.budgetTier
    : DEFAULT_PREFERENCES.budgetTier

  let travelPreferences
  if (Array.isArray(base.travelPreferences)) {
    travelPreferences = [
      ...new Set(
        base.travelPreferences.filter(
          (id) => typeof id === 'string' && TRAVEL_IDS.has(id),
        ),
      ),
    ]
  } else {
    travelPreferences = [...DEFAULT_PREFERENCES.travelPreferences]
  }

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

function readLegacyThemePreference() {
  try {
    const legacy = localStorage.getItem(LEGACY_THEME_KEY)
    if (legacy === 'dark' || legacy === 'light') {
      return normalizePreferences({ theme: legacy })
    }
  } catch {
    /* ignore */
  }
  return null
}

function persistIfChanged(normalized) {
  try {
    const next = stableStringify(normalized)
    const current = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (current === next) return normalized

    localStorage.setItem(PREFERENCES_STORAGE_KEY, next)
    if (normalized.theme === 'light' || normalized.theme === 'dark') {
      localStorage.setItem(LEGACY_THEME_KEY, normalized.theme)
    }
  } catch {
    /* ignore quota / private mode */
  }
  return normalized
}

/**
 * Load preferences from localStorage.
 * Malformed / invalid data → safe defaults, then persist the corrected state.
 */
export function loadPreferences() {
  let parsed = null
  let corrupt = false

  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (raw != null && raw !== '') {
      const value = JSON.parse(raw)
      if (isObject(value)) {
        parsed = value
      } else {
        corrupt = true
      }
    }
  } catch {
    corrupt = true
  }

  let normalized
  if (parsed) {
    normalized = normalizePreferences(parsed)
  } else {
    const legacy = readLegacyThemePreference()
    normalized = legacy || normalizePreferences(DEFAULT_PREFERENCES)
  }

  // Always self-heal: rewrite storage when corrupt or when normalization changed fields.
  if (corrupt || parsed == null) {
    return persistIfChanged(normalized)
  }

  try {
    const next = stableStringify(normalized)
    const current = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (current !== next) return persistIfChanged(normalized)
  } catch {
    return persistIfChanged(normalized)
  }

  return normalized
}

export function savePreferences(prefs) {
  const normalized = normalizePreferences(prefs)
  return persistIfChanged(normalized)
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
