import { cn } from '../../utils/cn.js'
import { EmptyState, ErrorState, SkeletonBlock } from '../common/StatusBlocks.jsx'
import {
  IconBike,
  IconBus,
  IconExpand,
  IconHome,
  IconMetro,
  IconPin,
  IconTrain,
} from '../common/Icons.jsx'

const TRANSIT_ICONS = [IconTrain, IconMetro, IconBus, IconBike]

export function LocationPreview({ id, status, data, error, onRetry, destination }) {
  if (status === 'loading') {
    return (
      <div id={id} className="scroll-mt-28 space-y-4">
        <SkeletonBlock className="h-[480px] w-full rounded-2xl" />
        <SkeletonBlock className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div id={id} className="scroll-mt-28">
        <ErrorState
          title="Location unavailable"
          message={error?.message || 'Map and transit data failed to load.'}
          onRetry={onRetry}
        />
      </div>
    )
  }

  if (status === 'empty' || !data) {
    return (
      <div id={id} className="scroll-mt-28">
        <EmptyState
          title="No location data"
          message="Coordinates and transit accessibility are empty."
          actionLabel="Retry"
          onAction={onRetry}
        />
      </div>
    )
  }

  return (
    <div id={id} className="scroll-mt-28 space-y-6">
      <article className="overflow-hidden rounded-2xl bg-rw-surface shadow-md">
        <div className="flex items-center justify-between bg-rw-surface-soft px-2 py-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rw-teal" />
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-ink uppercase">
              Interactive Route Map
            </p>
          </div>
          <button type="button" className="rounded-full p-1 text-rw-muted" aria-label="Expand map">
            <IconExpand />
          </button>
        </div>

        <div className="relative h-72 overflow-hidden bg-rw-surface-muted">
          <img src={data.mapImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex flex-col justify-between p-2">
            <div className="self-start rounded-full bg-white/95 px-2 py-1 text-[11px] font-bold tracking-[0.55px] text-rw-ink shadow-md backdrop-blur-[6px]">
              {data.routeLabel}
            </div>
            {data.pins?.map((pin) => (
              <span
                key={pin.id}
                className={cn(
                  'absolute flex size-8 items-center justify-center rounded-full border-2 border-white text-white shadow-lg',
                  pin.tone === 'teal' ? 'bg-rw-teal' : 'bg-rw-accent',
                )}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                {pin.tone === 'teal' ? <IconHome className="size-3.5" /> : <IconPin className="h-3.5 w-3" />}
              </span>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-white/90 px-1 py-1 shadow-md backdrop-blur-[6px]">
              <p className="inline-flex items-center gap-1 px-1 text-[11px] font-bold tracking-[0.55px] text-rw-ink">
                <IconPin className="h-3 w-2.5 text-rw-accent" />
                {data.highlightsLabel}
              </p>
              <button type="button" className="px-2 text-[11px] font-bold tracking-[0.55px] text-rw-accent">
                Trace Route
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 bg-rw-surface-soft p-4">
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
            Transit Accessibility
          </p>
          <div className="grid grid-cols-2 gap-1">
            {data.transit.map((item, index) => {
              const Icon = TRANSIT_ICONS[index % TRANSIT_ICONS.length]
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-xl bg-rw-surface p-1 shadow-sm"
                >
                  <Icon className="shrink-0 text-rw-ink" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold tracking-[0.55px] text-rw-ink">
                      {item.title}
                    </p>
                    <p className="truncate text-xs tracking-[0.12px] text-rw-muted">{item.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="pt-1 text-[11px] text-rw-muted">
            {destination?.name}: {data.lat.toFixed(4)}, {data.lng.toFixed(4)}
          </p>
        </div>
      </article>

      {destination?.budget ? <BudgetPanel budget={destination.budget} /> : null}
      {destination?.tip ? <TipPanel tip={destination.tip} /> : null}
    </div>
  )
}

function BudgetPanel({ budget }) {
  const total = budget.segments.reduce((sum, s) => sum + s.amount, 0) || 1

  return (
    <article className="space-y-4 rounded-2xl bg-rw-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
          Estimated Trip Cost
        </h3>
        <span className="rounded-full bg-rw-warm px-1 py-0.5 text-[11px] font-bold tracking-[0.55px] text-[#686259] dark:text-rw-muted">
          {budget.label}
        </span>
      </div>
      <div>
        <div className="mb-1 flex items-end justify-between">
          <p className="text-[13px] font-semibold tracking-[0.26px] text-rw-muted">
            Total Estimation
          </p>
          <p className="font-display text-[22px] font-bold tracking-[0.26px] text-rw-ink">
            ${budget.total}{' '}
            <span className="text-xs font-normal tracking-[0.12px] text-rw-muted">/ person</span>
          </p>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-rw-surface-muted">
          {budget.segments.map((segment) => (
            <div
              key={segment.id}
              style={{
                width: `${(segment.amount / total) * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-2">
          {budget.segments.map((segment) => (
            <span
              key={segment.id}
              className="inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.55px] text-rw-muted"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {segment.label} ${segment.amount}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="w-full rounded-full bg-rw-surface-muted py-1 text-[13px] font-semibold tracking-[0.26px] text-rw-ink"
      >
        Customize Budget Parameters
      </button>
    </article>
  )
}

function TipPanel({ tip }) {
  return (
    <article className="space-y-2 rounded-2xl bg-[#e2e7ff] p-4 shadow-sm dark:bg-rw-surface-muted">
      <h3 className="text-[13px] font-bold tracking-[0.26px] text-rw-ink">{tip.title}</h3>
      <p className="text-xs leading-[19.5px] tracking-[0.12px] text-rw-muted">{tip.body}</p>
    </article>
  )
}
