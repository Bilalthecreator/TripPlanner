import { Link } from 'react-router-dom'
import { IconPlus } from '../common/Icons.jsx'
import { cn } from '../../utils/cn.js'

export function TripsEmptyState({
  title = 'No trips yet',
  message = 'Start planning your next journey. Create a trip to organize destinations, days, activities, and budget in one place.',
  showCreate = true,
  onClearFilters,
  clearLabel = 'Clear filters',
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-rw-divider bg-rw-surface px-6 py-14 text-center shadow-sm',
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-rw-accent/10 text-rw-accent">
        <IconPlus className="size-5" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-xl font-semibold text-rw-ink">{title}</h2>
        <p className="mx-auto max-w-md text-sm leading-[22px] text-rw-muted">
          {message}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {showCreate ? (
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-rw-accent px-5 py-2.5 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_4px_12px_-4px_rgba(185,5,56,0.35)] transition hover:brightness-110"
          >
            <IconPlus className="size-[11px]" />
            Create Trip
          </Link>
        ) : null}
        {onClearFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-full border border-rw-divider bg-rw-surface px-5 py-2.5 text-[13px] font-semibold tracking-[0.26px] text-rw-ink transition hover:bg-rw-surface-soft"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
