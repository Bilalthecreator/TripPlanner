/**
 * Stable destination IDs + normalization for Geoapify geocoding / places.
 */

/** Map Geoapify-derived slugs onto existing app destination IDs. */
const KNOWN_DESTINATION_IDS = {
  'kyoto-jp': 'kyoto',
  'amalfi-it': 'amalfi-coast',
  'amalfi-coast-it': 'amalfi-coast',
  'banff-ca': 'banff',
  'lisbon-pt': 'lisbon',
  'lisboa-pt': 'lisbon',
  'london-gb': 'london',
  'paris-fr': 'paris',
  'dubai-ae': 'dubai',
  'istanbul-tr': 'istanbul',
  'tokyo-jp': 'tokyo',
  'islamabad-pk': 'islamabad',
  'lahore-pk': 'lahore',
  'new-york-us': 'new-york',
  'new-york-city-us': 'new-york',
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function toDestinationId({ name, city, countryCode, placeId } = {}) {
  const label = city || name || ''
  const cc = String(countryCode || '')
    .toLowerCase()
    .slice(0, 2)
  const base = slugify(cc ? `${label}-${cc}` : label)
  if (KNOWN_DESTINATION_IDS[base]) return KNOWN_DESTINATION_IDS[base]

  const withoutCc = slugify(label)
  if (KNOWN_DESTINATION_IDS[`${withoutCc}-${cc}`]) {
    return KNOWN_DESTINATION_IDS[`${withoutCc}-${cc}`]
  }
  if (KNOWN_DESTINATION_IDS[withoutCc]) return KNOWN_DESTINATION_IDS[withoutCc]

  if (base) return base
  if (placeId) return `place-${String(placeId).slice(0, 24)}`
  return `dest-${Date.now()}`
}

function pickName(props = {}) {
  return (
    props.city ||
    props.name ||
    props.address_line1 ||
    props.formatted?.split(',')[0] ||
    'Unknown'
  )
}

function pickRegion(props = {}) {
  return props.state || props.county || props.region || props.suburb || ''
}

function resultTypeTag(props = {}) {
  const type = props.result_type || props.type || ''
  if (!type) return 'City'
  return type
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * Normalize a Geoapify geocode/autocomplete feature or result into the app destination model.
 * Does not invent ratings, prices, or demand status.
 */
export function normalizeGeocodeDestination(feature, extras = {}) {
  const props = feature?.properties || feature || {}
  const coords = feature?.geometry?.coordinates
  const lon = props.lon ?? props.lng ?? coords?.[0]
  const lat = props.lat ?? coords?.[1]

  const name = pickName(props)
  const city = props.city || name
  const country = props.country || ''
  const countryCode = props.country_code || ''
  const region = pickRegion(props)
  const formattedAddress = props.formatted || ''
  const id = toDestinationId({
    name,
    city,
    countryCode,
    placeId: props.place_id,
  })

  const description =
    formattedAddress ||
    [name, region, country].filter(Boolean).join(', ') ||
    `Explore ${name}`

  return {
    id,
    name,
    city,
    country,
    countryCode: String(countryCode).toUpperCase(),
    region,
    formattedAddress,
    description,
    image: extras.image ?? null,
    imageAttribution: extras.imageAttribution ?? null,
    tags: extras.tags || [resultTypeTag(props)].filter(Boolean),
    filters: extras.filters || [],
    // Optional UI fields — omit invented values; card handles absence.
    rating: extras.rating ?? null,
    ratingCount: extras.ratingCount ?? null,
    status: extras.status ?? null,
    dailyAvg: extras.dailyAvg ?? null,
    idealDays: extras.idealDays ?? null,
    trending: Boolean(extras.trending),
    latitude: Number.isFinite(Number(lat)) ? Number(lat) : null,
    longitude: Number.isFinite(Number(lon)) ? Number(lon) : null,
    placeId: props.place_id || null,
    provider: 'geoapify',
  }
}

export function normalizeSuggestion(feature) {
  const dest = normalizeGeocodeDestination(feature)
  return {
    id: dest.id,
    name: dest.name,
    country: dest.country,
    region: dest.region,
    latitude: dest.latitude,
    longitude: dest.longitude,
  }
}

function humanizeCategory(categories = []) {
  // Prefer traveler-meaningful leaves over generic parents / accessibility tags.
  const preferred = categories.find((c) =>
    /unesco|place_of_worship|castle|monastery|museum|viewpoint|mountain|beach|protected_area|attraction/.test(
      String(c),
    ),
  )
  const primary =
    preferred ||
    categories.find((c) => typeof c === 'string' && c.includes('.')) ||
    categories.find((c) => typeof c === 'string') ||
    ''
  const leaf = String(primary).split('.').pop() || primary
  if (!leaf) return 'Point of interest'
  return leaf
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function pickAttractionName(props = {}) {
  const intl = props.name_international
  const english =
    (intl && typeof intl === 'object' && (intl.en || intl.EN)) || null
  return (
    english ||
    props.name ||
    props.address_line1 ||
    props.formatted?.split(',')[0] ||
    'Attraction'
  )
}

/**
 * Normalize a Geoapify Places feature into an attraction card model.
 * Omits invented ratings, opening hours, and prices.
 */
export function normalizePlaceAttraction(feature, { destinationId } = {}) {
  const props = feature?.properties || {}
  const coords = feature?.geometry?.coordinates
  const lon = props.lon ?? props.lng ?? coords?.[0]
  const lat = props.lat ?? coords?.[1]
  const categories = Array.isArray(props.categories)
    ? props.categories
    : props.categories
      ? [props.categories]
      : []

  const name = pickAttractionName(props)
  const id = props.place_id
    ? `poi-${slugify(props.place_id).slice(0, 40)}`
    : slugify(`${name || 'place'}-${lat}-${lon}`)

  const location = [props.city || props.suburb, props.country]
    .filter(Boolean)
    .join(', ')

  return {
    id,
    name,
    location: location || props.formatted || props.address_line2 || '',
    category: humanizeCategory(categories),
    // No fabricated duration / price — UI omits when absent.
    duration: null,
    priceLabel: null,
    priceTone: 'muted',
    image: null,
    imageAttribution: null,
    destinationId: destinationId || null,
    address: props.formatted || '',
    placeId: props.place_id || null,
    latitude: Number.isFinite(Number(lat)) ? Number(lat) : null,
    longitude: Number.isFinite(Number(lon)) ? Number(lon) : null,
    distance:
      props.distance != null && Number.isFinite(Number(props.distance))
        ? Math.round(Number(props.distance))
        : null,
    categories,
    wikidata: props.wikidata || null,
    provider: 'geoapify',
  }
}

/** Discover filter chip → Geoapify Places categories (validated against Places API). */
export const FILTER_PLACE_CATEGORIES = {
  beach: 'beach,beach.beach_resort,natural.coastal',
  mountain: 'natural.mountain,natural.forest,natural.protected_area',
  culture: 'heritage.unesco,entertainment.culture,tourism.sights.place_of_worship,tourism.sights.castle',
  foodie: 'catering.restaurant,catering.cafe,catering.fast_food',
}

/**
 * Curated destination queries per Discover filter chip.
 * Resolved live via Geoapify geocode + Wikimedia — not a static card catalog.
 * Covers budget / weekend (no honest Places category) and guarantees usable results
 * when Places-hub discovery is sparse.
 */
export const FILTER_DESTINATION_QUERIES = {
  beach: [
    'Amalfi, Italy',
    'Nice, France',
    'Fira, Santorini, Greece',
    'Denpasar, Bali, Indonesia',
    'Miami Beach, United States',
    'Patong, Phuket, Thailand',
    'Barcelona, Spain',
    'Male, Maldives',
  ],
  mountain: [
    'Banff, Canada',
    'Zermatt, Switzerland',
    'Chamonix, France',
    'Queenstown, New Zealand',
    'Aspen, United States',
    'Interlaken, Switzerland',
    'Innsbruck, Austria',
    'Kathmandu, Nepal',
  ],
  culture: [
    'Kyoto, Japan',
    'Rome, Italy',
    'Paris, France',
    'Istanbul, Turkey',
    'Athens, Greece',
    'Florence, Italy',
    'Cairo, Egypt',
    'Beijing, China',
  ],
  foodie: [
    'Tokyo, Japan',
    'Bangkok, Thailand',
    'Lyon, France',
    'Mexico City, Mexico',
    'Singapore',
    'Bologna, Italy',
    'New Orleans, United States',
    'Barcelona, Spain',
  ],
  budget: [
    'Lisbon, Portugal',
    'Budapest, Hungary',
    'Chiang Mai, Thailand',
    'Prague, Czechia',
    'Hanoi, Vietnam',
    'Krakow, Poland',
    'Porto, Portugal',
    'Sofia, Bulgaria',
  ],
  weekend: [
    'Lisbon, Portugal',
    'Barcelona, Spain',
    'Amsterdam, Netherlands',
    'Edinburgh, United Kingdom',
    'Vienna, Austria',
    'Bruges, Belgium',
    'Nice, France',
    'Porto, Portugal',
  ],
}

/**
 * Broad tourism buckets return plaques / sculptures first under proximity bias.
 * Prefer landmark-grade categories; places.js merges parallel buckets + ranks.
 */
export const DEFAULT_ATTRACTION_CATEGORIES =
  'heritage.unesco,tourism.sights.place_of_worship,tourism.sights.castle,tourism.sights.monastery,tourism.sights.ruines,tourism.attraction.viewpoint,entertainment.museum,natural.protected_area,natural.mountain,beach'

/** Parallel Places queries so UNESCO / temples aren't crowded out by nearby museums. */
export const ATTRACTION_CATEGORY_BUCKETS = [
  { categories: 'heritage.unesco', radius: 30000, limit: 16 },
  {
    categories:
      'tourism.sights.place_of_worship,tourism.sights.castle,tourism.sights.monastery,tourism.sights.ruines,tourism.attraction.viewpoint',
    radius: 20000,
    limit: 24,
  },
  {
    categories:
      'entertainment.museum,entertainment.culture,natural.protected_area,natural.mountain,beach',
    radius: 20000,
    limit: 16,
  },
]

/**
 * Curated discovery seeds for the empty-state "Trending Destinations" grid.
 * Not a live popularity feed — resolved via Geoapify + Wikimedia + Open-Meteo.
 */
export const TRENDING_SEED_QUERIES = [
  'Kyoto, Japan',
  'Amalfi, Italy',
  'Banff, Canada',
  'Lisbon, Portugal',
  'Paris, France',
  'Tokyo, Japan',
  'London, United Kingdom',
  'Dubai, United Arab Emirates',
  'Lahore, Pakistan',
  'Islamabad, Pakistan',
]

/** Regional hubs used when discovering destinations for supported place filters. */
export const FILTER_HUBS = [
  { name: 'Mediterranean', lat: 41.9, lon: 12.5 },
  { name: 'East Asia', lat: 35.68, lon: 139.76 },
  { name: 'North America', lat: 40.71, lon: -74.0 },
  { name: 'Oceania', lat: -33.87, lon: 151.21 },
]
