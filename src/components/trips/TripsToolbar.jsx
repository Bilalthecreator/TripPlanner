import { Link } from 'react-router-dom'
import { IconPlus } from '../common/Icons.jsx'
import { TripFilters } from './TripFilters.jsx'
import { TripSearch } from './TripSearch.jsx'
import { cn } from '../../utils/cn.js'

export function TripsToolbar({
  activeCount,
  filters,
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  onPreviewEmpty,
  previewingEmpty = false,
  disabled = false,
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold tracking-[0.55px] text-rw-accent uppercase">
              Curated Journeys
            </span>
            <span className="rounded-full bg-rw-surface-muted px-2.5 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-muted">
              {activeCount} Active Trips
            </span>
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.45px] text-rw-ink sm:text-4xl">
            My Trips
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPreviewEmpty}
            disabled={disabled}
            className={cn(
              'rounded-full border border-rw-divider bg-rw-surface px-4 py-2 text-[13px] font-semibold tracking-[0.26px] text-rw-ink transition hover:bg-rw-surface-soft',
              disabled && 'cursor-not-allowed opacity-50',
              previewingEmpty && 'border-rw-accent/40 text-rw-accent',
            )}
          >
            {previewingEmpty ? 'Restore Trips' : 'Preview Zero State'}
          </button>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-rw-accent px-4 py-2 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_8px_20px_-4px_rgba(185,5,56,0.3)] transition hover:brightness-110"
          >
            <IconPlus className="size-[11px]" />
            Create New Trip
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <TripFilters
          filters={filters}
          activeId={activeFilter}
          onChange={onFilterChange}
          disabled={disabled}
        />
        <div className="w-full lg:max-w-md">
          <TripSearch
            value={searchValue}
            onChange={onSearchChange}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  )
}
