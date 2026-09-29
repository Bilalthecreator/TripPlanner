import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from './useDebouncedValue.js'
import { isAbortError } from '../services/http.js'
import {
  getDestinationCoordinates,
  getNearbyAttractions,
  searchGeocode,
} from '../services/geoapify/index.js'

/**
 * Validated Geoapify Places leaf categories per activity type.
 * Parent cats like tourism.sights/tourism.attraction return plaques/memorials.
 */
const CATEGORY_MAP = {
  Sightseeing:
    'heritage.unesco,tourism.sights.place_of_worship,tourism.sights.castle,tourism.sights.monastery,tourism.attraction.viewpoint,entertainment.museum',
  'Food & Dining': 'catering.restaurant,catering.cafe,catering.fast_food',
  Cultural:
    'heritage.unesco,entertainment.culture,tourism.sights.place_of_worship,tourism.sights.castle',
  Transit:
    'public_transport,public_transport.bus,public_transport.subway,public_transport.train,public_transport.tram',
  Relaxation: 'leisure.park,leisure.spa,natural.protected_area,beach',
}

const LANDMARK_CATEGORIES = new Set(['Sightseeing', 'Cultural'])

function toPlaceResult(item, fallbackCategory = 'Place') {
  if (!item?.name) return null
  return {
    id: item.id || item.placeId || `geo-${item.latitude}-${item.longitude}`,
    name: item.name,
    address: item.address || item.formattedAddress || item.location || '',
    location: item.location || item.formattedAddress || item.address || '',
    category: item.category || fallbackCategory,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    placeId: item.placeId || item.id || null,
    provider: item.provider || 'geoapify',
  }
}

/**
 * Debounced Places search near trip destination coordinates.
 * Resolves destination name → coords when lat/lon are missing (seed trips).
 * Empty query returns nearby places for the active category.
 * Typed queries also run biased geocode search so venue names match.
 */
export function usePlaceLookup({
  query,
  latitude,
  longitude,
  fallbackQuery = '',
  category = 'Sightseeing',
  enabled = true,
  limit = 8,
} = {}) {
  const debounced = useDebouncedValue(query, 320)
  const [status, setStatus] = useState('idle')
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    if (!enabled) {
      queueMicrotask(() => {
        if (requestId !== requestIdRef.current) return
        setResults([])
        setError(null)
        setStatus('idle')
      })
      return () => controller.abort()
    }

    const q = String(debounced || '').trim()
    // Require at least 2 chars for name filter, otherwise show nearby category places.
    if (q.length === 1) {
      queueMicrotask(() => {
        if (requestId !== requestIdRef.current) return
        setResults([])
        setStatus('idle')
      })
      return () => controller.abort()
    }

    queueMicrotask(() => {
      if (requestId !== requestIdRef.current) return
      setStatus('loading')
      setError(null)
    })

    const categories = CATEGORY_MAP[category] || CATEGORY_MAP.Sightseeing
    const rankMode = LANDMARK_CATEGORIES.has(category) ? 'landmark' : 'nearby'

    ;(async () => {
      try {
        let lat = Number(latitude)
        let lon = Number(longitude)

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          const lookup = String(fallbackQuery || '').trim()
          if (!lookup) {
            if (requestId !== requestIdRef.current) return
            setResults([])
            setStatus('idle')
            return
          }
          const resolved = await getDestinationCoordinates(lookup, {
            signal: controller.signal,
          })
          lat = Number(resolved?.latitude ?? resolved?.destination?.latitude)
          lon = Number(resolved?.longitude ?? resolved?.destination?.longitude)
          if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            if (requestId !== requestIdRef.current) return
            setResults([])
            setStatus('empty')
            return
          }
        }

        const nearbyPromise = getNearbyAttractions(lat, lon, {
          categories,
          radius: 15000,
          limit: q ? 40 : Math.max(limit * 2, 16),
          signal: controller.signal,
          rankMode,
        })

        const geocodePromise = q
          ? searchGeocode(q, {
              limit: Math.max(limit, 8),
              bias: { latitude: lat, longitude: lon },
              signal: controller.signal,
            }).catch((err) => {
              if (isAbortError(err)) throw err
              return []
            })
          : Promise.resolve([])

        const [nearby, geocoded] = await Promise.all([
          nearbyPromise,
          geocodePromise,
        ])

        if (requestId !== requestIdRef.current) return

        const fromNearby = (q
          ? nearby.filter((item) =>
              [item.name, item.address, item.location]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(q.toLowerCase()),
            )
          : nearby
        )
          .map((item) => toPlaceResult(item))
          .filter(Boolean)

        const fromGeocode = geocoded
          .map((item) =>
            toPlaceResult(
              {
                ...item,
                address: item.formattedAddress || item.description,
                location: item.formattedAddress || item.description,
                category: item.city || category,
              },
              category,
            ),
          )
          .filter(Boolean)

        const byId = new Map()
        for (const place of [...fromGeocode, ...fromNearby]) {
          const key = place.placeId || place.id || place.name.toLowerCase()
          if (!byId.has(key)) byId.set(key, place)
        }

        const sliced = [...byId.values()].slice(0, limit)
        setResults(sliced)
        setStatus(sliced.length ? 'success' : 'empty')
      } catch (err) {
        if (isAbortError(err) || requestId !== requestIdRef.current) return
        setError(err)
        setStatus('error')
        setResults([])
      }
    })()

    return () => controller.abort()
  }, [
    debounced,
    latitude,
    longitude,
    fallbackQuery,
    category,
    enabled,
    limit,
  ])

  return { status, results, error }
}

export { CATEGORY_MAP }
