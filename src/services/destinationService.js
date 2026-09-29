import fallbackHero from '../assets/hero.png'
import { cacheGet, cacheKey, cacheSet } from './cache.js'
import { ApiError, isAbortError } from './http.js'
import {
  getDestinationCoordinates,
  getNearbyAttractions,
  getPlaceDetails,
  searchGeocode,
} from './geoapify/index.js'
import {
  getRegisteredDestination,
  registerDestination,
} from './destinationRegistry.js'
import {
  getCurrentWeather,
  getDailyForecast,
} from './weather/index.js'
import {
  getDestinationSummary,
  getNearbyPageImages,
} from './wikimediaService.js'

const RESOLVE_TTL = 45 * 60 * 1000
const PLACES_TTL = 10 * 60 * 1000

/** Internal Discover IDs → geocode query (stable, not display-name-only). */
const INTERNAL_ID_QUERIES = {
  kyoto: 'Kyoto, Japan',
  'amalfi-coast': 'Amalfi, Italy',
  banff: 'Banff, Canada',
  lisbon: 'Lisbon, Portugal',
  london: 'London, United Kingdom',
  paris: 'Paris, France',
  dubai: 'Dubai, United Arab Emirates',
  istanbul: 'Istanbul, Turkey',
  tokyo: 'Tokyo, Japan',
  lahore: 'Lahore, Pakistan',
  islamabad: 'Islamabad, Pakistan',
  'new-york': 'New York, United States',
}

const ATTRACTION_CATEGORIES =
  'heritage.unesco,tourism.sights.place_of_worship,tourism.sights.castle,tourism.sights.monastery,tourism.sights.ruines,tourism.attraction.viewpoint,entertainment.museum,natural.protected_area,natural.mountain,beach'
const RESTAURANT_CATEGORIES =
  'catering.restaurant,catering.cafe,catering.fast_food,catering.food_court'
const HOTEL_CATEGORIES =
  'accommodation.hotel,accommodation.guest_house,accommodation.hostel,accommodation.motel'
const TRANSIT_CATEGORIES =
  'public_transport,public_transport.bus,public_transport.subway,railway.station'

function throwIfAborted(signal) {
  if (signal?.aborted) {
    const error = new Error('Request aborted')
    error.name = 'AbortError'
    throw error
  }
}

function notFoundError(destinationId) {
  const error = new ApiError(
    `Destination not found for “${destinationId}”.`,
    { code: 'NOT_FOUND', status: 404 },
  )
  return error
}

function idToSearchQuery(destinationId) {
  const id = String(destinationId || '').trim()
  if (!id) return ''
  if (INTERNAL_ID_QUERIES[id]) return INTERNAL_ID_QUERIES[id]
  // Slug like "barcelona-es" → "barcelona es"
  return id.replace(/-/g, ' ').trim()
}

