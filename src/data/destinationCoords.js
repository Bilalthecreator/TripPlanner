/** Stable coordinates for catalog destination IDs (Open-Meteo / maps). */
export const DESTINATION_COORDS = {
  kyoto: { latitude: 35.0116, longitude: 135.7681 },
  'amalfi-coast': { latitude: 40.634, longitude: 14.6026 },
  banff: { latitude: 51.1784, longitude: -115.5708 },
  lisbon: { latitude: 38.7223, longitude: -9.1393 },
  london: { latitude: 51.5074, longitude: -0.1278 },
  paris: { latitude: 48.8566, longitude: 2.3522 },
  dubai: { latitude: 25.2048, longitude: 55.2708 },
  istanbul: { latitude: 41.0082, longitude: 28.9784 },
  tokyo: { latitude: 35.6762, longitude: 139.6503 },
  lahore: { latitude: 31.5204, longitude: 74.3587 },
  islamabad: { latitude: 33.6844, longitude: 73.0479 },
  'new-york': { latitude: 40.7128, longitude: -74.006 },
}

export function coordsForDestinationId(destinationId) {
  const id = String(destinationId || '').trim()
  return DESTINATION_COORDS[id] || null
}

export function hasValidCoords(place) {
  return (
    Number.isFinite(Number(place?.latitude)) &&
    Number.isFinite(Number(place?.longitude))
  )
}

/** Merge catalog coords onto a trip destination when lat/lon are missing. */
export function withDestinationCoords(destination) {
  if (!destination || hasValidCoords(destination)) return destination
  const coords = coordsForDestinationId(destination.id)
  if (!coords) return destination
  return { ...destination, ...coords }
}
