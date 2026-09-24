import { TripCard } from './TripCard.jsx'
import { TripsEmptyState } from './TripsEmptyState.jsx'
import { TripsErrorState } from './TripsErrorState.jsx'
import { TripsSkeleton } from './TripsSkeleton.jsx'

export function TripGrid({
  trips,
  status,
  error,
  onRetry,
  hasQuery,
  hasFilter,
  onClearFilters,
  onRestoreSeed,
  previewingEmpty,
}) {
  if (status === 'loading' || status === 'idle') {
    return <TripsSkeleton />
  }

  if (status === 'error') {
    return <TripsErrorState error={error} onRetry={onRetry} />
  }

  if (status === 'empty' || trips.length === 0) {
    if (hasQuery || hasFilter) {
      return (
        <TripsEmptyState
          title="No matching trips"
          message="Try another destination or trip name, or reset filters to see everything."
          showCreate={false}
          onClearFilters={onClearFilters}
        />
      )
    }

    return (
      <TripsEmptyState
        title="No trips yet"
        message="Your travel board is empty. Create a trip to start building itineraries, budgets, and day plans."
        showCreate
        onClearFilters={previewingEmpty ? onRestoreSeed : undefined}
        clearLabel="Restore sample trips"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  )
}
