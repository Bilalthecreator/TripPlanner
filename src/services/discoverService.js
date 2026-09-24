import { ATTRACTIONS } from '../data/attractions.js'
import {
  DESTINATIONS,
  DISCOVERY_TIPS,
  FILTERS,
  SPOTLIGHT,
} from '../data/destinations.js'
import { WEATHER_BY_DESTINATION } from '../data/weather.js'
import { delay, maybeFail } from './http.js'
import { MOCK_DELAY_MS } from './mockConfig.js'

function matchesQuery(destination, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [destination.name, destination.country, destination.region]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

function matchesFilter(destination, filterId) {
  if (!filterId || filterId === 'all') return true
  return destination.filters.includes(filterId)
}

/**
 * API-shaped mock discover service.
 * All methods return Promises and honor AbortSignal when provided.
 */
export const discoverService = {
  getFilters() {
    return FILTERS
  },

  getSpotlight() {
    return SPOTLIGHT
  },

  getTips() {
    return DISCOVERY_TIPS
  },

  async searchDestinations(
    { query = '', filter = 'all', trendingOnly = false } = {},
    { signal, delayMs = MOCK_DELAY_MS } = {},
  ) {
    await delay(delayMs, signal)
    maybeFail()

    let results = DESTINATIONS.filter(
      (d) => matchesQuery(d, query) && matchesFilter(d, filter),
    )

    if (trendingOnly && !query.trim()) {
      results = results.filter((d) => d.trending)
    }

    return {
      query,
      filter,
      results,
      total: results.length,
    }
  },

  async getSuggestions(query = '', { signal, delayMs = 220 } = {}) {
    await delay(delayMs, signal)

    const q = query.trim().toLowerCase()
    if (!q) return []

    return DESTINATIONS.filter((d) => matchesQuery(d, q))
      .slice(0, 6)
      .map((d) => ({
        id: d.id,
        name: d.name,
        country: d.country,
        region: d.region,
      }))
  },

  async getTrendingDestinations(
    { filter = 'all' } = {},
    { signal, delayMs = MOCK_DELAY_MS } = {},
  ) {
    return this.searchDestinations(
      { query: '', filter, trendingOnly: true },
      { signal, delayMs },
    )
  },

  async getWeather(
    destinationId = 'kyoto',
    { signal, delayMs = MOCK_DELAY_MS, empty = false } = {},
  ) {
    await delay(delayMs, signal)
    maybeFail()

    if (empty) return null

    return (
      WEATHER_BY_DESTINATION[destinationId] ?? WEATHER_BY_DESTINATION.default
    )
  },

  async getAttractions(
    { filter = 'all' } = {},
    { signal, delayMs = MOCK_DELAY_MS } = {},
  ) {
    await delay(delayMs, signal)
    maybeFail()

    if (filter === 'all') return ATTRACTIONS

    const allowedIds = new Set(
      DESTINATIONS.filter((d) => matchesFilter(d, filter)).map((d) => d.id),
    )

    return ATTRACTIONS.filter((a) => allowedIds.has(a.destinationId))
  },
}
