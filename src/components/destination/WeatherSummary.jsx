import { cn } from '../../utils/cn.js'
import { EmptyState, ErrorState, SkeletonBlock } from '../common/StatusBlocks.jsx'
import {
  IconCloud,
  IconDrop,
  IconLeafSmall,
  IconRain,
  IconSunSmall,
} from '../common/Icons.jsx'

const CONDITION_ICON = {
  sunny: IconSunSmall,
  'partly-sunny': IconSunSmall,
  cloudy: IconCloud,
  rain: IconRain,
}

function formatTemp(celsius, unit = 'C') {
  if (unit === 'F') return `${Math.round((celsius * 9) / 5 + 32)}°`
  return `${celsius}°`
}

export function WeatherSummary({
  weatherStatus,
  forecastStatus,
  weather,
  forecast,
  weatherError,
  forecastError,
  onRetryWeather,
  onRetryForecast,
  temperatureUnit = 'C',
}) {
  const loading = weatherStatus === 'loading' || forecastStatus === 'loading'
  const weatherFailed = weatherStatus === 'error'
  const forecastFailed = forecastStatus === 'error'

  if (loading && !weather && !forecast) {
    return (
      <section className="-mx-4 bg-rw-surface-soft px-4 py-4 shadow-sm sm:-mx-6 sm:px-6">
        <div className="mb-3 flex justify-between gap-3">
          <SkeletonBlock className="h-10 w-72" />
          <SkeletonBlock className="hidden h-8 w-80 rounded-full md:block" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="-mx-4 bg-rw-surface-soft px-4 py-4 shadow-sm sm:-mx-6 sm:px-6">
      <div className="mb-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#89f5e7] text-rw-teal dark:bg-rw-teal/30">
            <IconLeafSmall />
          </div>
          <div>
            {weatherFailed ? (
              <ErrorState
                className="border-0 bg-transparent p-0 shadow-none"
                title="Weather unavailable"
                message={weatherError?.message}
                onRetry={onRetryWeather}
              />
            ) : weatherStatus === 'empty' || !weather ? (
              <EmptyState
                className="border-0 bg-transparent p-0 shadow-none"
                title="No weather data"
                actionLabel="Retry"
                onAction={onRetryWeather}
              />
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
                  {weather.title}
                </h2>
                <p className="text-xs tracking-[0.12px] text-rw-muted">{weather.summary}</p>
              </>
            )}
          </div>
        </div>
        {weather?.packingTip ? (
          <div className="inline-flex items-center gap-1 self-start rounded-full bg-[rgba(0,104,95,0.1)] px-4 py-1 text-[11px] font-bold tracking-[0.55px] text-rw-teal uppercase">
            <IconLeafSmall />
            Packing tip: {weather.packingTip}
          </div>
        ) : null}
      </div>

      {forecastFailed ? (
        <ErrorState
          title="Forecast unavailable"
          message={forecastError?.message || 'Could not load the 5-day forecast.'}
          onRetry={onRetryForecast}
        />
      ) : forecastStatus === 'empty' || !forecast?.length ? (
        <EmptyState
          title="No forecast"
          message="Forecast data is empty for this destination."
          actionLabel="Retry"
          onAction={onRetryForecast}
        />
      ) : (
        <ForecastList days={forecast} temperatureUnit={temperatureUnit} />
      )}
    </section>
  )
}

export function ForecastList({ days, temperatureUnit = 'C' }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
      {days.map((day) => {
        const Icon = CONDITION_ICON[day.condition] ?? IconSunSmall
        const precipTone = day.precip >= 50 ? 'text-rw-accent' : 'text-rw-teal'
        return (
          <article
            key={day.id}
            className="relative flex min-w-[120px] flex-1 flex-col items-center rounded-xl bg-rw-surface p-2 shadow-sm"
          >
            {day.isToday ? (
              <span className="absolute right-2 top-1 rounded bg-[#ffdadb] px-1.5 text-[10px] font-bold text-[#40000d]">
                TODAY
              </span>
            ) : null}
            <p className="pt-1 text-[11px] font-bold tracking-[0.55px] text-rw-muted">
              {day.label}
            </p>
            <div className="py-1 text-rw-ink">
              <Icon />
            </div>
            <p className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
              {formatTemp(day.highC, temperatureUnit)}
              <span className="ml-1 text-xs font-normal tracking-[0.12px] text-rw-muted">
                / {formatTemp(day.lowC, temperatureUnit)}
              </span>
            </p>
            <p className={cn('mt-1 inline-flex items-center gap-0.5 text-[11px] font-bold tracking-[0.55px]', precipTone)}>
              <IconDrop />
              {day.precip}%
            </p>
          </article>
        )
      })}
    </div>
  )
}
