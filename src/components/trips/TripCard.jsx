import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import {
  formatTripDateRange,
  getStatusLabel,
  getTripBudgetStatus,
  getTripDurationDays,
  getTripLifecycleStatus,
  getTripProgress,
} from '../../utils/tripMetrics.js'
import {
  IconArrowRight,
  IconCamera,
  IconChecklist,
  IconPencil,
  IconPin,
} from '../common/Icons.jsx'
import { TripBudgetStatus } from './TripBudgetStatus.jsx'
import { TripProgress } from './TripProgress.jsx'

function actionMeta(trip, status) {
  const kind = trip.primaryAction
  if (kind === 'continue' || status === 'draft') {
    return {
      label: 'Continue Planning',
      icon: IconPencil,
      to: `/trips/${trip.id}`,
    }
  }
  if (kind === 'pack') {
    return {
      label: 'Open Pack List',
      icon: IconChecklist,
      to: `/trips/${trip.id}`,
    }
  }
  if (kind === 'memories' || status === 'completed') {
    return {
      label: 'View Memories',
      icon: IconCamera,
      to: `/trips/${trip.id}`,
    }
  }
  return {
    label: 'Open Workspace',
    icon: IconArrowRight,
    to: `/trips/${trip.id}`,
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case 'upcoming':
      return 'bg-emerald-600 text-white'
    case 'active':
      return 'bg-rw-teal text-white'
    case 'draft':
      return 'bg-[#c4a484] text-white'
    case 'completed':
      return 'bg-indigo-500 text-white'
    default:
      return 'bg-black/50 text-white'
  }
}

export function TripCard({ trip }) {
  const navigate = useNavigate()
  const status = getTripLifecycleStatus(trip)
  const progress = getTripProgress(trip)
  const budget = getTripBudgetStatus(trip)
  const duration = getTripDurationDays(trip)
  const action = actionMeta(trip, status)
  const ActionIcon = action.icon
  const href = `/trips/${trip.id}`
  const cover =
    trip.coverImage || trip.destination?.image || ''
  const places = Array.isArray(trip.destinations)
    ? trip.destinations.map((d) => d.name).filter(Boolean)
    : [trip.destination?.name].filter(Boolean)

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => navigate(href)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(href)
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-rw-surface shadow-[0_1px_2px_var(--color-rw-card-shadow)] transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-52 w-full overflow-hidden sm:h-56">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-rw-surface-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-[0.55px]',
              statusBadgeClass(status),
            )}
          >
            {getStatusLabel(status)}
          </span>
          {duration > 0 ? (
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-ink shadow-sm dark:bg-black/55 dark:text-white">
              {duration} Days
            </span>
          ) : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[11px] font-bold tracking-[0.55px] text-white/85">
            {formatTripDateRange(trip.startDate, trip.endDate, {
              uppercase: true,
            })}
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.2px] text-white">
            {trip.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <TripProgress trip={trip} progress={progress} />

        <div className="flex flex-wrap items-center gap-2">
          <TripBudgetStatus budget={budget} />
          {places.length > 0 ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-[11px] font-semibold tracking-[0.12px] text-rw-muted">
              <IconPin className="shrink-0 text-rw-faint" />
              <span className="truncate">{places.join(', ')}</span>
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <div className="flex -space-x-2" aria-label="Collaborators">
            {(trip.collaborators || []).slice(0, 4).map((person) => (
              <span
                key={person.id}
                title={person.name}
                className="inline-flex size-7 items-center justify-center rounded-full border-2 border-rw-surface text-[10px] font-bold text-white"
                style={{ backgroundColor: person.color || '#5b4041' }}
              >
                {person.initials || person.name?.[0] || '?'}
              </span>
            ))}
          </div>

          <Link
            to={action.to}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full bg-rw-surface-muted px-3.5 py-2 text-[12px] font-semibold tracking-[0.26px] text-rw-ink transition hover:bg-rw-chip"
          >
            {action.label}
            <ActionIcon className="size-[12px]" />
          </Link>
        </div>
      </div>
    </article>
  )
}
