import kyotoImg from '../assets/destinations/kyoto.jpg'
import amalfiImg from '../assets/destinations/amalfi.jpg'
import banffImg from '../assets/destinations/banff.jpg'
import lisbonImg from '../assets/destinations/lisbon.jpg'

/**
 * Destination catalog for Discover.
 * Image fields point at local Figma exports for design destinations;
 * additional search cities use curated Unsplash URLs (stable, not Figma temp URLs).
 */
export const DESTINATIONS = [
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Kansai',
    description:
      'Historic imperial capital famed for classic Buddhist temples, wooden villas, gardens, and…',
    image: kyotoImg,
    tags: ['Cultural', '12 Days Ideal'],
    filters: ['culture', 'foodie', 'weekend'],
    rating: 4.9,
    ratingCount: '1.2k',
    status: 'High Demand',
    dailyAvg: 145,
    idealDays: 12,
    trending: true,
  },
  {
    id: 'amalfi-coast',
    name: 'Amalfi Coast',
    country: 'Italy',
    region: 'Campania',
    description:
      'Vertical pastel villages, cliffside lemon groves, and scenic winding drives over azure…',
    image: amalfiImg,
    tags: ['Scenic', 'Coastline'],
    filters: ['beach', 'culture', 'foodie'],
    rating: 4.85,
    ratingCount: '890',
    status: 'Cruises Ready',
    dailyAvg: 230,
    idealDays: 8,
    trending: true,
  },
  {
    id: 'banff',
    name: 'Banff',
    country: 'Canada',
    region: 'Alberta',
    description:
      'Glacial lakes, pine wilderness, and rugged alpine peaks offering world-class trekking and…',
    image: banffImg,
    tags: ['Adventure', 'Nature'],
    filters: ['mountain', 'weekend'],
    rating: 4.92,
    ratingCount: '2.1k',
    status: 'Peak Season',
    dailyAvg: 175,
    idealDays: 6,
    trending: true,
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    region: 'Lisboa',
    description:
      'Sunlit hills of azulejo tiles, tram rides, riverside cafés, and Atlantic day trips…',
    image: lisbonImg,
    tags: ['Urban', 'Historic'],
    filters: ['culture', 'budget', 'foodie', 'weekend'],
    rating: 4.78,
    ratingCount: '1.5k',
    status: 'Value Pick',
    dailyAvg: 110,
    idealDays: 5,
    trending: true,
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    region: 'England',
    description:
      'Royal parks, world-class museums, riverside walks, and neighborhoods packed with food…',
    image:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    tags: ['Urban', 'Culture'],
    filters: ['culture', 'foodie'],
    rating: 4.7,
    ratingCount: '3.4k',
    status: 'Always On',
    dailyAvg: 195,
    idealDays: 7,
    trending: false,
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    region: 'Île-de-France',
    description:
      'Café terraces, museum corridors, riverside evenings, and neighborhoods made for wandering…',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    tags: ['Romantic', 'Culture'],
    filters: ['culture', 'foodie', 'weekend'],
    rating: 4.88,
    ratingCount: '4.1k',
    status: 'High Demand',
    dailyAvg: 210,
    idealDays: 6,
    trending: true,
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Dubai',
    description:
      'Futuristic skyline, desert dunes, marina evenings, and high-energy shopping districts…',
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    tags: ['Modern', 'Luxury'],
    filters: ['beach', 'foodie'],
    rating: 4.65,
    ratingCount: '2.8k',
    status: 'Hot Deal',
    dailyAvg: 240,
    idealDays: 5,
    trending: false,
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    country: 'Turkey',
    region: 'Marmara',
    description:
      'Mosques, bazaars, Bosphorus ferries, and a crossroads of continents in every street…',
    image:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
    tags: ['Historic', 'Foodie'],
    filters: ['culture', 'budget', 'foodie'],
    rating: 4.8,
    ratingCount: '1.9k',
    status: 'Rising',
    dailyAvg: 95,
    idealDays: 6,
    trending: true,
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    region: 'Kanto',
    description:
      'Neon alleys, serene shrines, Michelin density, and rail networks that feel like magic…',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    tags: ['Urban', 'Foodie'],
    filters: ['culture', 'foodie'],
    rating: 4.93,
    ratingCount: '5.2k',
    status: 'High Demand',
    dailyAvg: 185,
    idealDays: 8,
    trending: true,
  },
  {
    id: 'lahore',
    name: 'Lahore',
    country: 'Pakistan',
    region: 'Punjab',
    description:
      'Mughal forts, food streets, verdant gardens, and warm hospitality in every bazaar lane…',
    image:
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    tags: ['Cultural', 'Foodie'],
    filters: ['culture', 'budget', 'foodie'],
    rating: 4.72,
    ratingCount: '640',
    status: 'Hidden Gem',
    dailyAvg: 55,
    idealDays: 4,
    trending: false,
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    region: 'New York',
    description:
      'Skyline views, borough hopping, museum marathons, and neighborhoods that never sleep…',
    image:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    tags: ['Urban', 'Nightlife'],
    filters: ['culture', 'foodie', 'weekend'],
    rating: 4.75,
    ratingCount: '6.0k',
    status: 'Always On',
    dailyAvg: 265,
    idealDays: 5,
    trending: false,
  },
]

export const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'beach', label: 'Beach' },
  { id: 'mountain', label: 'Mountain' },
  { id: 'culture', label: 'Culture' },
  { id: 'budget', label: 'Budget Friendly' },
  { id: 'weekend', label: 'Weekend Escapes' },
  { id: 'foodie', label: 'Foodie' },
]

export const SPOTLIGHT = {
  badge: 'SPOTLIGHT CURATED',
  season: 'Autumn Foliage Season',
  match: '94% Match',
  title: 'East Asian Temple Trails & Alpine Sanctuaries',
  description:
    'Explore century-old cedar shrines, meditative bamboo groves, and high-speed rail routing tailored for deep cultural immersion.',
  costRange: '$1,850 - $2,400',
  idealWindow: '12 - 14 Days',
  cta: 'View Itinerary Map',
  destinationId: 'kyoto',
}

export const DISCOVERY_TIPS = [
  {
    id: 'currency',
    title: 'Auto-Currency Hedge',
    body: 'JPY rate is currently at multi-month favorable lows against USD. Great timing for accommodation locks.',
    tone: 'accent',
  },
  {
    id: 'rail',
    title: 'Smart Rail Optimizer',
    body: 'Automate Shinkansen and regional transit passes directly into your offline mobile boarding pass.',
    tone: 'teal',
  },
  {
    id: 'sync',
    title: 'Co-Planner Sync',
    body: 'Share live voting links with your travel group to finalize day-by-day restaurant bookings effortlessly.',
    tone: 'warm',
  },
]
