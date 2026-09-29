import { useEffect, useRef } from 'react'
import { isAbortError } from '../services/http.js'
import { enrichSavedPlaces } from '../services/savedPlacesService.js'
import {
  needsPlaceDetails,
  needsPlaceImage,
} from '../utils/savedPlaces.js'

/**
 * Fill missing address/coords/images for local saved places.
 * Does not rebuild the collection from Geoapify.
 */
export function useSavedPlaceEnrichment(savedPlaces, { patchSavedMany } = {}) {
  const patchManyRef = useRef(patchSavedMany)

  useEffect(() => {
    patchManyRef.current = patchSavedMany
  }, [patchSavedMany])

  const placesKey = (savedPlaces || [])
    .map(
      (p) =>
        `${p.id}:${p.providerId || ''}:${p.imageUrl || p.image || ''}:${p.address || ''}:${p.latitude ?? ''}:${p.longitude ?? ''}`,
    )
    .join('|')

  useEffect(() => {
    const list = savedPlaces || []
    const needsWork = list.some(
      (place) => needsPlaceDetails(place) || needsPlaceImage(place),
    )
    if (!needsWork || typeof patchManyRef.current !== 'function') return undefined

    const controller = new AbortController()

    enrichSavedPlaces(list, { signal: controller.signal })
      .then((updates) => {
        if (!updates.length) return
        patchManyRef.current?.(updates)
      })
      .catch((error) => {
        if (isAbortError(error)) return
      })

    return () => controller.abort()
    // placesKey captures relevant field changes without depending on array identity alone
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesKey])
}
