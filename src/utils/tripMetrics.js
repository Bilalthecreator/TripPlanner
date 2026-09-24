/**
 * Derived trip metrics from application state — never hard-code UI percentages.
 */

function parseDate(value) {
  if (!value) return null
  const d = new Date(`${value}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function getTripLifecycleStatus(trip, now = new Date()) {
  if (trip?.lifecycle === 'draft' || (!trip?.startDate && !trip?.endDate)) {
    return 'draft'
  }

  const start = parseDate(trip.startDate)
  const end = parseDate(trip.endDate)
  const today = new Date(now)
  today.setHours(12, 0, 0, 0)

  if (end && end < today) return 'completed'
  if (start && start > today) return 'upcoming'
  if (start && end && start <= today && today <= end) return 'active'
  if (start && !end && start <= today) return 'active'
  if (start && start > today) return 'upcoming'
  return 'draft'
}

export function getTripProgress(trip) {
  const days = Array.isArray(trip?.days) ? trip.days : []
  const activities = days.flatMap((day) =>
    Array.isArray(day.activities) ? day.activities : [],
  )

  if (activities.length === 0) {
    const dayCount = days.length
    if (dayCount === 0) {
      return { percent: 0, completed: 0, total: 0, label: 'Not started' }
    }
    const plannedDays = days.filter(
      (day) => Array.isArray(day.activities) && day.activities.length > 0,
    ).length
    const percent = Math.round((plannedDays / dayCount) * 100)
    return {
      percent,
      completed: plannedDays,
      total: dayCount,
      label: plannedDays === 0 ? 'Not started' : `${plannedDays}/${dayCount} days planned`,
    }
  }

  const completed = activities.filter((a) => a.completed).length
  const total = activities.length
  const percent = Math.round((completed / total) * 100)

  return {
    percent,
    completed,
    total,
    label: `${completed}/${total} activities`,
  }
}

export function getTripSpent(trip) {
  const expenses = Array.isArray(trip?.expenses) ? trip.expenses : []
  const expenseTotal = expenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  )

  const activityCosts = (Array.isArray(trip?.days) ? trip.days : [])
    .flatMap((day) => (Array.isArray(day.activities) ? day.activities : []))
    .reduce((sum, activity) => sum + (Number(activity.cost) || 0), 0)

  // Prefer explicit expenses; fall back to activity costs when expenses are empty
  return expenses.length > 0 ? expenseTotal : activityCosts
}

export function getTripBudgetStatus(trip) {
  const total = Number(trip?.budget?.total) || 0
  const currency = trip?.budget?.currency || 'USD'
  const spent = getTripSpent(trip)
  const remaining = total - spent
  const ratio = total > 0 ? spent / total : 0

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

  if (ratio > 1) {
    tone = 'danger'
    label = 'Over budget'
  } else if (ratio >= 0.9) {
    tone = 'warn'
    label = 'Near limit'
  } else if (ratio >= 0.6) {
    tone = 'ok'
    label = 'On track'
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

export function formatTripDateRange(startDate, endDate) {
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  if (!start && !end) return 'Dates TBD'

  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  })

  if (start && end) {
    const sameYear = start.getFullYear() === end.getFullYear()
    const yearFmt = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: sameYear ? undefined : 'numeric',
    })
    const endFmt = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${yearFmt.format(start)} – ${endFmt.format(end)}`
  }

  return fmt.format(start || end)
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
