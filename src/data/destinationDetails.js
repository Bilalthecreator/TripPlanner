import heroMain from '../assets/details/hero-main.jpg'
import heroBamboo from '../assets/details/hero-bamboo.jpg'
import heroKinkaku from '../assets/details/hero-kinkaku.jpg'
import attrFushimi from '../assets/details/attr-fushimi.jpg'
import attrBamboo from '../assets/details/attr-bamboo.jpg'
import attrKinkaku from '../assets/details/attr-kinkaku.jpg'
import foodGion from '../assets/details/food-gion.jpg'
import foodNishiki from '../assets/details/food-nishiki.jpg'
import mapPreview from '../assets/details/map-preview.jpg'
import { DESTINATIONS } from './destinations.js'

/**
 * Rich destination details catalog keyed by destinationId.
 * Kyoto matches the Figma Destination Details screen; other IDs get derived detail payloads.
 */
const KYOTO_DETAILS = {
  id: 'kyoto',
  name: 'Kyoto',
  country: 'Japan',
  countryCode: 'JP',
  localName: '京都',
  flag: '🇯🇵',
  regionLabel: 'Kansai Region, Honshu',
  tagline: 'Ancient Imperial Capital of Japan',
  district: 'Higashiyama District',
  description:
    'Where thousand-year-old wooden shrines meet neon alleyways, moss-covered temple gardens, and world-revered matcha traditions along the Kamogawa riverbanks.',
  badges: [
    { label: 'UNESCO HERITAGE CITY', tone: 'unesco' },
    { label: 'Trending #1 Autumn Destination', tone: 'accent' },
  ],
  photoCount: 28,
  rating: 4.9,
  reviewCount: '14.2k',
  bestSeason: 'Mar–May & Oct–Nov',
  dailyAvg: 95,
  gallery: [
    {
      id: 'main',
      image: heroMain,
      eyebrow: 'KANSAI REGION, HONSHU',
      caption: 'Ancient Imperial Capital of Japan',
      meta: 'Higashiyama District',
      role: 'primary',
    },
    {
      id: 'bamboo',
      image: heroBamboo,
      eyebrow: 'NATURE SANCTUARY',
      caption: 'Arashiyama Bamboo Path',
      role: 'secondary',
    },
    {
      id: 'kinkaku',
      image: heroKinkaku,
      caption: 'Kinkaku-ji Mirror Pond',
      role: 'photos',
    },
  ],
  experience: {
    eyebrow: 'LOCAL ETIQUETTE & INSIDER INSIGHT',
    title: 'Experience an Authentic Chanoyu Tea Ceremony',
    body: 'Uji matcha masterclasses located in 150-year-old Machiya residences in the Kennin-ji temple quarter. Advance booking recommended.',
    tags: ['English Interpreter Available', '90 Min Session', 'From ¥4,200'],
    cta: 'Book Masterclass',
  },
  tip: {
    title: 'Local Travel Pro-Tip',
    body: 'Most temple grounds close their ticketing booths at 16:30. Start early mornings at open-air sites like Fushimi Inari or Bamboo Forest, then shift to shopping arcades like Teramachi at twilight.',
  },
  budget: {
    label: '5-Day Standard',
    total: 475,
    segments: [
      { id: 'stay', label: 'Stay', amount: 210, color: '#00685f' },
      { id: 'food', label: 'Food', amount: 145, color: '#b90538' },
      { id: 'entry', label: 'Entry', amount: 70, color: '#635e55' },
      { id: 'transit', label: 'Transit', amount: 50, color: '#bc0b3b' },
    ],
  },
  counts: {
    attractions: 18,
    restaurants: 24,
    hotels: 14,
  },
}

const KYOTO_WEATHER = {
  title: 'Kyoto Autumn Forecast & Seasonality',
  summary: 'Current live telemetry: 19°C, mild breeze, golden foliage peaking',
  temperatureC: 19,
  packingTip: 'PACK LIGHT LAYERS & COMFORTABLE SLIP-ON WALKING SHOES',
}

