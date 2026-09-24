/**
 * Dashboard values derived from live trip state — never hard-code SRS examples.
 */

import {
  formatMoney,
  formatTripDateRange,
  getTripActivities,
  getTripBudgetStatus,
  getTripDurationDays,
  getTripSpent,
} from './tripMetrics.js'
import { sortActivities } from './tripHelpers.js'

function parseDate(value) {
  if (!value) return null
  const d = new Date(`${value}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function getDayActivityCost(day) {
  return (day?.activities || []).reduce(
    (sum, a) => sum + (Number(a.cost) || 0),
    0,
  )
}

export function getWorkspaceStats(trip, { selectedDayId, now = new Date() } = {}) {
  const days = trip?.days || []
  const activities = getTripActivities(trip)
  const completed = activities.filter((a) => a.completed).length
  const total = activities.length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  const duration = getTripDurationDays(trip)
  const budget = getTripBudgetStatus(trip)
  const spent = getTripSpent(trip)

  const today = new Date(now)
  today.setHours(12, 0, 0, 0)

  let selectedIndex = days.findIndex((d) => d.id === selectedDayId)
  if (selectedIndex < 0) {
    selectedIndex = days.findIndex((d) => {
      const date = parseDate(d.date)
      return date && date.toDateString() === today.toDateString()
    })
  }
  if (selectedIndex < 0) selectedIndex = 0

  const selectedDay = days[selectedIndex] || null
  const todayActivities = selectedDay?.activities || []
  const scheduledToday = todayActivities.filter(
    (a) => a.scheduled || a.startTime,
  ).length

  const upcoming = sortActivities(
    activities.filter((a) => !a.completed && a.startTime),
  )

  const nextActivity = (() => {
    if (!selectedDay) return upcoming[0] || null
    const open = sortActivities(
      (selectedDay.activities || []).filter((a) => !a.completed),
    )
    return open[0] || upcoming[0] || null
  })()

  return {
    duration,
    dayNumber: selectedIndex + 1,
    dayCount: days.length || duration,
    selectedDay,
    selectedIndex,
    focusTitle: selectedDay?.title || trip?.destination?.name || 'Trip day',
    completed,
    total,
    percent,
    scheduledToday,
    dateRangeLabel: formatTripDateRange(trip?.startDate, trip?.endDate),
    budget,
    spentLabel: formatMoney(spent, budget.currency),
    capLabel: formatMoney(budget.total, budget.currency),
    nextActivity,
    upcoming: upcoming.slice(0, 5),
  }
}

export function formatDuration(minutes) {
  const m = Number(minutes) || 0
  if (m <= 0) return null
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem ? `${h}h ${rem}m` : `${h}h`
}
