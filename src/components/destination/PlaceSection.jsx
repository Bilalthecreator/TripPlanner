import { cn } from '../../utils/cn.js'
import { useSavedPlaces } from '../../store/useSavedPlaces.js'
import { EmptyState, ErrorState, SkeletonBlock } from '../common/StatusBlocks.jsx'
import { IconClock, IconPlus, IconStar } from '../common/Icons.jsx'

export function PlaceCard({ place }) {
  const { isSaved, toggleSaved } = useSavedPlaces()
  const saved = isSaved(place.id)

  return (
    <article className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-rw-surface shadow-sm">
      <div className="relative h-44 overflow-hidden bg-rw-surface-muted">
        <img src={place.image} alt="" className="h-full w-full object-cover" />
        <span
          className={cn(
            'absolute right-1 top-1 rounded-full bg-white/90 px-1 py-0.5 text-[11px] font-bold tracking-[0.55px] backdrop-blur-[2px]',
            place.priceTone === 'free' ? 'text-rw-teal' : 'text-rw-ink',
          )}
        >
          {place.priceLabel}
        </span>
        <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-black/60 px-1 py-0.5 text-[11px] font-bold tracking-[0.55px] text-white backdrop-blur-[2px]">
          <IconClock className="size-[11px]" />
          {place.duration}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-teal uppercase">
              {place.area}
            </p>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold tracking-[0.55px] text-rw-ink">
              <IconStar className="text-amber-400" />
              {place.rating}
            </span>
          </div>
          <h3 className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
            {place.name}
          </h3>
          <p className="line-clamp-2 text-xs leading-[18px] tracking-[0.12px] text-rw-muted">
            {place.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted">{place.note}</p>
          <button
            type="button"
            onClick={() => toggleSaved(place.id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold tracking-[0.55px]',
              saved ? 'bg-rw-accent text-white' : 'bg-[#e2e7ff] text-rw-ink dark:bg-rw-chip',
            )}
          >
            <IconPlus className="size-[9px]" />
            {saved ? 'Saved' : 'Add to Trip'}
          </button>
        </div>
      </div>
    </article>
  )
}

export function PlaceSection({
  id,
  eyebrow,
  title,
  viewAllLabel,
  items,
  status,
  error,
  onRetry,
  filter,
}) {
  const filtered =
    filter && filter !== 'all'
      ? (items ?? []).filter((item) => item.filters?.includes(filter))
      : items ?? []

  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-accent uppercase">
              {eyebrow}
            </p>
            <span className="size-1.5 rounded-full bg-rw-accent" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.6px] text-rw-ink">
            {title}
          </h2>
        </div>
        {viewAllLabel ? (
          <button
            type="button"
            className="text-[13px] font-semibold tracking-[0.26px] text-rw-accent"
          >
            {viewAllLabel} →
          </button>
        ) : null}
      </div>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-rw-surface shadow-sm">
              <SkeletonBlock className="h-44 rounded-none" />
              <div className="space-y-2 p-4">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-5 w-40" />
                <SkeletonBlock className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <ErrorState
          title="Attractions unavailable"
          message={error?.message || 'This section failed independently.'}
          onRetry={onRetry}
        />
      ) : null}

      {status === 'empty' || (status === 'success' && filtered.length === 0) ? (
        <EmptyState
          title="No matching attractions"
          message="Try another filter or clear Must-See / Free Entry / Walking Distance."
          actionLabel="Retry"
          onAction={onRetry}
        />
      ) : null}

      {status === 'success' && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
