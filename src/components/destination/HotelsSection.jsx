import { cn } from '../../utils/cn.js'
import { useSavedPlaces } from '../../store/useSavedPlaces.js'
import { fromHotel } from '../../utils/savedPlaces.js'
import { EmptyState, ErrorState, SkeletonBlock } from '../common/StatusBlocks.jsx'
import { IconBookmark, IconStar } from '../common/Icons.jsx'

export function HotelCard({ hotel, destinationId }) {
  const { isSaved, toggleSaved } = useSavedPlaces()
  const saved = isSaved(hotel.id)

  return (
    <article className="overflow-hidden rounded-2xl bg-rw-surface shadow-sm">
      <div className="relative h-40 overflow-hidden bg-rw-surface-muted">
        <img src={hotel.image} alt="" className="h-full w-full object-cover" />
        <button
          type="button"
          aria-label={saved ? 'Unsave stay' : 'Save stay'}
          onClick={() => toggleSaved(fromHotel(hotel, destinationId))}
          className={cn(
            'absolute right-2 top-2 flex size-8 items-center justify-center rounded-full backdrop-blur-[6px]',
            saved ? 'bg-rw-accent text-white' : 'bg-white/90 text-rw-ink',
          )}
        >
          <IconBookmark filled={saved} />
        </button>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-teal uppercase">
            {hotel.area}
          </p>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-rw-ink">
            <IconStar className="text-amber-400" />
            {hotel.rating}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
          {hotel.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-[18px] text-rw-muted">{hotel.description}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-1">
            {hotel.tags?.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-rw-surface-muted px-2 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm font-semibold text-rw-ink">
            from ${hotel.priceFrom}
            <span className="text-xs font-normal text-rw-muted"> /night</span>
          </p>
        </div>
      </div>
    </article>
  )
}

export function HotelsSection({
  id,
  title = 'Stays & Hotels',
  count,
  items,
  status,
  error,
  onRetry,
  destinationId,
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-accent uppercase">
              Places to Stay
            </p>
            <span className="size-1.5 rounded-full bg-rw-accent" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.6px] text-rw-ink">
            {title}
          </h2>
        </div>
        <button type="button" className="text-[13px] font-semibold tracking-[0.26px] text-rw-accent">
          View all {count ?? items?.length ?? 0} →
        </button>
      </div>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-rw-surface">
              <SkeletonBlock className="h-40 rounded-none" />
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
          title="Hotels unavailable"
          message={error?.message || 'Stays failed to load for this destination.'}
          onRetry={onRetry}
        />
      ) : null}

      {status === 'empty' ? (
        <EmptyState
          title="No stays found"
          message="Hotel data came back empty for this destination."
          actionLabel="Retry"
          onAction={onRetry}
        />
      ) : null}

      {status === 'success' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              destinationId={destinationId}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
