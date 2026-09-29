import {
  DISCOVERY_TIPS,
  FILTERS,
  SPOTLIGHT,
} from '../data/destinations.js'
import { cacheGet, cacheKey, cacheSet } from './cache.js'
import { isAbortError } from './http.js'
import {
  autocompleteDestinations,
  FILTER_DESTINATION_QUERIES,
  FILTER_HUBS,
  FILTER_PLACE_CATEGORIES,
  getDestinationCoordinates,
  getNearbyAttractions,
  getPlacesNearHub,
  normalizeGeocodeDestination,
  searchGeocode,
  TRENDING_SEED_QUERIES,
} from './geoapify/index.js'
import { getDestinationImage } from './images/index.js'
import {
  getRegisteredDestination,
  registerDestination,
  registerDestinations,
} from './destinationRegistry.js'
import { getCurrentWeather } from './weather/index.js'

const ENRICH_TTL = 45 * 60 * 1000

function throwIfAborted(signal) {
  if (signal?.aborted) {
    const error = new Error('Request aborted')
    error.name = 'AbortError'
    throw error
  }
}

async function attachImage(destination, { signal } = {}) {
  if (destination?.image) return destination
  const query = [destination.name, destination.country].filter(Boolean).join(' ')
  const key = cacheKey('discover:image', [destination.id || query])

  let image = cacheGet(key)
  if (image === undefined) {
    throwIfAborted(signal)
    image = await getDestinationImage(query || destination.name, { signal })
    // Only cache completed (non-aborted) lookups, including null misses.
    throwIfAborted(signal)
    cacheSet(key, image, ENRICH_TTL)
  }

  if (!image?.url) return destination

  return registerDestination({
    ...destination,
    image: image.url,
    imageAttribution: image.attribution,
  })
}

async function enrichDestinations(destinations, { signal } = {}) {
  const enriched = await Promise.all(
    destinations.map(async (destination) => {
      try {
        return await attachImage(destination, { signal })
      } catch (error) {
        if (isAbortError(error)) throw error
        return destination
      }
    }),
  )
  return registerDestinations(enriched)
}

async function resolveTrendingSeeds({ signal } = {}) {
  const key = cacheKey('discover:trending-seeds', ['v1'])
  const existing = cacheGet(key)
  if (existing !== undefined) {
    throwIfAborted(signal)
    return existing
  }

  const settled = await Promise.all(
    TRENDING_SEED_QUERIES.map(async (query) => {
      throwIfAborted(signal)
      try {
        const resolved = await getDestinationCoordinates(query, { signal })
        if (!resolved?.destination) return null
        return registerDestination({
          ...resolved.destination,
          trending: true,
        })
      } catch (error) {
        if (isAbortError(error)) throw error
        return null
      }
    }),
  )

  throwIfAborted(signal)
  const results = settled.filter(Boolean)
  return cacheSet(key, results, ENRICH_TTL)
}

async function resolveDestinationQueries(queries, { filterId, signal } = {}) {
  const settled = await Promise.all(
    queries.map(async (query) => {
      throwIfAborted(signal)
      try {
        const resolved = await getDestinationCoordinates(query, { signal })
        if (!resolved?.destination) return null
        return registerDestination({
          ...resolved.destination,
          filters: filterId ? [filterId] : [],
          tags: [
            ...(resolved.destination.tags || []),
            filterId ? filterLabel(filterId) : null,
          ].filter(Boolean),
          trending: true,
        })
      } catch (error) {
        if (isAbortError(error)) throw error
        return null
      }
    }),
  )
  return settled.filter(Boolean)
}

function filterLabel(filterId) {
  const hit = FILTERS.find((f) => f.id === filterId)
  return hit?.label || filterId
}

/**
 * Discover destinations for a filter chip.
 * 1) Resolve curated destination queries (reliable city cards).
 * 2) Optionally merge Places-hub discoveries for beach/mountain/culture/foodie.
 */
async function discoverDestinationsForFilter(filterId, { signal } = {}) {
  if (!filterId || filterId === 'all') return null

  const key = cacheKey('discover:filter-dest', ['v3', filterId])
  const existing = cacheGet(key)
  if (existing !== undefined) {
    throwIfAborted(signal)
    return existing
  }

  const queries = FILTER_DESTINATION_QUERIES[filterId]
  let results = []

  if (queries?.length) {
    results = await resolveDestinationQueries(queries, { filterId, signal })
  }

  const categories = FILTER_PLACE_CATEGORIES[filterId]
  if (categories && results.length < 8) {
    const batches = await Promise.all(
      FILTER_HUBS.map(async (hub) => {
        throwIfAborted(signal)
        try {
          return await getPlacesNearHub(
            { latitude: hub.lat, longitude: hub.lon },
            { categories, limit: 12, radius: 350000, signal },
          )
        } catch (error) {
          if (isAbortError(error)) throw error
          return []
        }
      }),
    )

    throwIfAborted(signal)

    const byId = new Map(results.map((d) => [d.id, d]))
    for (const places of batches) {
      for (const place of places) {
        if (!place.latitude || !place.longitude) continue
        const city = place.location?.split(',')[0]?.trim()
        if (!city) continue
        const country = place.location?.split(',')[1]?.trim() || ''
        const dest = normalizeGeocodeDestination({
          properties: {
            city,
            name: city,
            country,
            lat: place.latitude,
            lon: place.longitude,
            formatted: place.address || place.location,
            result_type: 'city',
          },
        })
        if (byId.has(dest.id)) continue
        byId.set(
          dest.id,
          registerDestination({
            ...dest,
            tags: [place.category || filterLabel(filterId)].filter(Boolean),
            filters: [filterId],
            trending: true,
          }),
        )
        if (byId.size >= 10) break
      }
      if (byId.size >= 10) break
    }
    results = [...byId.values()]
  }

  return cacheSet(key, results.slice(0, 8), ENRICH_TTL)
}

