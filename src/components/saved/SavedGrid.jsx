import { Link } from 'react-router-dom'
import { EmptyState, ErrorState } from '../common/StatusBlocks.jsx'
import { IconBookmark } from '../common/Icons.jsx'
import { SavedPlaceCard } from './SavedPlaceCard.jsx'
import { SavedSkeleton } from './SavedSkeleton.jsx'

export function SavedEmptyState({
  filtered = false,
  onClearFilter,
  categoryLabel,
}) {
  if (filtered) {
    return (
      <EmptyState
        title={`No saved ${categoryLabel?.toLowerCase() || 'places'}`}
        message="Try another category, or save more places while browsing Discover and destination pages."
        actionLabel="Show all saved"
        onAction={onClearFilter}
      />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-rw-divider bg-rw-surface px-6 py-14 text-center shadow-sm">
      <div className="flex size-14 items-center justify-center rounded-full bg-rw-accent/10 text-rw-accent">
        <IconBookmark filled className="h-[18px] w-[14px]" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-xl font-semibold text-rw-ink">
          No saved places yet
        </h2>
        <p className="mx-auto max-w-md text-sm leading-[22px] text-rw-muted">
          Bookmark destinations, attractions, restaurants, and hotels while you
          explore. They’ll show up here for quick planning.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex rounded-full bg-rw-accent px-5 py-2.5 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_4px_12px_-4px_rgba(185,5,56,0.35)] transition hover:brightness-110"
      >
        Explore Discover
      </Link>
    </div>
  )
}

export function SavedErrorState({ onRetry }) {
  return (
    <ErrorState
      title="Couldn't load saved places"
      message="Your bookmarks may be temporarily unavailable. Retry to reload from local storage."
      onRetry={onRetry}
      className="items-center text-center"
    />
  )
}

export function SavedGrid({
  places,
  status,
  filtered,
  categoryLabel,
  onClearFilter,
  onRetry,
}) {
  if (status === 'loading') {
    return <SavedSkeleton />
  }

  if (status === 'error') {
    return <SavedErrorState onRetry={onRetry} />
  }

  if (!places.length) {
    return (
      <SavedEmptyState
        filtered={filtered}
        categoryLabel={categoryLabel}
        onClearFilter={onClearFilter}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {places.map((place) => (
        <SavedPlaceCard key={place.id} place={place} />
      ))}
    </div>
  )
}
