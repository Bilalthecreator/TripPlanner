import { SEED_TRIPS } from '../data/trips.js'
import { withDestinationCoords } from '../data/destinationCoords.js'

const STORAGE_KEY = 'roamwise.trips'
const SEEDED_FLAG = 'roamwise.trips.seeded'
const SEED_VERSION_KEY = 'roamwise.trips.seedVersion'
const SEED_VERSION = '3'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeRaw(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
}

function enrichMissingDestinationCoords(trips) {
  let changed = false
  const next = trips.map((trip) => {
    const destination = withDestinationCoords(trip.destination)
    if (destination === trip.destination) return trip
    changed = true
    return { ...trip, destination }
  })
  return changed ? next : trips
}

/**
 * Single source of truth for trip entities (list + future workspace/itinerary/budget).
 * Seed once, then persist all mutations in localStorage.
 */
export function ensureTripsSeeded() {
  const existing = readRaw()
  const seeded = localStorage.getItem(SEEDED_FLAG) === '1'
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY)

  if (existing && existing.length > 0) {
    if (!seeded) localStorage.setItem(SEEDED_FLAG, '1')
    const enriched = enrichMissingDestinationCoords(existing)
    if (enriched !== existing) {
      writeRaw(enriched)
    }
    if (storedVersion !== SEED_VERSION) {
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
    }
    return enriched
  }

  if (seeded && existing) {
    return enrichMissingDestinationCoords(existing)
  }

  const seed = enrichMissingDestinationCoords(clone(SEED_TRIPS))
  writeRaw(seed)
  localStorage.setItem(SEEDED_FLAG, '1')
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
  return seed
}

export function loadTrips() {
  return ensureTripsSeeded()
}

export function saveTrips(trips) {
  writeRaw(Array.isArray(trips) ? trips : [])
  return loadTrips()
}

export function getTripById(tripId) {
  return loadTrips().find((trip) => trip.id === tripId) ?? null
}

export function upsertTrip(trip) {
  const trips = loadTrips()
  const index = trips.findIndex((t) => t.id === trip.id)
  if (index === -1) trips.push(trip)
  else trips[index] = trip
  return saveTrips(trips)
}

export function removeTrip(tripId) {
  const next = loadTrips().filter((t) => t.id !== tripId)
  return saveTrips(next)
}

/** Testing helper — clears persistence so empty state can be previewed. */
export function clearTripsForPreview() {
  writeRaw([])
  localStorage.setItem(SEEDED_FLAG, '1')
  return []
}

/** Restore seed catalog (used after zero-state preview). */
export function restoreSeedTrips() {
  const seed = enrichMissingDestinationCoords(clone(SEED_TRIPS))
  writeRaw(seed)
  localStorage.setItem(SEEDED_FLAG, '1')
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
  return seed
}
