import { cached, cacheKey } from '../cache.js'
import { isAbortError } from '../http.js'
import { geoapifyGet } from './client.js'
import {
  ATTRACTION_CATEGORY_BUCKETS,
  DEFAULT_ATTRACTION_CATEGORIES,
  normalizePlaceAttraction,
} from './normalize.js'

const PLACES_TTL = 10 * 60 * 1000

const JUNK_CATEGORY_RE = /artwork|memorial|information|fountain|clock/
const VIEWPOINT_NAME_RE = /眺め|view of|view from|views of/i

function isJunkAttraction(place) {
  if (!place?.name || String(place.name).trim().length < 2) return true
  if (VIEWPOINT_NAME_RE.test(place.name)) return true
  const cats = place.categories || []
  return cats.some((c) => JUNK_CATEGORY_RE.test(String(c)))
}

function scoreAttraction(place) {
  const cats = place.categories || []
  const dist = Number.isFinite(place.distance) ? place.distance : 99999
  let score = 0
  if (cats.some((c) => String(c).includes('unesco'))) score += 120
  if (cats.some((c) => /place_of_worship|monastery|shrine|temple/.test(c))) {
    score += 40
  }
  if (cats.some((c) => /castle|fort/.test(c))) score += 35
  if (cats.some((c) => /museum|culture/.test(c))) score += 15
  if (cats.some((c) => /mountain|beach|protected_area|viewpoint/.test(c))) {
    score += 20
  }
  if (place.wikidata) score += 15
  // Prefer readable Latin / mixed names (often English intl label).
  if (/[A-Za-z]/.test(place.name)) score += 8
  score -= Math.min(dist, 30000) / 500
  return score
}

function rankAttractions(places, limit, { mode = 'landmark' } = {}) {
  const byId = new Map()
  for (const place of places) {
    // Landmark mode drops plaques/sculptures; nearby mode keeps category hits.
    if (mode === 'landmark' && isJunkAttraction(place)) continue
    if (!place?.name || String(place.name).trim().length < 2) continue
    if (!byId.has(place.id)) byId.set(place.id, place)
  }

  const ranked = [...byId.values()].sort((a, b) => {
    if (mode === 'nearby') {
      const da = Number.isFinite(a.distance) ? a.distance : 99999
      const db = Number.isFinite(b.distance) ? b.distance : 99999
      return da - db
    }
    return scoreAttraction(b) - scoreAttraction(a)
  })

  const seenNames = new Set()
  const out = []
  for (const place of ranked) {
    const key = String(place.name).trim().toLowerCase()
    if (seenNames.has(key)) continue
    seenNames.add(key)
    out.push(place)
    if (out.length >= limit) break
  }
  return out
}

async function fetchPlacesBucket(
  latitude,
  longitude,
  { categories, radius, limit, destinationId, signal },
) {
  const payload = await geoapifyGet(
    '/v2/places',
    {
      categories,
      filter: `circle:${longitude},${latitude},${radius}`,
      bias: `proximity:${longitude},${latitude}`,
      limit,
      lang: 'en',
    },
    { signal },
  )

  const features = Array.isArray(payload?.features) ? payload.features : []
  return features
    .map((feature) => normalizePlaceAttraction(feature, { destinationId }))
    .filter((item) => item.name)
}

/**
 * Nearby tourism / POI attractions via Geoapify Places API.
 * Uses parallel category buckets + ranking so landmark sites beat plaques.
 */
export async function getNearbyAttractions(
  latitude,
  longitude,
  {
    categories = DEFAULT_ATTRACTION_CATEGORIES,
    radius = 8000,
    limit = 12,
    destinationId = null,
    rankMode = 'landmark',
    signal,
  } = {},
) {
  const lat = Number(latitude)
  const lon = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []

  const useBuckets =
    !categories || categories === DEFAULT_ATTRACTION_CATEGORIES

  const key = cacheKey('geoapify:places', [
    'v3',
    lat.toFixed(3),
    lon.toFixed(3),
    useBuckets ? 'buckets' : categories,
    radius,
    limit,
    rankMode,
  ])

  return cached(key, PLACES_TTL, async () => {
    if (!useBuckets) {
      const places = await fetchPlacesBucket(lat, lon, {
        categories,
        radius,
        limit: Math.max(limit * 3, 24),
        destinationId,
        signal,
      })
      return rankAttractions(places, limit, { mode: rankMode })
    }

    const batches = await Promise.all(
      ATTRACTION_CATEGORY_BUCKETS.map(async (bucket) => {
        try {
          return await fetchPlacesBucket(lat, lon, {
            ...bucket,
            // Prefer the wider landmark radius; never shrink below the bucket default.
            radius: Math.max(bucket.radius, radius),
            destinationId,
            signal,
          })
        } catch (error) {
          if (isAbortError(error)) throw error
          return []
        }
      }),
    )

    return rankAttractions(batches.flat(), limit, { mode: rankMode })
  })
}

/**
 * Places near a hub — used to discover destinations for supported filter chips.
 */
export async function getPlacesNearHub(
  { latitude, longitude },
  { categories, radius = 250000, limit = 16, signal } = {},
) {
  const lat = Number(latitude)
  const lon = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []

  const key = cacheKey('geoapify:places-hub', [
    'v2',
    lat.toFixed(2),
    lon.toFixed(2),
    categories,
    radius,
    limit,
  ])

  return cached(key, PLACES_TTL, async () => {
    const places = await fetchPlacesBucket(lat, lon, {
      categories,
      radius,
      limit: Math.max(limit * 2, 20),
      signal,
    })
    return rankAttractions(places, limit)
  })
}

export const places = {
  getNearbyAttractions,
  getPlacesNearHub,
}
