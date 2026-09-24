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

export function normalizeSavedPlace(input) {
  if (!input || typeof input !== 'object') return null
  const id = String(input.id || '').trim()
  if (!id) return null

  const type = [
    'destination',
    'attraction',
    'restaurant',
    'hotel',
  ].includes(input.type)
    ? input.type
    : 'attraction'

  return {
    id,
    type,
    name: String(input.name || id),
    location: String(input.location || ''),
    image: input.image || null,
    destinationId: input.destinationId || null,
    meta: {
      rating: input.meta?.rating ?? input.rating ?? null,
      priceLabel: input.meta?.priceLabel ?? input.priceLabel ?? null,
      tags: input.meta?.tags ?? input.tags ?? [],
      subtitle: input.meta?.subtitle ?? input.subtitle ?? null,
    },
    savedAt: input.savedAt || new Date().toISOString(),
  }
}

export function fromDestination(destination) {
  return normalizeSavedPlace({
    id: destination.id,
    type: 'destination',
    name: destination.name,
    location: [
      destination.region || destination.regionLabel,
      destination.country,
    ]
      .filter(Boolean)
      .join(', '),
    image:
      destination.image ||
      destination.gallery?.[0]?.image ||
      destination.coverImage ||
      null,
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
  return normalizeSavedPlace({
    id: attraction.id,
    type: 'attraction',
    name: attraction.name,
    location:
      attraction.location ||
      attraction.area ||
      (dest ? `${dest.name}, ${dest.country}` : ''),
    image: attraction.image,
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
  return normalizeSavedPlace({
    id: restaurant.id,
    type: 'restaurant',
    name: restaurant.name,
    location:
      restaurant.cuisine ||
      (dest ? `${dest.name}, ${dest.country}` : destinationId || ''),
    image: restaurant.image,
    destinationId: destinationId || null,
    priceLabel: restaurant.priceLevel,
    tags: restaurant.badge ? [restaurant.badge] : [],
    subtitle: restaurant.cuisine || null,
  })
}

export function fromHotel(hotel, destinationId) {
  const dest = destinationId
    ? DESTINATIONS.find((d) => d.id === destinationId)
    : null
  return normalizeSavedPlace({
    id: hotel.id,
    type: 'hotel',
    name: hotel.name,
    location:
      hotel.area ||
      (dest ? `${dest.name}, ${dest.country}` : destinationId || ''),
    image: hotel.image,
    destinationId: destinationId || null,
    rating: hotel.rating,
    priceLabel: hotel.priceFrom ? `From $${hotel.priceFrom}` : null,
    tags: hotel.tags,
    subtitle: hotel.area || null,
  })
}

/** Resolve a legacy id-only bookmark against catalogs. */
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

  // Unknown orphan — keep a minimal entry so the id is not lost silently
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
    location: 'Saved place',
    image: null,
  })
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
      // Re-enrich thin records that only have id
      if (place && (!place.name || place.name === place.id) && !place.image) {
        place = resolveSavedPlaceById(place.id) || place
      }
    }

    if (!place || seen.has(place.id)) continue
    seen.add(place.id)
    items.push(place)
  }

  return items
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
