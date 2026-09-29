import { Navigate } from 'react-router-dom'
import { useTrips } from '../store/useTrips.js'

/**
 * Nav targets for trip-scoped pages.
 * With no open trip id in the URL, land on Trips (or the most recently updated trip).
 */
function pickRecentTrip(trips) {
  if (!Array.isArray(trips) || !trips.length) return null
  return [...trips].sort((a, b) => {
    const aTime = Date.parse(a.updatedAt || a.createdAt || a.startDate || 0) || 0
    const bTime = Date.parse(b.updatedAt || b.createdAt || b.startDate || 0) || 0
    return bTime - aTime
  })[0]
}

export function WorkspaceNavRedirect() {
  const { trips } = useTrips()
  const recent = pickRecentTrip(trips)
  if (recent?.id) return <Navigate to={`/trips/${recent.id}`} replace />
  return <Navigate to="/trips" replace />
}

export function BudgetNavRedirect() {
  const { trips } = useTrips()
  const recent = pickRecentTrip(trips)
  if (recent?.id) return <Navigate to={`/trips/${recent.id}/budget`} replace />
  return <Navigate to="/trips" replace />
}