const KYOTO_FORECAST = [
  { id: 'd1', label: 'Wed, Oct 24', highC: 21, lowC: 11, precip: 10, condition: 'partly-sunny', isToday: true },
  { id: 'd2', label: 'Thu, Oct 25', highC: 23, lowC: 13, precip: 0, condition: 'sunny', isToday: false },
  { id: 'd3', label: 'Fri, Oct 26', highC: 19, lowC: 12, precip: 25, condition: 'cloudy', isToday: false },
  { id: 'd4', label: 'Sat, Oct 27', highC: 17, lowC: 10, precip: 60, condition: 'rain', isToday: false },
  { id: 'd5', label: 'Sun, Oct 28', highC: 20, lowC: 9, precip: 5, condition: 'sunny', isToday: false },
]

const KYOTO_ATTRACTIONS = [
  {
    id: 'fushimi-inari-taisha',
    name: 'Fushimi Inari-Taisha',
    area: 'SOUTHERN KYOTO',
    description: 'Iconic mountain path framed by over 10,000 brilliant vermilion torii gates…',
    image: attrFushimi,
    rating: 4.9,
    duration: '2–3 hrs',
    priceLabel: 'FREE',
    priceTone: 'free',
    note: 'Crowd: Best before 8am',
    filters: ['must-see', 'free', 'walking'],
  },
  {
    id: 'arashiyama-bamboo',
    name: 'Arashiyama Bamboo Grove',
    area: 'WESTERN KYOTO',
    description: 'Soaring emerald bamboo stems swaying with wind murmurs, leading towards…',
    image: attrBamboo,
    rating: 4.8,
    duration: '1.5–2 hrs',
    priceLabel: 'FREE',
    priceTone: 'free',
    note: 'Transit: JR San-in Line',
    filters: ['must-see', 'free'],
  },
  {
    id: 'kinkaku-ji',
    name: 'Kinkaku-ji (Golden Pavilion)',
    area: 'KITA WARD',
    description: 'Two upper tiers covered in gold leaf overlooking Kyoko-chi mirror pond,…',
    image: attrKinkaku,
    rating: 4.7,
    duration: '1–1.5 hrs',
    priceLabel: '¥500 (~$3.50)',
    priceTone: 'paid',
    note: 'Hours: 9:00 AM – 5:00 PM',
    filters: ['must-see', 'walking'],
  },
]

const KYOTO_RESTAURANTS = [
  {
    id: 'gion-nanba',
    name: 'Gion Nanba (祇園 なんば)',
    cuisine: 'Traditional Kaiseki',
    priceLevel: '$$$$',
    description: 'Michelin-starred seasonal multicourse feast in',
    image: foodGion,
    badge: 'Michelin 1-Star',
    badgeTone: 'teal',
    action: 'Reserve table',
  },
  {
    id: 'nishiki-market',
    name: "Nishiki Market (\"Kyoto's Kitchen\")",
    cuisine: 'Street Food / Market',
    priceLevel: '$$',
    description: '130+ open stalls serving grilled octopus…',
    image: foodNishiki,
    badge: '5-block arcade',
    badgeTone: 'muted',
    action: 'Food map & tips',
  },
]

const KYOTO_HOTELS = [
  {
    id: 'hiiragiya-ryokan',
    name: 'Hiiragiya Ryokan',
    area: 'CENTRAL KYOTO',
    description: 'Historic ryokan with garden-facing tatami suites and seasonal kaiseki breakfast.',
    image: heroKinkaku,
    rating: 4.9,
    priceFrom: 420,
    tags: ['Ryokan', 'Onsen'],
  },
  {
    id: 'ace-hotel-kyoto',
    name: 'Ace Hotel Kyoto',
    area: 'KARASUMA',
    description: 'Design-forward stay in a renovated telephone exchange with walkable nightlife.',
    image: heroMain,
    rating: 4.6,
    priceFrom: 210,
    tags: ['Boutique', 'City'],
  },
  {
    id: 'hotel-kanra',
    name: 'Hotel Kanra Kyoto',
    area: 'GOJO',
    description: 'Contemporary machiya-inspired rooms steps from subway and temple corridors.',
    image: heroBamboo,
    rating: 4.7,
    priceFrom: 260,
    tags: ['Design', 'Quiet'],
  },
]

const KYOTO_LOCATION = {
  lat: 35.0116,
  lng: 135.7681,
  mapImage: mapPreview,
  routeLabel: '18 min scenic walk • 1.2 km',
  highlightsLabel: '4 Highlights in Gion / Central',
  pins: [
    { id: 'start', x: 36, y: 22, tone: 'accent' },
    { id: 'end', x: 62, y: 48, tone: 'teal' },
  ],
  transit: [
    { id: 'haruka', title: 'JR Haruka Express', detail: '75m from KIX' },
    { id: 'karasuma', title: 'Karasuma Line', detail: 'IC Card / Pasmo' },
    { id: 'bus', title: 'City Bus Pass', detail: '¥700 1-day unlim.' },
    { id: 'luup', title: 'LUUP E-Bikes', detail: 'Station at hotel' },
  ],
}

