/** Pure helpers for trip / day / activity mutations. */

export function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function parseISODate(value) {
  if (!value) return null
  const d = new Date(`${value}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function eachDateInclusive(startDate, endDate) {
  const start = parseISODate(startDate)
  const end = parseISODate(endDate)
  if (!start || !end || end < start) return []

  const dates = []
  const cursor = new Date(start)
  while (cursor <= end) {
    dates.push(toISODate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function sortActivities(activities) {
  return [...(activities || [])].sort((a, b) => {
    const ta = a.startTime || '99:99'
    const tb = b.startTime || '99:99'
    if (ta !== tb) return ta.localeCompare(tb)
    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

export function buildDaysFromRange(startDate, endDate, existingDays = []) {
  const byDate = new Map(
    (existingDays || []).map((day) => [day.date, day]),
  )

  return eachDateInclusive(startDate, endDate).map((date, index) => {
    const existing = byDate.get(date)
    if (existing) return existing
    return {
      id: createId('day'),
      date,
      title: `Day ${index + 1}`,
      activities: [],
    }
  })
}

export function normalizeActivity(input = {}) {
  const startTime = input.startTime || null
  return {
    id: input.id || createId('act'),
    title: (input.title || '').trim(),
    startTime,
    endTime: input.endTime || null,
    durationMinutes: Number(input.durationMinutes) || 0,
    category: input.category || 'Sightseeing',
    notes: input.notes || '',
    placeId: input.placeId || null,
    placeName: input.placeName || '',
    cost: Number(input.cost) || 0,
    completed: Boolean(input.completed),
    scheduled:
      input.scheduled ?? Boolean(startTime || input.placeId || input.placeName),
    ticketRef: input.ticketRef || null,
  }
}

export function createEmptyTrip(basics) {
  const startDate = basics.startDate
  const endDate = basics.endDate
  const days = buildDaysFromRange(startDate, endDate)

  return {
    id: createId('trip'),
    name: basics.name.trim(),
    destination: {
      id: basics.destinationId || null,
      name: basics.destination.trim(),
      country: basics.country?.trim() || '',
      image: basics.coverImage || null,
    },
    destinations: [
      {
        name: basics.destination.trim(),
        country: basics.country?.trim() || '',
      },
    ],
    coverImage: basics.coverImage || null,
    startDate,
    endDate,
    travelers: Number(basics.travelers) || 1,
    budget: {
      currency: basics.currency || 'USD',
      total: Number(basics.budget) || 0,
    },
    lifecycle: 'draft',
    progressMode: 'itinerary',
    collaborators: [],
    primaryAction: 'continue',
    days,
    expenses: [],
    visibility: 'private',
    updatedAt: new Date().toISOString(),
  }
}

export function updateTripWithBasics(trip, basics) {
  const startDate = basics.startDate
  const endDate = basics.endDate
  const days = buildDaysFromRange(startDate, endDate, trip.days)

  return {
    ...trip,
    name: basics.name.trim(),
    destination: {
      ...trip.destination,
      name: basics.destination.trim(),
      country: basics.country?.trim() || trip.destination?.country || '',
    },
    destinations: [
      {
        name: basics.destination.trim(),
        country: basics.country?.trim() || trip.destination?.country || '',
      },
      ...(trip.destinations || []).slice(1),
    ],
    startDate,
    endDate,
    travelers: Number(basics.travelers) || 1,
    budget: {
      currency: basics.currency || trip.budget?.currency || 'USD',
      total: Number(basics.budget) || 0,
    },
    days,
    updatedAt: new Date().toISOString(),
  }
}

export function mapTrip(trips, tripId, mapper) {
  return trips.map((trip) => (trip.id === tripId ? mapper(trip) : trip))
}

export function mapDay(trip, dayId, mapper) {
  return {
    ...trip,
    days: (trip.days || []).map((day) =>
      day.id === dayId ? mapper(day) : day,
    ),
    updatedAt: new Date().toISOString(),
  }
}

export const ACTIVITY_CATEGORIES = [
  'Sightseeing',
  'Food & Dining',
  'Cultural',
  'Transit',
  'Relaxation',
]
