import { useRef } from 'react'
import { useAsyncResource } from '../../hooks/useAsyncResource.js'
import { discoverService } from '../../services/discoverService.js'
import { useSavedPlaces } from '../../store/useSavedPlaces.js'
import { fromAttraction } from '../../utils/savedPlaces.js'
import { EmptyState, ErrorState, SkeletonCard } from '../common/StatusBlocks.jsx'
import { SoftImage } from '../common/SoftImage.jsx'
import {
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconPin,
  IconPlus,
} from '../common/Icons.jsx'
import { cn } from '../../utils/cn.js'

export function AttractionsStrip({
  filter = 'all',
  destinationId,
  latitude,
  longitude,
}) {
  const scrollerRef = useRef(null)
  const { status, data, error, retry } = useAsyncResource(
    (signal) =>
      discoverService.getAttractions(
        { filter, destinationId, latitude, longitude },
        { signal },
      ),
    [filter, destinationId, latitude, longitude],
  )

  const scrollBy = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir * 336, behavior: 'smooth' })
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.36px] text-rw-ink sm:text-2xl sm:leading-8">
            Trending Attractions & Experiences
          </h2>
          <p className="text-xs tracking-[0.12px] text-rw-muted">
            Top-rated points of interest to instantly slot into your travel timeline
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Scroll attractions left"
            onClick={() => scrollBy(-1)}
            className="flex size-8 items-center justify-center rounded-full bg-rw-surface-muted text-rw-muted"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Scroll attractions right"
            onClick={() => scrollBy(1)}
            className="flex size-8 items-center justify-center rounded-full bg-rw-surface-muted text-rw-muted"
          >
            <IconChevronRight />
          </button>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="attraction" />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <ErrorState
          title="Attractions unavailable"
          message={error?.message || 'Popular attractions failed to load.'}
          onRetry={retry}
        />
      ) : null}

      {status === 'empty' ? (
        <EmptyState
          title="No attractions for this filter"
          message="Try another quick filter to see experiences."
          actionLabel="Retry"
          onAction={retry}
        />
      ) : null}

      {status === 'success' ? (
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin"
        >
          {data.map((attraction) => (
            <AttractionCard key={attraction.id} attraction={attraction} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function AttractionCard({ attraction }) {
  const { isSaved, toggleSaved } = useSavedPlaces()
  const saved = isSaved(attraction.id)

  return (
    <article className="w-[280px] shrink-0 rounded-2xl bg-rw-surface-soft p-2 shadow-sm sm:w-[320px]">
      <div className="relative h-40 overflow-hidden rounded-xl">
        <SoftImage
          src={attraction.image}
          attribution={attraction.imageAttribution}
          className="h-full w-full rounded-xl"
        />
        {attraction.category ? (
          <span className="absolute left-2 top-2 z-[1] rounded-full bg-[rgba(250,248,255,0.9)] px-1 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-ink backdrop-blur-[6px] dark:bg-black/50 dark:text-white">
            {attraction.category}
          </span>
        ) : null}
        {attraction.priceLabel ? (
          <span
            className={cn(
              'absolute right-2 top-2 z-[1] rounded-full px-1 py-0.5 text-[11px] font-bold tracking-[0.55px]',
              attraction.priceTone === 'teal'
                ? 'bg-rw-teal text-white'
                : 'bg-rw-surface-muted text-rw-ink',
            )}
          >
            {attraction.priceLabel}
          </span>
        ) : null}
      </div>

      <div className="space-y-1 px-1 pt-3">
        <h3 className="font-display text-lg font-semibold leading-[22.5px] tracking-[-0.18px] text-rw-ink">
          {attraction.name}
        </h3>
        <p className="inline-flex items-center gap-1 text-xs tracking-[0.12px] text-rw-muted">
          <IconPin className="text-rw-accent" />
          {attraction.location || attraction.address || 'Nearby'}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 px-1 pt-4 pb-1">
        {attraction.duration ? (
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-muted">
            <IconClock />
            {attraction.duration}
          </span>
        ) : attraction.distance != null ? (
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-muted">
            <IconPin className="size-[11px]" />
            {attraction.distance < 1000
              ? `${attraction.distance} m`
              : `${(attraction.distance / 1000).toFixed(1)} km`}
          </span>
        ) : (
          <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted">
            {attraction.category || 'POI'}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleSaved(fromAttraction(attraction))}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-4 py-1 text-[11px] font-bold tracking-[0.55px] transition',
            saved
              ? 'bg-rw-accent text-white'
              : 'bg-rw-chip text-rw-ink hover:brightness-95',
          )}
        >
          <IconPlus className="size-[8px]" />
          {saved ? 'Saved' : 'Add to Trip'}
        </button>
      </div>
    </article>
  )
}
