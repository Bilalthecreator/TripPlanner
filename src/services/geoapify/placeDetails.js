import { cached, cacheKey } from '../cache.js'
import { geoapifyGet } from './client.js'

const DETAILS_TTL = 30 * 60 * 1000

/**
 * Geoapify Place Details API.
 * https://api.geoapify.com/v2/place-details
 */
export async function getPlaceDetails(
  { placeId, latitude, longitude, features = 'details' } = {},
  { signal } = {},
) {
  const params = { features, lang: 'en' }
  if (placeId) {
    params.id = placeId
  } else if (
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude))
  ) {
    params.lat = Number(latitude)
    params.lon = Number(longitude)
  } else {
    return null
  }

  const key = cacheKey('geoapify:place-details', [
    params.id || `${params.lat},${params.lon}`,
    features,
  ])

  return cached(key, DETAILS_TTL, async () => {
    const payload = await geoapifyGet('/v2/place-details', params, { signal })
    const featuresList = Array.isArray(payload?.features) ? payload.features : []
    const details =
      featuresList.find((f) => f?.properties?.feature_type === 'details') ||
      featuresList[0] ||
      null
    if (!details) return null

    const props = details.properties || {}
    const coords = details.geometry?.coordinates
    const lon = props.lon ?? props.lng ?? coords?.[0]
    const lat = props.lat ?? coords?.[1]

    return {
      placeId: props.place_id || placeId || null,
      name: props.name || props.address_line1 || null,
      address: props.formatted || props.address_line2 || null,
      categories: Array.isArray(props.categories) ? props.categories : [],
      website: props.website || props.contact?.website || null,
      phone: props.contact?.phone || props.phone || null,
      openingHours: props.opening_hours || null,
      latitude: Number.isFinite(Number(lat)) ? Number(lat) : null,
      longitude: Number.isFinite(Number(lon)) ? Number(lon) : null,
      raw: props,
    }
  })
}

export const placeDetails = { getPlaceDetails }
