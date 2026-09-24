/** Defaults and option catalogs for Settings / Preferences. */

export const PREFERENCES_STORAGE_KEY = 'roamwise.preferences'
export const LEGACY_THEME_KEY = 'roamwise.theme'

export const CURRENCIES = [
  { id: 'USD', symbol: '$', label: 'USD' },
  { id: 'EUR', symbol: '€', label: 'EUR' },
  { id: 'JPY', symbol: '¥', label: 'JPY' },
  { id: 'GBP', symbol: '£', label: 'GBP' },
  { id: 'BRL', symbol: 'R$', label: 'BRL' },
]

export const TEMPERATURE_UNITS = [
  { id: 'C', label: 'Celsius (°C)' },
  { id: 'F', label: 'Fahrenheit (°F)' },
]

export const DISTANCE_UNITS = [
  { id: 'km', label: 'Kilometers (km)' },
  { id: 'mi', label: 'Miles (mi)' },
]

export const WEEK_STARTS = [
  { id: 'monday', label: 'Monday' },
  { id: 'sunday', label: 'Sunday' },
]

export const THEME_MODES = [
  {
    id: 'light',
    label: 'Light Crisp',
    description: 'Bright surfaces with coral accents.',
  },
  {
    id: 'dark',
    label: 'Midnight Slate',
    description: 'Deep charcoal workspace for low-light planning.',
  },
  {
    id: 'system',
    label: 'System Auto',
    description: 'Follow your device appearance setting.',
  },
]

export const TRAVELER_PRESETS = [
  { id: 'solo', label: 'Solo (1)', value: 1 },
  { id: 'couple', label: 'Couple (2)', value: 2 },
  { id: 'family', label: 'Family (4)', value: 4 },
  { id: 'group', label: 'Group (6+)', value: 6 },
]

export const PACING_OPTIONS = [
  {
    id: 'relaxed',
    label: 'Relaxed',
    description: '2–3 high-priority stops with generous buffer time.',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: '4–5 activities per day with room to wander.',
    recommended: true,
  },
  {
    id: 'fast',
    label: 'Fast-Paced',
    description: '6+ marked waypoints for maximal coverage.',
  },
]

export const BUDGET_TIERS = [
  {
    id: 'backpacker',
    label: '$ Backpacker',
    description: 'Hostels, street food, and transit-first days.',
  },
  {
    id: 'mid',
    label: '$$ Mid-Range Comfort',
    description: 'Boutique stays and local bistros.',
  },
  {
    id: 'luxury',
    label: '$$$ Luxury Escapes',
    description: '5-star hotels and curated experiences.',
  },
]

export const TRAVEL_AFFINITIES = [
  { id: 'local-food', label: 'Local Food & Night Markets' },
  { id: 'hiking', label: 'Hiking & Scenic Trails' },
  { id: 'museums', label: 'Museums & Galleries' },
  { id: 'art', label: 'Art & Architecture' },
  { id: 'transit', label: 'Public Transit Priority' },
  { id: 'resorts', label: 'Resorts & Spas' },
  { id: 'coffee', label: 'Specialty Coffee & Bakeries' },
  { id: 'nightlife', label: 'Listening Bars & Speakeasies' },
]

export const SETTINGS_NAV = [
  { id: 'regional', label: 'Regional & Units' },
  { id: 'display', label: 'Display & Theme' },
  { id: 'planning', label: 'Trip Planning Defaults' },
  { id: 'automation', label: 'Automation & Sync' },
  { id: 'privacy', label: 'Data & Privacy' },
]

export const DEFAULT_PREFERENCES = {
  currency: 'USD',
  temperatureUnit: 'C',
  distanceUnit: 'km',
  weekStartsOn: 'monday',
  theme: 'light',
  highContrast: false,
  compactTimeline: true,
  defaultTravelers: 2,
  pacing: 'balanced',
  budgetTier: 'mid',
  travelPreferences: ['local-food', 'hiking', 'art', 'transit'],
  automation: {
    walkingLegs: true,
    currencyConvert: true,
    weatherAlerts: true,
    offlineCache: true,
  },
}

export function resolveTheme(themePreference) {
  if (themePreference === 'dark' || themePreference === 'light') {
    return themePreference
  }
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function formatTemperature(celsius, unit = 'C') {
  const c = Number(celsius)
  if (!Number.isFinite(c)) return '—'
  if (unit === 'F') return `${Math.round((c * 9) / 5 + 32)}°F`
  return `${Math.round(c)}°C`
}

export function currencyLabel(currencyId) {
  const match = CURRENCIES.find((c) => c.id === currencyId)
  if (!match) return currencyId || 'USD'
  return `${match.label} ${match.symbol}`
}
