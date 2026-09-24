import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import { useSavedPlaces } from '../../store/useSavedPlaces.js'
import { fromDestination } from '../../utils/savedPlaces.js'
import {
  IconBookmark,
  IconCompass,
  IconShare,
} from '../common/Icons.jsx'

export function DestinationSubHeader({ destination }) {
  const { isSaved, toggleSaved } = useSavedPlaces()
  const saved = isSaved(destination.id)

  return (
    <div className="-mx-4 mb-6 border-b border-rw-divider/50 bg-rw-surface-soft px-4 py-2 shadow-sm sm:-mx-6 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center gap-1 text-[13px] font-semibold tracking-[0.26px] text-rw-muted">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-rw-ink">
            <IconCompass className="text-rw-muted" />
            Discover
          </Link>
          <span className="text-rw-dot">/</span>
          <span>{destination.country}</span>
          <span className="text-rw-dot">/</span>
          <span className="rounded-full bg-rw-surface-muted px-1.5 py-0.5 text-rw-ink">
            {destination.name}
            {destination.localName ? ` (${destination.localName})` : ''}
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleSaved(fromDestination(destination))}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-4 py-1 text-[13px] font-semibold tracking-[0.26px] shadow-sm transition',
              saved
                ? 'bg-rw-surface-muted text-rw-accent'
                : 'bg-rw-surface-muted text-rw-muted hover:text-rw-ink',
            )}
          >
            <IconBookmark filled={saved} className="text-current" />
            {saved ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-rw-surface-muted px-4 py-1 text-[13px] font-semibold tracking-[0.26px] text-rw-muted"
          >
            <IconShare />
            Share
          </button>
          <Link
            to="/trips"
            className="inline-flex items-center gap-1 rounded-full bg-rw-accent px-5 py-1 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_8px_20px_-4px_rgba(185,5,56,0.35)]"
          >
            Plan a Trip Here
          </Link>
        </div>
      </div>
    </div>
  )
}
