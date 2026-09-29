/**
 * In-memory registry of destinations discovered on the Home page.
 * Keeps stable id → coordinates/meta for weather, attractions, and navigation.
 */

const byId = new Map()

export function registerDestination(destination) {
  if (!destination?.id) return destination
  const prev = byId.get(destination.id) || {}
  const next = {
    ...prev,
    ...destination,
    latitude: destination.latitude ?? prev.latitude ?? null,
    longitude: destination.longitude ?? prev.longitude ?? null,
    image: destination.image ?? prev.image ?? null,
    imageAttribution:
      destination.imageAttribution ?? prev.imageAttribution ?? null,
  }
  byId.set(destination.id, next)
  return next
}

export function registerDestinations(list = []) {
  return list.map(registerDestination)
}

export function getRegisteredDestination(id) {
  if (!id) return null
  return byId.get(id) || null
}

export function clearDestinationRegistry() {
  byId.clear()
}
