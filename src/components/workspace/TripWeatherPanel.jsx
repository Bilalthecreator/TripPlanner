import { useTripDestinationLocation } from '../../hooks/useTripDestinationLocation.js'
import { useAsyncResource } from '../../hooks/useAsyncResource.js'
import { getCurrentWeather } from '../../services/weather/index.js'
import { usePreferences } from '../../store/usePreferences.js'
import { formatTemperature } from '../../data/preferences.js'
import { EmptyState, ErrorState, SkeletonBlock } from '../common/StatusBlocks.jsx'

/**
 * Destination weather enrichment for Trip Workspace overview.
 * Independent section — failures never block itinerary editing.
 */
export function TripWeatherPanel({ destination }) {
  const { temperatureUnit } = usePreferences()
  const location = useTripDestinationLocation(destination)
  const resolved = location.destination
  const lat = resolved?.latitude
  const lon = resolved?.longitude
  const enabled =
    location.status === 'ready' &&
    Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lon))

  const weather = useAsyncResource(
    (signal) =>
      getCurrentWeather(lat, lon, {
        signal,
        city: [resolved?.name, resolved?.country].filter(Boolean).join(', '),
        region: resolved?.region || '',
      }),
    [lat, lon, resolved?.name, resolved?.country, resolved?.region],
    { enabled },
  )

  if (location.status === 'loading') {
    return <SkeletonBlock className="h-[140px] w-full rounded-2xl" />
  }

  if (location.status === 'error') {
    return (
      <ErrorState
        title="Weather unavailable"
        message={
          location.error?.message ||
          'Could not resolve destination coordinates.'
        }
        onRetry={location.retry}
      />
    )
  }

  if (!enabled) {
    return (
      <EmptyState
        className="min-h-[140px]"
        title="Weather unavailable"
        message="Select a geocoded destination to load live weather."
      />
    )
  }

  if (weather.status === 'loading') {
    return <SkeletonBlock className="h-[140px] w-full rounded-2xl" />
  }

  if (weather.status === 'error') {
    return (
      <ErrorState
        title="Weather unavailable"
        message={weather.error?.message || 'Open-Meteo request failed.'}
        onRetry={weather.retry}
      />
    )
  }

  if (weather.status === 'empty' || !weather.data) {
    return (
      <EmptyState
        title="No weather data"
        actionLabel="Retry"
        onAction={weather.retry}
      />
    )
  }

  const data = weather.data

  return (
    <article className="rounded-2xl bg-rw-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
            Destination Weather
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-rw-ink">
            {data.city}
          </p>
          <p className="text-xs text-rw-muted">
            {data.region} · {data.localTime}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-3xl font-bold text-rw-ink">
            {formatTemperature(data.temperatureC, temperatureUnit)}
          </p>
          <p className="text-[11px] font-bold tracking-[0.4px] text-rw-teal">
            {data.condition}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-rw-input p-2 text-center">
        <Metric label="UV" value={data.uvIndex} hint={data.uvLabel} />
        <Metric label="Wind" value={data.wind} hint={data.windLabel} />
        <Metric label="Rain" value={data.rainProb} hint={data.rainLabel} />
      </div>
    </article>
  )
}

function Metric({ label, value, hint }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.4px] text-rw-muted uppercase">
        {label}
      </p>
      <p className="font-display text-base font-semibold text-rw-ink">{value}</p>
      <p className="text-[10px] font-bold text-rw-faint">{hint}</p>
    </div>
  )
}
