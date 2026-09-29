import { getPlaceDetails } from './geoapify/placeDetails.js'
import { getDestinationImage } from './images/index.js'
import { isAbortError } from './http.js'
import {
  needsPlaceDetails,
  needsPlaceImage,
  normalizeSavedPlace,
} from '../utils/savedPlaces.js'

/** Session-level: avoid re-hitting APIs for the same place after failure. */
const attemptedDetails = new Set()
const attemptedImages = new Set()

function imageSearchQuery(place) {
  return [place?.name, place?.destination, place?.address]
    .filter(Boolean)
    .join(' ')
    .trim()
}

/**
 * Optionally fill missing address/coords/name via Geoapify Place Details.
 * Never removes or invents a saved place — returns a patch or null.
 */
export async function enrichFromPlaceDetails(place, { signal } = {}) {
  const base = normalizeSavedPlace(place)
  if (!base || !needsPlaceDetails(base)) return null
  if (attemptedDetails.has(base.id)) return null

  attemptedDetails.add(base.id)

  try {
    const details = await getPlaceDetails(
      {
        placeId: base.providerId || undefined,
        latitude: base.latitude,
        longitude: base.longitude,
      },
      { signal },
    )
    if (!details) return null

    const patch = {}
    if (!base.providerId && details.placeId) patch.providerId = details.placeId
    if ((!base.name || base.name === base.id) && details.name) {
      patch.name = details.name
    }
    if (!base.address && details.address) patch.address = details.address
    if (base.latitude == null && details.latitude != null) {
      patch.latitude = details.latitude
    }
    if (base.longitude == null && details.longitude != null) {
      patch.longitude = details.longitude
    }
    if (!base.destination && details.address) {
      patch.destination = details.address
    }

    return Object.keys(patch).length ? patch : null
  } catch (error) {
    if (isAbortError(error)) {
      attemptedDetails.delete(base.id)
      throw error
    }
    return null
  }
}

/**
 * Resolve a Wikimedia thumbnail when imageUrl is missing.
 * Failures leave the place intact (caller keeps placeholder).
 */
export async function enrichFromWikimedia(place, { signal } = {}) {
  const base = normalizeSavedPlace(place)
  if (!base || !needsPlaceImage(base)) return null
  if (attemptedImages.has(base.id)) return null

  const query = imageSearchQuery(base)
  if (!query) return null

  attemptedImages.add(base.id)

  try {
    const image = await getDestinationImage(query, { signal })
    const url = image?.url || image?.thumb || null
    if (!url) return null
    return { imageUrl: url, image: url }
  } catch (error) {
    if (isAbortError(error)) {
      attemptedImages.delete(base.id)
      throw error
    }
    return null
  }
}

/**
 * Enrich one saved place for missing details/image. Returns merge patch or null.
 */
export async function enrichSavedPlace(place, { signal } = {}) {
  const base = normalizeSavedPlace(place)
  if (!base) return null

  const patch = {}

  if (needsPlaceDetails(base)) {
    const detailsPatch = await enrichFromPlaceDetails(base, { signal })
    if (detailsPatch) Object.assign(patch, detailsPatch)
  }

  const merged = { ...base, ...patch }
  if (needsPlaceImage(merged)) {
    const imagePatch = await enrichFromWikimedia(merged, { signal })
    if (imagePatch) Object.assign(patch, imagePatch)
  }

  return Object.keys(patch).length ? patch : null
}

/**
 * Enrich a list of local saved places. Does not reconstruct the collection.
 * Returns [{ id, patch }] for successful fills only.
 */
export async function enrichSavedPlaces(places, { signal } = {}) {
  const list = Array.isArray(places) ? places : []
  const updates = []

  for (const place of list) {
    if (signal?.aborted) break
    try {
      const patch = await enrichSavedPlace(place, { signal })
      if (patch && place?.id) updates.push({ id: place.id, patch })
    } catch (error) {
      if (isAbortError(error)) throw error
    }
  }

  return updates
}

export const savedPlacesService = {
  enrichSavedPlace,
  enrichSavedPlaces,
  enrichFromPlaceDetails,
  enrichFromWikimedia,
}
