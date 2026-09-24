import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import {
  formatTripDateRange,
  getTripDurationDays,
} from '../../utils/tripMetrics.js'
import { IconCalendar, IconPencil, IconTravelers } from '../common/Icons.jsx'

const TABS = [
  { id: 'overview', label: 'Overview & Stats' },
  { id: 'itinerary', label: 'Itinerary Builder' },
  { id: 'settings', label: 'Trip Settings' },
]

export function WorkspaceHeader({
  trip,
  activeTab,
  onTabChange,
  onEditBasics,
  savedLabel = 'Auto-saved locally',
}) {
  const duration = getTripDurationDays(trip)

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
        <Link to="/trips" className="hover:text-rw-accent">
          Trips
        </Link>
        <span>/</span>
        <span className="text-rw-ink">{trip.name}</span>
        <span className="rounded-full bg-rw-surface-muted px-2 py-0.5 normal-case tracking-[0.12px]">
          {trip.visibility === 'public' ? 'Public' : 'Private'}
        </span>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-start gap-2">
            <h1 className="font-display text-2xl font-semibold tracking-[-0.35px] text-rw-ink sm:text-3xl">
              {trip.name}
            </h1>
            <button
              type="button"
              onClick={onEditBasics}
              className="mt-1 rounded-full p-1.5 text-rw-muted transition hover:bg-rw-surface-muted hover:text-rw-accent"
              aria-label="Edit trip basics"
            >
              <IconPencil />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-rw-muted">
            <span className="inline-flex items-center gap-1.5">
              <IconCalendar className="text-rw-faint" />
              {formatTripDateRange(trip.startDate, trip.endDate)}
              {duration ? ` · ${duration} Days` : null}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconTravelers className="text-rw-faint" />
              {trip.travelers}{' '}
              {trip.travelers === 1 ? 'Traveler' : 'Travelers'}
            </span>
            <span className="rounded-full bg-rw-surface-muted px-2.5 py-0.5 text-[11px] font-bold tracking-[0.55px]">
              {trip.budget?.currency || 'USD'}
            </span>
          </div>
        </div>

        <p className="inline-flex items-center gap-2 text-[12px] text-rw-muted">
          <span className="size-2 rounded-full bg-rw-teal" />
          {savedLabel}
        </p>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-b border-rw-divider/60 scrollbar-thin"
        aria-label="Workspace sections"
      >
        {TABS.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'shrink-0 border-b-2 px-4 py-2.5 text-[13px] font-semibold tracking-[0.26px] transition',
                active
                  ? 'border-rw-accent text-rw-accent'
                  : 'border-transparent text-rw-muted hover:text-rw-ink',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