function countryFlag(countryCode) {
  const cc = String(countryCode || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
  if (cc.length !== 2) return '🌍'
  return String.fromCodePoint(
    ...[...cc].map((char) => 127397 + char.charCodeAt(0)),
  )
}

function attractionFilters(place) {
  const filters = []
  const cats = place.categories || []
  if (
    cats.some(
      (c) =>
        c.includes('tourism.sights') ||
        c.includes('heritage') ||
        c.includes('tourism.attraction'),
    )
  ) {
    filters.push('must-see')
  }
  if (place.distance != null && place.distance <= 1500) {
    filters.push('walking')
  }
  // Only tag free when Geoapify conditions/fee data says so — never invent.
  const raw = place.rawConditions || place.conditions || []
  if (
    (Array.isArray(raw) && raw.some((c) => String(c).includes('fee.no'))) ||
    place.fee === 'no'
  ) {
    filters.push('free')
  }
  return filters
}

/**
 * Resolve destinationId → normalized destination with coordinates.
 * Prefers registry (from Discover), then known ID map, then Geoapify search.
 */
export async function resolveDestination(destinationId, { signal } = {}) {
  const id = String(destinationId || '').trim()
  if (!id) throw notFoundError(id)

  const key = cacheKey('destination:resolve', [id])
  const cached = cacheGet(key)
  if (cached) {
    throwIfAborted(signal)
    return cached
  }

  const registered = getRegisteredDestination(id)
  if (
    registered?.latitude != null &&
    registered?.longitude != null &&
    registered?.name
  ) {
    const resolved = registerDestination({ ...registered, id })
    return cacheSet(key, resolved, RESOLVE_TTL)
  }

  const query = idToSearchQuery(id)
  throwIfAborted(signal)

  let resolved
  if (INTERNAL_ID_QUERIES[id]) {
    const coords = await getDestinationCoordinates(query, { signal })
    resolved = coords?.destination || null
  } else {
    const results = await searchGeocode(query, { limit: 3, signal })
    resolved =
      results.find((r) => r.id === id) ||
      results[0] ||
      null
  }

  if (!resolved || resolved.latitude == null || resolved.longitude == null) {
    throw notFoundError(id)
  }

  const destination = registerDestination({
    ...resolved,
    id, // keep route id stable for bookmarks / navigation
  })

  return cacheSet(key, destination, RESOLVE_TTL)
}

async function enrichPlaceImage(place, { signal } = {}) {
  if (place.image) return place
  try {
    const query = [place.name, place.location || place.address]
      .filter(Boolean)
      .join(' ')
    const summary = await getDestinationSummary(query, { signal })
    if (!summary?.imageUrl) return place
    return {
      ...place,
      image: summary.imageUrl,
      imageAttribution: summary.attribution,
      description:
        place.description ||
        summary.extract ||
        place.address ||
        place.location ||
        '',
    }
  } catch (error) {
    if (isAbortError(error)) throw error
    return place
  }
}

async function loadPlaces(
  destinationId,
  categories,
  { signal, limit = 8, radius = 8000 } = {},
) {
  const destination = await resolveDestination(destinationId, { signal })
  const key = cacheKey('destination:places', [
    destinationId,
    categories,
    limit,
    radius,
  ])
  const hit = cacheGet(key)
  if (hit) {
    throwIfAborted(signal)
    return { destination, places: hit }
  }

  const places = await getNearbyAttractions(
    destination.latitude,
    destination.longitude,
    {
      categories,
      radius,
      limit,
      destinationId,
      signal,
    },
  )

  throwIfAborted(signal)
  cacheSet(key, places, PLACES_TTL)
  return { destination, places }
}

/**
 * Destination Details service — real Geoapify / Open-Meteo / Wikimedia backends.
 * Each method is independently abortable and cached.
 */
export const destinationService = {
  async getDestinationById(destinationId, { signal } = {}) {
    const base = await resolveDestination(destinationId, { signal })
    const wikiQuery = [base.name, base.country].filter(Boolean).join(', ')

    let wiki
    try {
      wiki = await getDestinationSummary(wikiQuery, { signal })
    } catch (error) {
      if (isAbortError(error)) throw error
      wiki = null
    }

    const description =
      wiki?.extract ||
      base.description ||
      base.formattedAddress ||
      [base.name, base.region, base.country].filter(Boolean).join(', ')

    const image = wiki?.imageUrl || base.image || fallbackHero

    return registerDestination({
      ...base,
      id: destinationId,
      localName: wiki?.title && wiki.title !== base.name ? wiki.title : base.name,
      flag: countryFlag(base.countryCode),
      regionLabel: [base.region, base.country].filter(Boolean).join(', '),
      tagline: wiki?.description || `${base.name} highlights`,
      district: base.region || base.city || '',
      description,
      badges: [
        { label: base.country || 'DESTINATION', tone: 'unesco' },
        { label: 'Live Destination Data', tone: 'accent' },
      ],
      photoCount: wiki?.imageUrl ? 1 : 0,
      rating: base.rating ?? null,
      reviewCount: base.ratingCount ?? null,
      bestSeason: null,
      dailyAvg: base.dailyAvg ?? null,
      image,
      coverImage: image,
      gallery: undefined,
      imageAttribution: wiki?.attribution || base.imageAttribution || null,
      wikipediaUrl: wiki?.pageUrl || null,
      experience: {
        eyebrow: 'LOCAL PICK',
        title: `Explore ${base.name}`,
        body:
          wiki?.extract ||
          `Discover landmarks, food, and stays around ${base.name}.`,
        tags: [base.region, base.country, 'Walkable'].filter(Boolean).slice(0, 3),
        cta: 'Explore ideas',
      },
      tip: wiki?.extract
        ? {
            title: 'About this destination',
            body: wiki.extract,
          }
        : {
            title: 'Local Travel Pro-Tip',
            body: `Start with nearby landmarks in ${base.name}, then keep evenings flexible for neighborhood dining.`,
          },
      // Budget is not supplied by these APIs — omit fabricated totals.
      budget: null,
      counts: {
        attractions: 0,
        restaurants: 0,
        hotels: 0,
      },
      latitude: base.latitude,
      longitude: base.longitude,
      placeId: base.placeId,
    })
  },

  async getDestinationImages(destinationId, { signal } = {}) {
    const destination = await resolveDestination(destinationId, { signal })
    const wikiQuery = [destination.name, destination.country]
      .filter(Boolean)
      .join(', ')

    let primary = null
    try {
      primary = await getDestinationSummary(wikiQuery, { signal })
    } catch (error) {
      if (isAbortError(error)) throw error
    }

    const nearby = await getNearbyPageImages(
      destination.latitude,
      destination.longitude,
      { radius: 12000, limit: 4, signal },
    ).catch((error) => {
      if (isAbortError(error)) throw error
      return []
    })

    const gallery = []
    const primaryUrl = primary?.imageUrl || destination.image || fallbackHero
    gallery.push({
      id: 'main',
      image: primaryUrl,
      eyebrow: (destination.region || destination.country || 'DESTINATION').toUpperCase(),
      caption: primary?.title || destination.name,
      meta: destination.district || destination.country || '',
      role: 'primary',
      attribution: primary?.attribution || null,
    })

    const extras = nearby
      .filter((item) => item.url && item.url !== primaryUrl)
      .slice(0, 2)

    if (extras[0]) {
      gallery.push({
        id: 'secondary',
        image: extras[0].url,
        eyebrow: 'NEARBY',
        caption: extras[0].title || `${destination.name} scene`,
        role: 'secondary',
        attribution: extras[0].attribution || null,
      })
    } else if (primaryUrl) {
      gallery.push({
        id: 'secondary',
        image: primaryUrl,
        eyebrow: 'SCENE',
        caption: `${destination.name}`,
        role: 'secondary',
      })
    }

    if (extras[1]) {
      gallery.push({
        id: 'photos',
        image: extras[1].url,
        caption: 'Gallery preview',
        role: 'photos',
        attribution: extras[1].attribution || null,
      })
    } else {
      gallery.push({
        id: 'photos',
        image: primaryUrl,
        caption: 'Gallery preview',
        role: 'photos',
      })
    }

    return {
      photoCount: gallery.length,
      gallery,
    }
  },

  async getDestinationWeather(destinationId, { signal } = {}) {
    const destination = await resolveDestination(destinationId, { signal })
    const weather = await getCurrentWeather(
      destination.latitude,
      destination.longitude,
      {
        signal,
        city: [destination.name, destination.country].filter(Boolean).join(', '),
        region: destination.region || '',
      },
    )
    return {
      title: weather.title,
      summary: weather.summary,
      temperatureC: weather.temperatureC,
      packingTip: weather.packingTip,
      condition: weather.condition,
      weatherCode: weather.weatherCode,
    }
  },

  async getDestinationForecast(destinationId, { signal } = {}) {
    const destination = await resolveDestination(destinationId, { signal })
    return getDailyForecast(destination.latitude, destination.longitude, {
      signal,
      days: 5,
      city: destination.name,
    })
  },

  async getDestinationAttractions(
    destinationId,
    { signal, filter = 'all' } = {},
  ) {
    const { places } = await loadPlaces(destinationId, ATTRACTION_CATEGORIES, {
      signal,
      limit: 9,
      radius: 10000,
    })

    let items = places.map((place) => {
      const filters = attractionFilters(place)
      return {
        id: place.id,
        name: place.name,
        area: (place.location || place.address || 'NEARBY').toUpperCase(),
        description: place.address || place.location || place.category || '',
        image: place.image || null,
        imageAttribution: place.imageAttribution || null,
        rating: null,
        duration:
          place.distance != null
            ? place.distance < 1000
              ? `${place.distance} m`
              : `${(place.distance / 1000).toFixed(1)} km`
            : null,
        priceLabel: null,
        priceTone: 'muted',
        note: place.category || null,
        filters,
        placeId: place.placeId || null,
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
        distance: place.distance,
        categories: place.categories,
        destinationId,
      }
    })

    if (filter && filter !== 'all') {
      items = items.filter((item) => item.filters?.includes(filter))
    }

    const enriched = await Promise.all(
      items.slice(0, 6).map((item) => enrichPlaceImage(item, { signal })),
    )
    return enriched
  },

  async getDestinationRestaurants(destinationId, { signal } = {}) {
    const { places } = await loadPlaces(destinationId, RESTAURANT_CATEGORIES, {
      signal,
      limit: 8,
      radius: 5000,
    })

    const items = places.map((place) => ({
      id: place.id,
      name: place.name,
      cuisine: place.category || 'Dining',
      priceLevel: null,
      description: place.address || place.location || '',
      image: place.image || null,
      badge:
        place.distance != null
          ? place.distance < 1000
            ? `${place.distance} m away`
            : `${(place.distance / 1000).toFixed(1)} km away`
          : place.category || 'Nearby',
      badgeTone: 'muted',
      action: 'View on map',
      placeId: place.placeId || null,
      latitude: place.latitude,
      longitude: place.longitude,
      destinationId,
    }))

    return Promise.all(
      items.slice(0, 4).map((item) => enrichPlaceImage(item, { signal })),
    )
  },

  async getDestinationHotels(destinationId, { signal } = {}) {
    const { places } = await loadPlaces(destinationId, HOTEL_CATEGORIES, {
      signal,
      limit: 8,
      radius: 8000,
    })

    const items = places.map((place) => ({
      id: place.id,
      name: place.name,
      area: (place.location || 'NEARBY').toUpperCase(),
      description: place.address || place.location || place.category || '',
      image: place.image || null,
      rating: null,
      priceFrom: null,
      tags: place.category ? [place.category] : ['Stay'],
      placeId: place.placeId || null,
      latitude: place.latitude,
      longitude: place.longitude,
      destinationId,
    }))

    return Promise.all(
      items.slice(0, 6).map((item) => enrichPlaceImage(item, { signal })),
    )
  },

  async getDestinationLocation(destinationId, { signal } = {}) {
    const destination = await resolveDestination(destinationId, { signal })

    const [attractions, restaurants, hotels, transit] = await Promise.all([
      getNearbyAttractions(destination.latitude, destination.longitude, {
        categories: ATTRACTION_CATEGORIES,
        radius: 8000,
        limit: 6,
        destinationId,
        signal,
      }).catch((e) => {
        if (isAbortError(e)) throw e
        return []
      }),
      getNearbyAttractions(destination.latitude, destination.longitude, {
        categories: RESTAURANT_CATEGORIES,
        radius: 4000,
        limit: 4,
        destinationId,
        signal,
      }).catch((e) => {
        if (isAbortError(e)) throw e
        return []
      }),
      getNearbyAttractions(destination.latitude, destination.longitude, {
        categories: HOTEL_CATEGORIES,
        radius: 6000,
        limit: 4,
        destinationId,
        signal,
      }).catch((e) => {
        if (isAbortError(e)) throw e
        return []
      }),
      getNearbyAttractions(destination.latitude, destination.longitude, {
        categories: TRANSIT_CATEGORIES,
        radius: 4000,
        limit: 4,
        destinationId,
        signal,
      }).catch((e) => {
        if (isAbortError(e)) throw e
        return []
      }),
    ])

    const nearest = attractions[0]
    const routeLabel =
      nearest?.distance != null
        ? `${nearest.distance < 1000 ? `${nearest.distance} m` : `${(nearest.distance / 1000).toFixed(1)} km`} to ${nearest.name}`
        : `Explore ${destination.name}`

    const markers = [
      {
        id: `dest-${destinationId}`,
        name: destination.name,
        latitude: destination.latitude,
        longitude: destination.longitude,
        type: 'destination',
        tone: 'accent',
      },
      ...attractions.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        type: 'attraction',
        tone: 'teal',
      })),
      ...restaurants.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        type: 'restaurant',
        tone: 'accent',
      })),
      ...hotels.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        type: 'hotel',
        tone: 'teal',
      })),
    ].filter((m) => m.latitude != null && m.longitude != null)

    const transitItems = transit.slice(0, 4).map((item, index) => ({
      id: item.id || `transit-${index}`,
      title: item.name,
      detail:
        item.distance != null
          ? item.distance < 1000
            ? `${item.distance} m`
            : `${(item.distance / 1000).toFixed(1)} km`
          : item.category || 'Nearby',
    }))

    return {
      lat: destination.latitude,
      lng: destination.longitude,
      routeLabel,
      highlightsLabel: `${markers.length - 1} places nearby`,
      markers,
      // Keep legacy pin shape empty — Leaflet uses markers with lat/lng.
      pins: [],
      transit:
        transitItems.length > 0
          ? transitItems
          : [
              {
                id: 'coords',
                title: destination.name,
                detail: `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`,
              },
            ],
      mapImage: null,
    }
  },

  async getPlaceDetails(placeIdOrOptions, options = {}) {
    if (placeIdOrOptions && typeof placeIdOrOptions === 'object') {
      return getPlaceDetails(placeIdOrOptions, options)
    }
    return getPlaceDetails(
      {
        placeId: placeIdOrOptions,
        latitude: options.latitude,
        longitude: options.longitude,
      },
      { signal: options.signal },
    )
  },
}
