import { DESTINATIONS } from '../data/destinations.js'
import { ATTRACTIONS } from '../data/attractions.js'
import {
  getAttractionsRecord,
  getDetailsRecord,
  getHotelsRecord,
  getRestaurantsRecord,
} from '../data/destinationDetails.js'

export const SAVED_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'destination', label: 'Destinations' },
  { id: 'attraction', label: 'Attractions' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'hotel', label: 'Hotels' },
]

export const SAVED_TYPES = {
  destination: 'destination',
  attraction: 'attraction',
  restaurant: 'restaurant',
  hotel: 'hotel',
}

const VALID_TYPES = new Set(Object.values(SAVED_TYPES))

function pickImageUrl(input = {}) {
  return (
    input.imageUrl ||
    input.image ||
    input.coverImage ||
    input.gallery?.[0]?.image ||
    null
  )
}

function toCoord(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function buildLocationLabel(input = {}) {
  if (input.destination) return String(input.destination)
  if (input.location) return String(input.location)
  const parts = [
    input.city,
    input.region || input.regionLabel,
    input.country,
  ].filter(Boolean)
  return parts.join(', ')
}

/**
 * Normalized saved-place model (user-owned, persisted locally).
 * UI may still read `image` / `location` aliases.
 */
export function normalizeSavedPlace(input) {
  if (!input || typeof input !== 'object') return null
  const id = String(input.id || '').trim()
  if (!id) return null

  const type = VALID_TYPES.has(input.type) ? input.type : 'attraction'
  const destination = buildLocationLabel(input)
  const address = String(input.address || '').trim()
  const imageUrl = pickImageUrl(input)
  const latitude = toCoord(input.latitude ?? input.lat)
  const longitude = toCoord(input.longitude ?? input.lon ?? input.lng)
  const providerId =
    input.providerId || input.placeId || input.provider_id || null

  return {
    id,
    providerId: providerId ? String(providerId) : null,
    type,
    name: String(input.name || id).trim() || id,
    destination,
    address,
    latitude,
    longitude,
    imageUrl,
    savedAt: input.savedAt || new Date().toISOString(),
    // Navigation / display helpers (still local)
    destinationId: input.destinationId || (type === 'destination' ? id : null),
    // Aliases for existing cards
    image: imageUrl,
    location: destination || address || '',
    meta: {
      rating: input.meta?.rating ?? input.rating ?? null,
      priceLabel: input.meta?.priceLabel ?? input.priceLabel ?? null,
      tags: input.meta?.tags ?? input.tags ?? [],
      subtitle: input.meta?.subtitle ?? input.subtitle ?? null,
    },
  }
}

export function fromDestination(destination) {
  const country = destination.country || ''
  const region = destination.region || destination.regionLabel || ''
  return normalizeSavedPlace({
    id: destination.id,
    providerId: destination.placeId || destination.providerId || null,
    type: 'destination',
    name: destination.name,
    destination: [destination.name, region, country].filter(Boolean).join(', '),
    address: destination.formattedAddress || destination.address || '',
    latitude: destination.latitude,
    longitude: destination.longitude,
    imageUrl: pickImageUrl(destination),
    destinationId: destination.id,
    rating: destination.rating,
    tags: destination.tags,
    priceLabel: destination.dailyAvg
      ? `From $${destination.dailyAvg}/day`
      : null,
  })
}

export function fromAttraction(attraction, destinationId) {
  const destId = destinationId || attraction.destinationId || null
  const dest = destId ? DESTINATIONS.find((d) => d.id === destId) : null
  const destinationLabel =
    attraction.location ||
    attraction.area ||
    (dest ? `${dest.name}, ${dest.country}` : '') ||
    [attraction.city, attraction.country].filter(Boolean).join(', ')

  return normalizeSavedPlace({
    id: attraction.id,
    providerId: attraction.placeId || attraction.providerId || null,
    type: 'attraction',
    name: attraction.name,
    destination: destinationLabel,
    address:
      attraction.address ||
      attraction.formatted ||
      attraction.description ||
      '',
    latitude: attraction.latitude,
    longitude: attraction.longitude,
    imageUrl: pickImageUrl(attraction),
    destinationId: destId,
    rating: attraction.rating,
    priceLabel: attraction.priceLabel,
    tags: attraction.filters || attraction.tags,
    subtitle: attraction.duration || attraction.category || null,
  })
}

export function fromRestaurant(restaurant, destinationId) {
  const dest = destinationId
    ? DESTINATIONS.find((d) => d.id === destinationId)
    : null
  const destinationLabel =
    restaurant.location ||
    (dest ? `${dest.name}, ${dest.country}` : '') ||
    destinationId ||
    ''

  return normalizeSavedPlace({
    id: restaurant.id,
    providerId: restaurant.placeId || restaurant.providerId || null,
    type: 'restaurant',
    name: restaurant.name,
    destination: destinationLabel,
    address:
      restaurant.address ||
      restaurant.formatted ||
      restaurant.description ||
      restaurant.cuisine ||
      '',
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    imageUrl: pickImageUrl(restaurant),
    destinationId: destinationId || restaurant.destinationId || null,
    priceLabel: restaurant.priceLevel,
    tags: restaurant.badge ? [restaurant.badge] : [],
    subtitle: restaurant.cuisine || null,
  })
}

export function fromHotel(hotel, destinationId) {
  const dest = destinationId
    ? DESTINATIONS.find((d) => d.id === destinationId)
    : null
  const destinationLabel =
    hotel.area ||
    hotel.location ||
    (dest ? `${dest.name}, ${dest.country}` : '') ||
    destinationId ||
    ''

  return normalizeSavedPlace({
    id: hotel.id,
    providerId: hotel.placeId || hotel.providerId || null,
    type: 'hotel',
    name: hotel.name,
    destination: destinationLabel,
    address:
      hotel.address || hotel.formatted || hotel.description || hotel.area || '',
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    imageUrl: pickImageUrl(hotel),
    destinationId: destinationId || hotel.destinationId || null,
    rating: hotel.rating,
    priceLabel: hotel.priceFrom ? `From $${hotel.priceFrom}` : null,
    tags: hotel.tags,
    subtitle: hotel.area || null,
  })
}

/** Resolve a legacy id-only bookmark against catalogs (migration only). */
export function resolveSavedPlaceById(id) {
  const destination = DESTINATIONS.find((d) => d.id === id)
  if (destination) return fromDestination(destination)

  const discoverAttraction = ATTRACTIONS.find((a) => a.id === id)
  if (discoverAttraction) return fromAttraction(discoverAttraction)

  for (const dest of DESTINATIONS) {
    const attractions = getAttractionsRecord(dest.id) || []
    const attraction = attractions.find((a) => a.id === id)
    if (attraction) return fromAttraction(attraction, dest.id)

    const restaurants = getRestaurantsRecord(dest.id) || []
    const restaurant = restaurants.find((r) => r.id === id)
    if (restaurant) return fromRestaurant(restaurant, dest.id)

    const hotels = getHotelsRecord(dest.id) || []
    const hotel = hotels.find((h) => h.id === id)
    if (hotel) return fromHotel(hotel, dest.id)
  }

  const details = getDetailsRecord(id)
  if (details) {
    return fromDestination({
      id,
      name: details.name,
      country: details.country,
      region: details.regionLabel,
      image: details.gallery?.[0]?.image,
      rating: details.rating,
      tags: [],
      dailyAvg: details.dailyAvg,
    })
  }

  return normalizeSavedPlace({
    id,
    type: 'attraction',
    name: id,
    destination: 'Saved place',
    address: '',
    imageUrl: null,
  })
}

function isThinRecord(place) {
  if (!place) return true
  const nameMissing = !place.name || place.name === place.id
  const noCoords = place.latitude == null && place.longitude == null
  const noProvider = !place.providerId
  const noImage = !place.imageUrl && !place.image
  return nameMissing && noCoords && noProvider && noImage
}

export function hydrateSavedPlaces(raw) {
  if (!Array.isArray(raw)) return []

  const seen = new Set()
  const items = []

  for (const entry of raw) {
    let place = null
    if (typeof entry === 'string') {
      place = resolveSavedPlaceById(entry)
    } else if (entry && typeof entry === 'object') {
      place = normalizeSavedPlace(entry)
      // Legacy thin id-only objects — migrate once from catalogs.
      if (place && isThinRecord(place)) {
        place = resolveSavedPlaceById(place.id) || place
      }
    }

    if (!place || seen.has(place.id)) continue
    seen.add(place.id)
    items.push(place)
  }

  return items
}

export function filterSavedPlaces(
  places,
  { type = 'all', query = '' } = {},
) {
  let next = [...(places || [])]

  if (type && type !== 'all') {
    next = next.filter((place) => place.type === type)
  }

  const q = query.trim().toLowerCase()
  if (q) {
    next = next.filter((place) =>
      [
        place.name,
        place.destination,
        place.address,
        place.location,
        place.type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }

  return next
}

export function needsPlaceDetails(place) {
  if (!place) return false
  const hasLookup =
    Boolean(place.providerId) ||
    (place.latitude != null && place.longitude != null)
  if (!hasLookup) return false
  const missingAddress = !String(place.address || '').trim()
  const missingCoords = place.latitude == null || place.longitude == null
  const missingName = !place.name || place.name === place.id
  return missingAddress || missingCoords || missingName
}

export function needsPlaceImage(place) {
  if (!place) return false
  return !place.imageUrl && !place.image
}

export function typeLabel(type) {
  switch (type) {
    case 'destination':
      return 'Destination'
    case 'attraction':
      return 'Attraction'
    case 'restaurant':
      return 'Restaurant'
    case 'hotel':
      return 'Hotel'
    default:
      return 'Saved'
  }
}
