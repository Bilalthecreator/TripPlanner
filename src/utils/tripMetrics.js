/**
 * Derived trip metrics from application state — never hard-code UI percentages.
 */

function parseDate(value) {
  if (!value) return null
  const d = new Date(`${value}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function getTripDurationDays(trip) {
  const start = parseDate(trip?.startDate)
  const end = parseDate(trip?.endDate)
  if (!start || !end) return trip?.durationDays ?? 0
  const ms = end.getTime() - start.getTime()
  if (ms < 0) return 0
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1
}

export function getTripLifecycleStatus(trip, now = new Date()) {
  // Explicit lifecycle wins so demo/seed cards match design states.
  if (trip?.lifecycle === 'draft') return 'draft'
  if (trip?.lifecycle === 'completed') return 'completed'
  if (trip?.lifecycle === 'upcoming') return 'upcoming'
  if (trip?.lifecycle === 'active' || trip?.lifecycle === 'ongoing') {
    return 'active'
  }

  const start = parseDate(trip?.startDate)
  const end = parseDate(trip?.endDate)
  const today = new Date(now)
  today.setHours(12, 0, 0, 0)

  if (!start && !end) return 'draft'
  if (end && end < today) return 'completed'
  if (start && start > today) return 'upcoming'
  if (start && end && start <= today && today <= end) return 'active'
  if (start && !end && start <= today) return 'active'
  return 'draft'
}

export function getStatusLabel(status) {
  switch (status) {
    case 'upcoming':
      return 'Upcoming'
    case 'active':
      return 'Ongoing'
    case 'draft':
      return 'Drafting'
    case 'completed':
      return 'Completed'
    default:
      return 'Trip'
  }
}

/** Collect every activity across trip days. */
export function getTripActivities(trip) {
  const days = Array.isArray(trip?.days) ? trip.days : []
  return days.flatMap((day) =>
    Array.isArray(day.activities) ? day.activities : [],
  )
}

/**
 * Itinerary progress: scheduled activities / total activities.
 * An activity counts as scheduled when it has a time, place, or is marked scheduled/completed.
 */
export function getItineraryProgress(trip) {
  const activities = getTripActivities(trip)
  const total = activities.length

  if (total === 0) {
    return {
      percent: 0,
      scheduled: 0,
      total: 0,
      label: '0 of 0 activities scheduled (0%)',
    }
  }

  const scheduled = activities.filter(
    (a) =>
      a.completed ||
      a.scheduled === true ||
      Boolean(a.startTime) ||
      Boolean(a.placeId),
  ).length

  const percent = Math.round((scheduled / total) * 100)

  return {
    percent,
    scheduled,
    total,
    label: `${scheduled} of ${total} activities scheduled (${percent}%)`,
  }
}

/**
 * Packing / readiness checklist progress from trip.readiness items.
 */
export function getReadinessProgress(trip) {
  const items = Array.isArray(trip?.readiness) ? trip.readiness : []
  const total = items.length

  if (total === 0) {
    return { percent: 0, done: 0, total: 0, label: '0% Ready' }
  }

  const done = items.filter((item) => item.done).length
  const percent = Math.round((done / total) * 100)

  return {
    percent,
    done,
    total,
    label: `${percent}% Ready`,
  }
}

export function getTripProgress(trip) {
  const status = getTripLifecycleStatus(trip)
  if (status === 'completed') {
    return {
      mode: 'completed',
      percent: 100,
      label: 'Archived into memory vault.',
    }
  }

  if (trip?.progressMode === 'readiness') {
    const readiness = getReadinessProgress(trip)
    return {
      mode: 'readiness',
      ...readiness,
      title: 'Readiness Index',
    }
  }

  const itinerary = getItineraryProgress(trip)
  return {
    mode: 'itinerary',
    ...itinerary,
    title: 'Itinerary Progress',
  }
}

export function getTripSpent(trip) {
  const expenses = Array.isArray(trip?.expenses) ? trip.expenses : []
  if (expenses.length > 0) {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  }

  return getTripActivities(trip).reduce(
    (sum, activity) => sum + (Number(activity.cost) || 0),
    0,
  )
}

export function getTripBudgetStatus(trip) {
  const total = Number(trip?.budget?.total) || 0
  const currency = trip?.budget?.currency || 'USD'
  const spent = getTripSpent(trip)
  const remaining = total - spent
  const ratio = total > 0 ? spent / total : 0
  const status = getTripLifecycleStatus(trip)

  let tone = 'neutral'
  let label = 'No budget set'

  if (total <= 0) {
    return {
      tone,
      label,
      spent,
      total,
      remaining: 0,
      currency,
      percentUsed: 0,
    }
  }

  if (status === 'completed') {
    tone = 'final'
    label = 'Final Total'
  } else if (ratio > 1) {
    tone = 'danger'
    label = 'Over budget'
  } else if (ratio >= 0.9) {
    tone = 'warn'
    label = 'Near limit'
  } else if (ratio >= 0.55) {
    tone = 'ok'
    label = 'On Track'
  } else {
    tone = 'good'
    label = 'Under budget'
  }

  return {
    tone,
    label,
    spent,
    total,
    remaining,
    currency,
    percentUsed: Math.min(100, Math.round(ratio * 100)),
  }
}

export function formatTripDateRange(startDate, endDate, { uppercase = false } = {}) {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  if (!start && !end) return 'Dates TBD'

  if (start && end) {
    const startFmt = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const endFmt = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const text = `${startFmt.format(start)} - ${endFmt.format(end)}`
    return uppercase ? text.toUpperCase() : text
  }

  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const text = fmt.format(start || end)
  return uppercase ? text.toUpperCase() : text
}

export function formatMoney(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  } catch {
    return `$${Math.round(amount || 0)}`
  }
}

/** Aggregate stats for the Trips overview strip. */
export function getTripsOverviewStats(trips) {
  const list = Array.isArray(trips) ? trips : []
  let daysOnRoad = 0
  const countries = new Set()
  let year = new Date().getFullYear()

  for (const trip of list) {
    daysOnRoad += getTripDurationDays(trip)
    const country = trip?.destination?.country
    if (country) countries.add(country)
    if (Array.isArray(trip?.destinations)) {
      for (const d of trip.destinations) {
        if (d.country) countries.add(d.country)
      }
    }
  }

  const years = list
    .map((t) => Number(String(t?.startDate || '').slice(0, 4)))
    .filter(Boolean)
  if (years.length) year = Math.max(...years)

  return {
    year,
    daysOnRoad,
    countries: countries.size,
    templates: list.length,
  }
}