function catalogEntry(id) {
  return DESTINATIONS.find((d) => d.id === id) ?? null
}

function buildGenericDetails(base) {
  return {
    id: base.id,
    name: base.name,
    country: base.country,
    countryCode: base.country.slice(0, 2).toUpperCase(),
    localName: base.name,
    flag: '🌍',
    regionLabel: `${base.region}`,
    tagline: `${base.name} highlights`,
    district: base.region,
    description: base.description,
    badges: [
      { label: base.tags?.[0] ?? 'FEATURED', tone: 'unesco' },
      { label: base.status ?? 'Trending', tone: 'accent' },
    ],
    photoCount: 12,
    rating: base.rating,
    reviewCount: base.ratingCount,
    bestSeason: 'Year-round',
    dailyAvg: base.dailyAvg,
    gallery: [
      {
        id: 'main',
        image: base.image,
        eyebrow: base.region?.toUpperCase?.() ?? 'DESTINATION',
        caption: base.name,
        meta: base.country,
        role: 'primary',
      },
      {
        id: 'secondary',
        image: base.image,
        eyebrow: 'SCENE',
        caption: `${base.name} streets`,
        role: 'secondary',
      },
      {
        id: 'photos',
        image: base.image,
        caption: 'Gallery preview',
        role: 'photos',
      },
    ],
    experience: {
      eyebrow: 'LOCAL PICK',
      title: `Plan a day around ${base.name}`,
      body: `Use signature walks, food stops, and stays curated for ${base.country}.`,
      tags: ['Half-day', 'Walkable', 'From $40'],
      cta: 'Explore ideas',
    },
    tip: {
      title: 'Local Travel Pro-Tip',
      body: `Start with the highest-rated landmarks in ${base.name}, then keep evenings flexible for neighborhood dining.`,
    },
    budget: {
      label: '5-Day Standard',
      total: Math.round(base.dailyAvg * 5),
      segments: [
        { id: 'stay', label: 'Stay', amount: Math.round(base.dailyAvg * 2.2), color: '#00685f' },
        { id: 'food', label: 'Food', amount: Math.round(base.dailyAvg * 1.5), color: '#b90538' },
        { id: 'entry', label: 'Entry', amount: Math.round(base.dailyAvg * 0.7), color: '#635e55' },
        { id: 'transit', label: 'Transit', amount: Math.round(base.dailyAvg * 0.6), color: '#bc0b3b' },
      ],
    },
    counts: { attractions: 12, restaurants: 16, hotels: 10 },
  }
}

export const DESTINATION_DETAILS = {
  kyoto: KYOTO_DETAILS,
}

export function getDetailsRecord(destinationId) {
  if (DESTINATION_DETAILS[destinationId]) return DESTINATION_DETAILS[destinationId]
  const base = catalogEntry(destinationId)
  if (!base) return null
  return buildGenericDetails(base)
}

export function getWeatherRecord(destinationId) {
  if (destinationId === 'kyoto') return KYOTO_WEATHER
  const details = getDetailsRecord(destinationId)
  if (!details) return null
  return {
    title: `${details.name} Forecast & Seasonality`,
    summary: `Current live telemetry: ${Math.round(18 + (details.dailyAvg % 7))}°C, mild conditions`,
    temperatureC: Math.round(18 + (details.dailyAvg % 7)),
    packingTip: 'PACK LAYERS AND COMFORTABLE WALKING SHOES',
  }
}

export function getForecastRecord(destinationId) {
  if (destinationId === 'kyoto') return KYOTO_FORECAST
  if (!getDetailsRecord(destinationId)) return null
  return KYOTO_FORECAST.map((day, index) => ({
    ...day,
    id: `${destinationId}-${day.id}`,
    highC: day.highC - (index % 2),
    lowC: day.lowC - (index % 2),
  }))
}

