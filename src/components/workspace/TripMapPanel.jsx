import { useState } from 'react'
import { useAsyncResource } from '../../hooks/useAsyncResource.js'
import { getRoute } from '../../services/geoapify/index.js'
import { GeoapifyMap } from '../destination/GeoapifyMap.jsx'
import { EmptyState, ErrorState, SkeletonBlock } from '../common/StatusBlocks.jsx'

function collectActivityPoints(trip) {
  const points = []
  for (const day of trip?.days || []) {
    for (const activity of day.activities || []) {
      if (
        Number.isFinite(Number(activity.latitude)) &&
        Number.isFinite(Number(activity.longitude))
      ) {
        points.push({
          id: activity.id,
          name: activity.title || activity.placeName || 'Activity',
          latitude: Number(activity.latitude),
          longitude: Number(activity.longitude),
          type: 'attraction',
          dayId: day.id,
        })
      }
    }
  }
  return points
}

/**
 * Trip map enrichment — destination + activity markers + optional walking route.
 */
export function TripMapPanel({ trip, selectedActivityId = null }) {
  const destination = trip?.destination
  const lat = Number(destination?.latitude)
  const lon = Number(destination?.longitude)
  const hasDestination = Number.isFinite(lat) && Number.isFinite(lon)
  const [showRoute, setShowRoute] = useState(true)

  const activityPoints = collectActivityPoints(trip)

  const markers = []
  if (hasDestination) {
    markers.push({
      id: `dest-${trip.id}`,
      name: destination.name || 'Destination',
      latitude: lat,
      longitude: lon,
      type: 'destination',
    })
  }
  for (const point of activityPoints) {
    markers.push({
      ...point,
      type: point.id === selectedActivityId ? 'destination' : point.type,
      tone: point.id === selectedActivityId ? 'accent' : 'teal',
    })
  }

  let routeWaypoints = []
  if (showRoute) {
    if (activityPoints.length >= 2) {
      routeWaypoints = activityPoints.slice(0, 8)
    } else if (hasDestination && activityPoints.length === 1) {
      routeWaypoints = [
        { latitude: lat, longitude: lon, name: destination.name },
        activityPoints[0],
      ]
    }
  }

  const routeKey = routeWaypoints
    .map((p) => `${p.latitude},${p.longitude}`)
    .join('|')

  const route = useAsyncResource(
    (signal) => getRoute(routeWaypoints, { mode: 'walk', signal }),
    [routeKey, showRoute],
    { enabled: showRoute && routeWaypoints.length >= 2 },
  )

  if (!hasDestination && activityPoints.length === 0) {
    return (
      <EmptyState
        className="min-h-[280px]"
        title="Map unavailable"
        message="Pick a geocoded destination or add place-based activities to see the map."
      />
    )
  }

  const centerLat = hasDestination ? lat : activityPoints[0].latitude
  const centerLon = hasDestination ? lon : activityPoints[0].longitude

  return (
    <article className="relative z-0 isolate overflow-hidden rounded-2xl bg-rw-surface shadow-sm">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
            Trip Map
          </p>
          <p className="text-sm text-rw-ink">
            {destination?.name || 'Activities'} · {markers.length} markers
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-[12px] text-rw-muted">
          <input
            type="checkbox"
            checked={showRoute}
            onChange={(e) => setShowRoute(e.target.checked)}
            className="accent-[var(--color-rw-accent)]"
          />
          Walking route
        </label>
      </div>

      <div className="relative h-72 bg-rw-surface-muted">
        <GeoapifyMap
          latitude={centerLat}
          longitude={centerLon}
          markers={markers}
          routeGeometry={
            showRoute && route.status === 'success' ? route.data?.geometry : null
          }
          className="h-72 w-full"
        />
        {showRoute && route.status === 'loading' ? (
          <div className="pointer-events-none absolute inset-x-3 bottom-3">
            <SkeletonBlock className="h-8 rounded-full" />
          </div>
        ) : null}
      </div>

      <div className="space-y-2 px-4 py-3">
        {showRoute && route.status === 'error' ? (
          <ErrorState
            className="border-0 bg-transparent p-0 shadow-none"
            title="Route unavailable"
            message={route.error?.message || 'Could not calculate a walking route.'}
            onRetry={route.retry}
          />
        ) : null}
        {showRoute && route.status === 'success' && route.data ? (
          <p className="text-[12px] text-rw-muted">
            Walking route ≈{' '}
            {route.data.distanceMeters != null
              ? route.data.distanceMeters < 1000
                ? `${Math.round(route.data.distanceMeters)} m`
                : `${(route.data.distanceMeters / 1000).toFixed(1)} km`
              : '—'}
            {route.data.timeSeconds != null
              ? ` · ~${Math.max(1, Math.round(route.data.timeSeconds / 60))} min`
              : ''}
          </p>
        ) : null}
        {showRoute && routeWaypoints.length < 2 ? (
          <p className="text-[12px] text-rw-muted">
            Add at least two place-based activities to draw a route.
          </p>
        ) : null}
      </div>
    </article>
  )
}
