import { EmptyState, ErrorState, SkeletonBlock } from '../common/StatusBlocks.jsx'
import { IconStar } from '../common/Icons.jsx'
import { cn } from '../../utils/cn.js'
import { useSavedPlaces } from '../../store/useSavedPlaces.js'
import { IconBookmark } from '../common/Icons.jsx'

export function RestaurantCard({ restaurant }) {
  const { isSaved, toggleSaved } = useSavedPlaces()
  const saved = isSaved(restaurant.id)

  return (
    <article className="flex gap-4 rounded-2xl bg-rw-surface p-4 shadow-sm">
      <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-rw-surface-muted">
        <img src={restaurant.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded bg-rw-warm px-1 py-0.5 text-[11px] font-semibold tracking-[0.55px] text-[#686259] dark:text-rw-muted">
            {restaurant.cuisine}
          </span>
          <span className="text-[13px] font-bold tracking-[0.26px] text-rw-muted">
            {restaurant.priceLevel}
          </span>
        </div>
        <h3 className="truncate font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
          {restaurant.name}
        </h3>
        <p className="truncate text-xs tracking-[0.12px] text-rw-muted">
          {restaurant.description}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-bold tracking-[0.55px]',
              restaurant.badgeTone === 'teal' ? 'text-rw-teal' : 'text-rw-muted',
            )}
          >
            <IconStar className="size-[11px]" />
            {restaurant.badge}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={saved ? 'Unsave restaurant' : 'Save restaurant'}
              onClick={() => toggleSaved(restaurant.id)}
              className={cn(
                'rounded-full p-1',
                saved ? 'text-rw-accent' : 'text-rw-muted',
              )}
            >
              <IconBookmark filled={saved} />
            </button>
            <button
              type="button"
              className="text-[11px] font-semibold tracking-[0.55px] text-rw-accent"
            >
              {restaurant.action}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export function RestaurantsSection({
  id,
  title = 'Recommended Food & Dining',
  count,
  items,
  status,
  error,
  onRetry,
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-accent uppercase">
              Culinary Heritage
            </p>
            <span className="size-1.5 rounded-full bg-rw-accent" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.6px] text-rw-ink">
            {title}
          </h2>
        </div>
        <button type="button" className="text-[13px] font-semibold tracking-[0.26px] text-rw-accent">
          Explore all {count ?? items?.length ?? 0} spots →
        </button>
      </div>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl bg-rw-surface p-4">
              <SkeletonBlock className="size-24 rounded-xl" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-5 w-48" />
                <SkeletonBlock className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <ErrorState
          title="Restaurants unavailable"
          message={error?.message || 'Dining recommendations failed to load.'}
          onRetry={onRetry}
        />
      ) : null}

      {status === 'empty' ? (
        <EmptyState
          title="No restaurants found"
          message="Restaurant data came back empty for this destination."
          actionLabel="Retry"
          onAction={onRetry}
        />
      ) : null}

      {status === 'success' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
