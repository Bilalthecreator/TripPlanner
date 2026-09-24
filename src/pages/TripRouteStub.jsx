import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAsyncResource } from '../hooks/useAsyncResource.js'
import { tripService } from '../services/tripService.js'
import { EmptyState, ErrorState, SkeletonBlock } from '../components/common/StatusBlocks.jsx'

/**
 * Lightweight stub for /trips/:tripId and related routes.
 * Validates the trip id against the shared trip store; does not implement workspace UI.
 */
export function TripRouteStub({ title = 'Trip Workspace' }) {
  const navigate = useNavigate()
  const { tripId } = useParams()
  const { status, data, error, retry } = useAsyncResource(
    (signal) => tripService.getTrip(tripId, { signal }),
    [tripId],
    { enabled: Boolean(tripId) },
  )

  if (!tripId) {
    return (
      <EmptyState
        title="Trip not found"
        message="This trip link is missing an id. Head back to your trips list to pick one."
        actionLabel="Back to Trips"
        onAction={() => navigate('/trips')}
      />
    )
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="space-y-4 rounded-3xl bg-rw-surface p-6 shadow-sm">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-full max-w-lg" />
        <SkeletonBlock className="h-32 w-full" />
      </div>
    )
  }

  if (status === 'error' && error?.code === 'NOT_FOUND') {
    return (
      <EmptyState
        title="Trip not found"
        message="This trip may have been deleted or the link is incorrect. Choose another trip from your list."
        actionLabel="Back to Trips"
        onAction={() => navigate('/trips')}
      />
    )
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Couldn't open this trip"
        message={error?.message}
        onRetry={retry}
      />
    )
  }

  return (
    <div className="rounded-3xl bg-rw-surface p-8 text-center shadow-sm">
      <p className="text-[11px] font-bold tracking-[0.55px] text-rw-accent uppercase">
        {title}
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-rw-ink">
        {data.name}
      </h1>
      <p className="mt-2 text-sm text-rw-muted">
        Trip workspace screens ship in a later milestone. Your trip data is already
        saved and ready.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          to="/trips"
          className="inline-flex rounded-full bg-rw-accent px-5 py-2 text-[13px] font-semibold text-white"
        >
          Back to Trips
        </Link>
        <Link
          to={`/trips/${tripId}/itinerary`}
          className="inline-flex rounded-full border border-rw-divider px-5 py-2 text-[13px] font-semibold text-rw-ink"
        >
          Itinerary
        </Link>
        <Link
          to={`/trips/${tripId}/budget`}
          className="inline-flex rounded-full border border-rw-divider px-5 py-2 text-[13px] font-semibold text-rw-ink"
        >
          Budget
        </Link>
      </div>
    </div>
  )
}

export function CreateTripStub() {
  return (
    <div className="rounded-3xl bg-rw-surface p-8 text-center shadow-sm">
      <h1 className="font-display text-2xl font-semibold text-rw-ink">
        Create New Trip
      </h1>
      <p className="mt-2 text-sm text-rw-muted">
        The creation form ships in a later milestone. Your trips list and shared
        trip store are ready for it.
      </p>
      <Link
        to="/trips"
        className="mt-6 inline-flex rounded-full bg-rw-accent px-5 py-2 text-[13px] font-semibold text-white"
      >
        Back to Trips
      </Link>
    </div>
  )
}
