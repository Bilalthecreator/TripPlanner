import { cached, cacheKey } from '../cache.js'
import { geoapifyGet } from './client.js'
import {
  normalizeGeocodeDestination,
  normalizeSuggestion,
} from './normalize.js'

const GEOCODE_TTL = 30 * 60 * 1000

function resultsFromPayload(payload) {
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.features)) return payload.features
  return []
}

/**
 * Geoapify forward geocoding / search.
 * https://api.geoapify.com/v1/geocode/search
 * Does not request on empty query.
 */
export async function searchGeocode(
  text,
  { limit = 8, type, bias, filter, signal } = {},
) {
  const query = String(text || '').trim()
  if (!query) return []

  const biasLat = Number(bias?.latitude ?? bias?.lat)
  const biasLon = Number(bias?.longitude ?? bias?.lon)
  const hasBias = Number.isFinite(biasLat) && Number.isFinite(biasLon)
  const filterStr =
    filter ||
    (hasBias ? `circle:${biasLon},${biasLat},25000` : undefined)

  const key = cacheKey('geoapify:search', [
    query.toLowerCase(),
    limit,
    type || 'any',
    hasBias ? `${biasLat.toFixed(3)},${biasLon.toFixed(3)}` : 'nobias',
    filterStr || 'nofilter',
  ])
  return cached(key, GEOCODE_TTL, async () => {
    const params = {
      text: query,
      limit,
      format: 'json',
      lang: 'en',
    }
    // Optional type narrows results; omit for free-form worldwide destination search.
    if (type) params.type = type
    if (hasBias) params.bias = `proximity:${biasLon},${biasLat}`
    if (filterStr) params.filter = filterStr

    const payload = await geoapifyGet('/v1/geocode/search', params, { signal })
    return resultsFromPayload(payload).map((item) =>
      normalizeGeocodeDestination(item),
    )
  })
}

/**
 * Destination suggestions via geocode/search (not Nominatim, not autocomplete).
 */
export async function autocompleteDestinations(
  text,
  { limit = 6, signal } = {},
) {
  const query = String(text || '').trim()
  if (!query) return []

  const results = await searchGeocode(query, { limit, signal })
  return results.map((dest) =>
    normalizeSuggestion({
      properties: {
        city: dest.city || dest.name,
        name: dest.name,
        country: dest.country,
        country_code: dest.countryCode,
        state: dest.region,
        lat: dest.latitude,
        lon: dest.longitude,
        place_id: dest.placeId,
        formatted: dest.formattedAddress,
      },
    }),
  )
}

/**
 * Resolve a destination name (or "City, Country") to coordinates + normalized destination.
 */
export async function getDestinationCoordinates(
  destination,
  { signal } = {},
) {
  const query =
    typeof destination === 'string'
      ? destination
      : [destination?.name, destination?.country].filter(Boolean).join(', ')

  const trimmed = String(query || '').trim()
  if (!trimmed) return null

  if (
    destination &&
    typeof destination === 'object' &&
    Number.isFinite(destination.latitude) &&
    Number.isFinite(destination.longitude)
  ) {
    return {
      latitude: destination.latitude,
      longitude: destination.longitude,
      destination: normalizeGeocodeDestination({
        properties: {
          city: destination.city || destination.name,
          name: destination.name,
          country: destination.country,
          country_code: destination.countryCode,
          state: destination.region,
          lat: destination.latitude,
          lon: destination.longitude,
          place_id: destination.placeId,
          formatted: destination.formattedAddress || destination.description,
        },
      }),
    }
  }

  const key = cacheKey('geoapify:coords', [trimmed.toLowerCase()])
  return cached(key, GEOCODE_TTL, async () => {
    const results = await searchGeocode(trimmed, { limit: 1, signal })
    const first = results[0]
    if (!first || first.latitude == null || first.longitude == null) return null
    return {
      latitude: first.latitude,
      longitude: first.longitude,
      destination: first,
    }
  })
}

export const geocoding = {
  autocompleteDestinations,
  searchGeocode,
  getDestinationCoordinates,
}
