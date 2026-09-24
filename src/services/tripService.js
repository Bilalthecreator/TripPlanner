import { TRIP_FILTERS } from '../data/trips.js'
import { delay, maybeFail, MockRequestError } from './http.js'
import { MOCK_DELAY_MS } from './mockConfig.js'
import {
  clearTripsForPreview,
  getTripById,
  loadTrips,
  restoreSeedTrips,
} from './tripsRepository.js'
import { getTripLifecycleStatus } from '../utils/tripMetrics.js'

function matchesQuery(trip, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    trip.name,
    trip.destination?.name,
    trip.destination?.country,
    ...(Array.isArray(trip.destinations)
      ? trip.destinations.flatMap((d) => [d.name, d.country])
      : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

function matchesFilter(trip, filterId) {
  if (!filterId || filterId === 'all') return true
  const status = getTripLifecycleStatus(trip)

  if (filterId === 'upcoming') return status === 'upcoming'
  if (filterId === 'completed') return status === 'completed'
  if (filterId === 'ongoing') return status === 'active' || status === 'draft'
  return true
}

async function run(signal, delayMs, factory) {
  await delay(delayMs, signal)
  maybeFail()
  return factory()
}

/**
 * Promise-based trip service. Swap internals for a real API later;
 * callers should keep depending on this facade.
 */
export const tripService = {
  getFilters() {
    return TRIP_FILTERS
  },

  async listTrips(
    { query = '', filter = 'all' } = {},
    { signal, delayMs = MOCK_DELAY_MS } = {},
  ) {
    return run(signal, delayMs, () => {
      const all = loadTrips()
      const results = all.filter(
        (trip) => matchesQuery(trip, query) && matchesFilter(trip, filter),
      )

      return {
        query,
        filter,
        results,
        total: results.length,
        allCount: all.length,
      }
    })
  },

  async getTrip(tripId, { signal, delayMs = MOCK_DELAY_MS } = {}) {
    return run(signal, delayMs, () => {
      const trip = getTripById(tripId)
      if (!trip) {
        const error = new MockRequestError('Trip not found.')
        error.code = 'NOT_FOUND'
        throw error
      }
      return trip
    })
  },

  async previewEmpty({ signal, delayMs = 200 } = {}) {
    return run(signal, delayMs, () => clearTripsForPreview())
  },

  async restoreSeed({ signal, delayMs = 200 } = {}) {
    return run(signal, delayMs, () => restoreSeedTrips())
  },
}
