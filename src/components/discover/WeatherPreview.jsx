import { useAsyncResource } from '../../hooks/useAsyncResource.js'
import { discoverService } from '../../services/discoverService.js'
import { usePreferences } from '../../store/usePreferences.js'
import { formatTemperature } from '../../data/preferences.js'
import { ErrorState, EmptyState, SkeletonCard } from '../common/StatusBlocks.jsx'
import { IconLeaf, IconPin, IconRadar } from '../common/Icons.jsx'

export function WeatherPreview({ destinationId = 'kyoto' }) {
  const { temperatureUnit } = usePreferences()
  const { status, data, error, retry } = useAsyncResource(
    (signal) => discoverService.getWeather(destinationId, { signal }),
    [destinationId],
  )

  if (status === 'loading') return <SkeletonCard variant="weather" />

  if (status === 'error') {
    return (
      <ErrorState
        className="min-h-[251px]"
        title="Weather unavailable"
        message={error?.message || 'Live telemetry failed to sync.'}
        onRetry={retry}
      />
    )
  }

  if (status === 'empty' || !data) {
    return (
      <EmptyState
        className="min-h-[251px]"
        title="No weather data"
        message="There’s nothing to show for this destination yet."
        actionLabel="Retry"
        onAction={retry}
      />
    )
  }

  return (
    <section className="flex min-h-[251px] flex-col justify-between rounded-3xl bg-rw-surface-soft p-5 shadow-sm sm:p-6 lg:col-span-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-rw-ink">
          <IconRadar />
          <h2 className="text-[13px] font-semibold tracking-[0.26px]">Trending Radar</h2>
        </div>
        <span className="rounded bg-rw-input px-1 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-muted">
          Live Sync
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 py-4">
        <div>
          <div className="flex items-center gap-1">
            <p className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
              {data.city}
            </p>
            <IconPin className="text-rw-accent" />
          </div>
          <p className="text-xs tracking-[0.12px] text-rw-muted">
            {data.region} • {data.localTime}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-bold tracking-[-0.72px] text-rw-ink">
            {formatTemperature(data.temperatureC, temperatureUnit)}
          </p>
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-teal">
            {data.condition}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-rw-input p-2 shadow-sm">
        <Metric label="UV Index" value={data.uvIndex} hint={data.uvLabel} />
        <Metric label="Wind" value={data.wind} hint={data.windLabel} />
        <Metric
          label="Rain Prob."
          value={data.rainProb}
          hint={data.rainLabel}
          hintClass="text-rw-teal"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pt-1">
        <p className="inline-flex items-center gap-1 text-xs tracking-[0.12px] text-rw-muted">
          <IconLeaf className="text-rw-teal" />
          {data.aqiLabel}
        </p>
        <button
          type="button"
          className="text-[11px] font-semibold tracking-[0.55px] text-rw-accent"
        >
          7-Day Forecast →
        </button>
      </div>
    </section>
  )
}

function Metric({ label, value, hint, hintClass = 'text-rw-faint' }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted">{label}</p>
      <p className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
        {value}
      </p>
      <p className={`text-[11px] font-bold tracking-[0.55px] ${hintClass}`}>{hint}</p>
    </div>
  )
}
