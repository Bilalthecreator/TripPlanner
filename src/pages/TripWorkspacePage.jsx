import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTrips } from '../store/useTrips.js'
import { useAsyncResource } from '../hooks/useAsyncResource.js'
import { tripService } from '../services/tripService.js'
import { getWorkspaceStats } from '../utils/workspaceStats.js'
import { EmptyState, ErrorState } from '../components/common/StatusBlocks.jsx'
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx'
import { WorkspaceHeader } from '../components/workspace/WorkspaceHeader.jsx'
import {
  TripOverview,
  UpcomingActivities,
} from '../components/workspace/TripOverview.jsx'
import { TripCreationForm } from '../components/workspace/TripCreationForm.jsx'
import { ItineraryBuilder } from '../components/workspace/ItineraryBuilder.jsx'
import { WorkspaceSkeleton } from '../components/workspace/WorkspaceSkeleton.jsx'

function tabFromPath(pathname, search) {
  const params = new URLSearchParams(search)
  const tabParam = params.get('tab')
  if (
    tabParam === 'overview' ||
    tabParam === 'settings' ||
    tabParam === 'itinerary'
  ) {
    return tabParam
  }
  if (pathname.endsWith('/itinerary')) return 'itinerary'
  if (pathname.endsWith('/new')) return 'create'
  return 'overview'
}

export function TripWorkspacePage({ mode = 'workspace' }) {
  return (
    <ErrorBoundary>
      <TripWorkspaceInner mode={mode} />
    </ErrorBoundary>
  )
}

function TripWorkspaceInner({ mode }) {
  const { tripId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const tripsApi = useTrips()
  const isCreate = mode === 'create' || location.pathname.endsWith('/new')
  const activeTab = tabFromPath(location.pathname, location.search)
  const [editingBasics, setEditingBasics] = useState(false)

  const load = useAsyncResource(
    async (signal) => {
      if (isCreate) return { mode: 'create' }
      return tripService.getTrip(tripId, { signal })
    },
    [tripId, isCreate],
    { enabled: isCreate || Boolean(tripId) },
  )

  const liveTrip = isCreate ? null : tripsApi.getTrip(tripId)

  const handleTabChange = (tabId) => {
    setEditingBasics(false)
    if (!tripId) return
    if (tabId === 'itinerary') {
      navigate(`/trips/${tripId}/itinerary`, { replace: true })
    } else if (tabId === 'overview') {
      navigate(`/trips/${tripId}`, { replace: true })
    } else {
      navigate(`/trips/${tripId}?tab=settings`, { replace: true })
    }
  }

  if (isCreate) {
    return (
      <TripCreationForm
        onCancel={() => navigate('/trips')}
        onSubmit={(basics) => {
          const trip = tripsApi.createTrip(basics)
          navigate(`/trips/${trip.id}/itinerary`, { replace: true })
        }}
      />
    )
  }

  if (!tripId) {
    return (
      <EmptyState
        title="Trip not found"
        message="This workspace link is missing a trip id."
        actionLabel="Back to Trips"
        onAction={() => navigate('/trips')}
      />
    )
  }

  if (load.status === 'loading' || load.status === 'idle') {
    return <WorkspaceSkeleton />
  }

  if (load.status === 'error' && load.error?.code === 'NOT_FOUND' && !liveTrip) {
    return (
      <EmptyState
        title="Trip not found"
        message="This trip may have been deleted or the link is incorrect."
        actionLabel="Back to Trips"
        onAction={() => navigate('/trips')}
      />
    )
  }

  if (load.status === 'error' && !liveTrip) {
    return (
      <ErrorState
        title="Couldn't open this trip"
        message={load.error?.message}
        onRetry={load.retry}
      />
    )
  }

  const trip = liveTrip
  if (!trip) {
    return (
      <EmptyState
        title="Trip not found"
        message="This trip is no longer in your local trip store."
        actionLabel="Back to Trips"
        onAction={() => navigate('/trips')}
      />
    )
  }

  const stats = getWorkspaceStats(trip)
  const showSettings = editingBasics || activeTab === 'settings'

  if (showSettings) {
    return (
      <div className="flex flex-col gap-6">
        <WorkspaceHeader
          trip={trip}
          activeTab="settings"
          onTabChange={handleTabChange}
          onEditBasics={() => setEditingBasics(true)}
        />
        <TripCreationForm
          key={trip.updatedAt || trip.id}
          title="Trip Settings"
          description="Update the shared trip basics. Date changes regenerate missing days while keeping existing day plans."
          submitLabel="Save changes"
          initialValues={{
            name: trip.name,
            destination: trip.destination?.name || '',
            country: trip.destination?.country || '',
            startDate: trip.startDate || '',
            endDate: trip.endDate || '',
            travelers: trip.travelers || 1,
            budget: trip.budget?.total || 0,
            currency: trip.budget?.currency || 'USD',
          }}
          onCancel={() => {
            setEditingBasics(false)
            handleTabChange('overview')
          }}
          onSubmit={(basics) => {
            tripsApi.updateBasics(trip.id, basics)
            setEditingBasics(false)
            handleTabChange('overview')
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <WorkspaceHeader
        trip={trip}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onEditBasics={() => {
          setEditingBasics(true)
          navigate(`/trips/${tripId}?tab=settings`, { replace: true })
        }}
      />

      {activeTab === 'overview' ? (
        <div className="flex flex-col gap-6">
          <TripOverview stats={stats} />
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-3xl bg-rw-surface p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-rw-ink">
                  Itinerary snapshot
                </h2>
                <button
                  type="button"
                  onClick={() => handleTabChange('itinerary')}
                  className="text-[13px] font-semibold text-rw-accent"
                >
                  Open builder
                </button>
              </div>
              <p className="text-sm text-rw-muted">
                {stats.total} activities across {stats.dayCount} days ·{' '}
                {stats.completed} completed · {stats.percent}% done
              </p>
              <p className="mt-3 text-sm text-rw-muted">
                Focus day:{' '}
                <span className="font-semibold text-rw-ink">
                  {stats.focusTitle}
                </span>
              </p>
            </div>
            <div>
              <h2 className="mb-3 font-display text-lg font-semibold text-rw-ink">
                Upcoming
              </h2>
              <UpcomingActivities
                activities={stats.upcoming}
                currency={trip.budget?.currency}
              />
            </div>
          </section>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <TripOverview stats={stats} />
          <ItineraryBuilder trip={trip} tripsApi={tripsApi} />
        </div>
      )}
    </div>
  )
}

export function CreateTripPage() {
  return <TripWorkspacePage mode="create" />
}
