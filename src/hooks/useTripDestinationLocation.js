import { useAsyncResource } from './useAsyncResource.js'
import { resolveDestination } from '../services/destinationService.js'
import {
  hasValidCoords,
  withDestinationCoords,
} from '../data/destinationCoords.js'

/**
 * Ensures a trip destination has latitude/longitude for weather & maps.
 * Prefer embedded coords, then catalog fallbacks, then Geoapify resolve by id.
 */
export function useTripDestinationLocation(destination) {
  const seeded = withDestinationCoords(destination)
  const needsResolve = Boolean(destination?.id) && !hasValidCoords(seeded)

  const resolved = useAsyncResource(
    (signal) => resolveDestination(destination.id, { signal }),
    [destination?.id],
    { enabled: needsResolve },
  )

  if (hasValidCoords(seeded)) {
    return {
      destination: seeded,
      status: 'ready',
      error: null,
      retry: resolved.retry,
    }
  }

  if (!destination?.id) {
    return {
      destination: destination || null,
      status: 'unavailable',
      error: null,
      retry: resolved.retry,
    }
  }

  if (resolved.status === 'loading' || resolved.status === 'idle') {
    return {
      destination: seeded,
      status: 'loading',
      error: null,
      retry: resolved.retry,
    }
  }

  if (resolved.status === 'error' || !hasValidCoords(resolved.data)) {
    return {
      destination: seeded,
      status: 'error',
      error: resolved.error,
      retry: resolved.retry,
    }
  }

  return {
    destination: {
      ...seeded,
      ...resolved.data,
      id: destination.id,
      name: destination.name || resolved.data.name,
      country: destination.country || resolved.data.country,
      image: destination.image || resolved.data.image,
    },
    status: 'ready',
    error: null,
    retry: resolved.retry,
  }
}