export function getAttractionsRecord(destinationId) {
  if (destinationId === 'kyoto') return KYOTO_ATTRACTIONS
  const details = getDetailsRecord(destinationId)
  if (!details) return null
  return [
    {
      id: `${destinationId}-spot-1`,
      name: `${details.name} Landmark`,
      area: details.regionLabel?.toUpperCase?.() ?? 'CENTER',
      description: details.description,
      image: details.gallery[0].image,
      rating: details.rating,
      duration: '2 hrs',
      priceLabel: 'FREE',
      priceTone: 'free',
      note: 'Best in the morning',
      filters: ['must-see', 'free'],
    },
    {
      id: `${destinationId}-spot-2`,
      name: `${details.name} Walk`,
      area: 'OLD TOWN',
      description: `Signature streets and viewpoints around ${details.name}.`,
      image: details.gallery[1]?.image ?? details.gallery[0].image,
      rating: Math.max(4.2, details.rating - 0.1),
      duration: '1.5 hrs',
      priceLabel: 'FREE',
      priceTone: 'free',
      note: 'Walking distance',
      filters: ['walking', 'free'],
    },
    {
      id: `${destinationId}-spot-3`,
      name: `${details.name} Museum`,
      area: 'CULTURAL',
      description: `Compact cultural stop with strong reviews in ${details.country}.`,
      image: details.gallery[2]?.image ?? details.gallery[0].image,
      rating: Math.max(4.1, details.rating - 0.2),
      duration: '1–2 hrs',
      priceLabel: '$12',
      priceTone: 'paid',
      note: 'Ticketed entry',
      filters: ['must-see'],
    },
  ]
}

export function getRestaurantsRecord(destinationId) {
  if (destinationId === 'kyoto') return KYOTO_RESTAURANTS
  const details = getDetailsRecord(destinationId)
  if (!details) return null
  return [
    {
      id: `${destinationId}-food-1`,
      name: `${details.name} Bistro`,
      cuisine: 'Local Favorites',
      priceLevel: '$$$',
      description: `Chef-driven plates inspired by ${details.country}.`,
      image: details.gallery[0].image,
      badge: 'Chef pick',
      badgeTone: 'teal',
      action: 'Reserve table',
    },
    {
      id: `${destinationId}-food-2`,
      name: `${details.name} Market Hall`,
      cuisine: 'Street Food / Market',
      priceLevel: '$$',
      description: 'Casual stalls and tasting walks for an easy midday stop.',
      image: details.gallery[1]?.image ?? details.gallery[0].image,
      badge: 'Walkable',
      badgeTone: 'muted',
      action: 'Food map & tips',
    },
  ]
}

export function getHotelsRecord(destinationId) {
  if (destinationId === 'kyoto') return KYOTO_HOTELS
  const details = getDetailsRecord(destinationId)
  if (!details) return null
  return [
    {
      id: `${destinationId}-hotel-1`,
      name: `${details.name} Central Hotel`,
      area: 'DOWNTOWN',
      description: `Walkable base near the main sights of ${details.name}.`,
      image: details.gallery[0].image,
      rating: details.rating,
      priceFrom: Math.round(details.dailyAvg * 1.4),
      tags: ['Central', 'Transit'],
    },
    {
      id: `${destinationId}-hotel-2`,
      name: `${details.name} Boutique Stay`,
      area: 'OLD QUARTER',
      description: 'Quiet rooms with local design details and breakfast included.',
      image: details.gallery[1]?.image ?? details.gallery[0].image,
      rating: Math.max(4.3, details.rating - 0.1),
      priceFrom: Math.round(details.dailyAvg * 1.8),
      tags: ['Boutique'],
    },
  ]
}

export function getLocationRecord(destinationId) {
  if (destinationId === 'kyoto') return KYOTO_LOCATION
  const details = getDetailsRecord(destinationId)
  if (!details) return null
  return {
    lat: 40 + (details.name.length % 10),
    lng: -20 + (details.country.length % 40),
    mapImage: mapPreview,
    routeLabel: '12 min scenic walk • 0.9 km',
    highlightsLabel: `Top stops in ${details.name}`,
    pins: [
      { id: 'start', x: 40, y: 28, tone: 'accent' },
      { id: 'end', x: 58, y: 52, tone: 'teal' },
    ],
    transit: [
      { id: 'rail', title: 'Central Rail', detail: 'Airport link' },
      { id: 'metro', title: 'Metro Line', detail: 'City pass' },
      { id: 'bus', title: 'City Bus', detail: 'Day ticket' },
      { id: 'bike', title: 'Bike Share', detail: 'Hotel dock' },
    ],
  }
}