async function loadTrendingDestinations(filter, { signal } = {}) {
  if (filter && filter !== 'all') {
    const filtered = await discoverDestinationsForFilter(filter, { signal })
    if (filtered?.length) return enrichDestinations(filtered, { signal })
  }

  const seeds = await resolveTrendingSeeds({ signal })
  return enrichDestinations(seeds, { signal })
}

async function enrichAttractionImages(attractions, { signal } = {}) {
  return Promise.all(
    attractions.map(async (attraction) => {
      try {
        const image = await getDestinationImage(
          `${attraction.name} ${attraction.location || ''}`.trim(),
          { signal },
        )
        if (!image?.url) return attraction
        return {
          ...attraction,
          image: image.url,
          imageAttribution: image.attribution,
        }
      } catch (error) {
        if (isAbortError(error)) throw error
        return attraction
      }
    }),
  )
}

/**
 * Discover page service — real Geoapify / Open-Meteo / Wikimedia backends.
 * Public methods keep the previous Promise + AbortSignal contract.
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
    { signal } = {},
  ) {
    const q = String(query || '').trim()

    let results
    if (!q || trendingOnly) {
      results = await loadTrendingDestinations(filter, { signal })
    } else {
      results = await searchGeocode(q, {
        limit: 8,
        signal,
      })

      // Text search is primary; Places-backed filters only when the API supports them.
      if (filter && filter !== 'all' && FILTER_PLACE_CATEGORIES[filter]) {
        const categories = FILTER_PLACE_CATEGORIES[filter]
        const withCategory = await Promise.all(
          results.map(async (destination) => {
            if (destination.latitude == null || destination.longitude == null) {
              return destination
            }
            try {
              const nearby = await getNearbyAttractions(
                destination.latitude,
                destination.longitude,
                {
                  categories,
                  radius: 25000,
                  limit: 1,
                  destinationId: destination.id,
                  signal,
                },
              )
              return nearby.length
                ? { ...destination, filters: [filter] }
                : null
            } catch (error) {
              if (isAbortError(error)) throw error
              return destination
            }
          }),
        )
        results = withCategory.filter(Boolean)
      }

      results = await enrichDestinations(results, { signal })
    }

    registerDestinations(results)

    return {
      query: q,
      filter,
      results,
      total: results.length,
    }
  },

  async getSuggestions(query = '', { signal } = {}) {
    const q = String(query || '').trim()
    if (!q) return []
    const suggestions = await autocompleteDestinations(q, {
      limit: 6,
      signal,
    })
    suggestions.forEach((item) => {
      if (item.latitude != null && item.longitude != null) {
        registerDestination({
          id: item.id,
          name: item.name,
          country: item.country,
          region: item.region,
          latitude: item.latitude,
          longitude: item.longitude,
        })
      }
    })
    return suggestions
  },

  async getTrendingDestinations({ filter = 'all' } = {}, { signal } = {}) {
    return this.searchDestinations(
      { query: '', filter, trendingOnly: true },
      { signal },
    )
  },

  async getWeather(destinationId, { signal } = {}) {
    let destination = getRegisteredDestination(destinationId)

    if (!destination || destination.latitude == null) {
      const lookup =
        destination?.name ||
        String(destinationId || '')
          .replace(/-/g, ' ')
          .trim()
      const resolved = await getDestinationCoordinates(lookup, { signal })
      if (resolved?.destination) {
        destination = registerDestination({
          ...resolved.destination,
          id: destinationId || resolved.destination.id,
        })
      }
    }

    if (!destination?.latitude || !destination?.longitude) {
      throw new Error('Weather unavailable for this destination.')
    }

    return getCurrentWeather(destination.latitude, destination.longitude, {
      signal,
      city: [destination.name, destination.country].filter(Boolean).join(', '),
      region: destination.region || destination.country || '',
    })
  },

  async getAttractions(
    { filter = 'all', latitude, longitude, destinationId } = {},
    { signal } = {},
  ) {
    let lat = latitude
    let lon = longitude
    let destId = destinationId

    if (lat == null || lon == null) {
      const registered = destId ? getRegisteredDestination(destId) : null
      if (registered?.latitude != null) {
        lat = registered.latitude
        lon = registered.longitude
        destId = registered.id
      } else {
        const seeds = await resolveTrendingSeeds({ signal })
        const seed = seeds[0]
        if (seed) {
          lat = seed.latitude
          lon = seed.longitude
          destId = seed.id
        }
      }
    }

    if (lat == null || lon == null) return []

    const categories =
      (filter && FILTER_PLACE_CATEGORIES[filter]) || undefined

    const attractions = await getNearbyAttractions(lat, lon, {
      ...(categories ? { categories } : {}),
      radius: 25000,
      limit: 8,
      destinationId: destId,
      signal,
    })

    return enrichAttractionImages(attractions, { signal })
  },

  searchDestinationsQuery: (query, options) =>
    discoverService.searchDestinations({ query }, options),
  getDestinationCoordinates,
  getNearbyAttractions,
  getCurrentWeather,
  getDestinationImage,
}
