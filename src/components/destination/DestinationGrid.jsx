import { DestinationCard } from './DestinationCard.jsx'
import { EmptyState, ErrorState, SkeletonCard } from '../common/StatusBlocks.jsx'
import { IconGrid, IconList } from '../common/Icons.jsx'
import { cn } from '../../utils/cn.js'

export function DestinationGrid({
  title = 'Trending Destinations',
  subtitle = 'Calculated from 48,000+ dynamic trip bookings this week',
  destinations = [],
  status,
  error,
  onRetry,
  onClearSearch,
  layout = 'grid',
  onLayoutChange,
  isSearch = false,
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.36px] text-rw-ink sm:text-2xl sm:leading-8">
            {isSearch ? 'Search Results' : title}
          </h2>
          <p className="text-xs tracking-[0.12px] text-rw-muted sm:leading-[18px]">
            {isSearch
              ? `${destinations.length} destination${destinations.length === 1 ? '' : 's'} matched`
              : subtitle}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => onLayoutChange?.('grid')}
            className={cn(
              'rounded-full p-1 text-rw-muted transition',
              layout === 'grid' ? 'bg-rw-accent text-white' : 'bg-rw-surface-muted',
            )}
          >
            <IconGrid />
          </button>
          <button
            type="button"
            aria-label="List view"
            onClick={() => onLayoutChange?.('list')}
            className={cn(
              'rounded-full p-1 text-rw-muted transition',
              layout === 'list' ? 'bg-rw-accent text-white' : 'bg-rw-surface-muted',
            )}
          >
            <IconList />
          </button>
        </div>
      </div>

      {status === 'loading' ? (
        <div
          className={cn(
            layout === 'list'
              ? 'flex flex-col gap-4'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4',
          )}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <ErrorState
          title="Destinations unavailable"
          message={error?.message || 'We couldn’t load destinations right now.'}
          onRetry={onRetry}
        />
      ) : null}

      {status === 'empty' ? (
        <EmptyState
          title={isSearch ? 'No destinations found' : 'No trending destinations'}
          message={
            isSearch
              ? 'Try another city—London, Paris, Dubai, Istanbul, Tokyo, Lahore, or New York.'
              : 'Discovery data came back empty. Refresh to try again.'
          }
          actionLabel={isSearch ? 'Clear search' : 'Retry'}
          onAction={isSearch ? onClearSearch : onRetry}
        />
      ) : null}

      {status === 'success' ? (
        <div
          className={cn(
            layout === 'list'
              ? 'flex flex-col gap-4'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4',
          )}
        >
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              layout={layout}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
