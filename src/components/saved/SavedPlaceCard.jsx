import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import { useSavedPlaces } from '../../store/useSavedPlaces.js'
import { typeLabel } from '../../utils/savedPlaces.js'
import { IconBookmark, IconPin, IconStar } from '../common/Icons.jsx'

const TYPE_TONE = {
  destination: 'bg-rw-accent/10 text-rw-accent',
  attraction: 'bg-rw-teal/15 text-rw-teal',
  restaurant: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  hotel: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
}

export function SavedPlaceCard({ place }) {
  const navigate = useNavigate()
  const { removeSaved } = useSavedPlaces()

  const href =
    place.type === 'destination'
      ? `/destinations/${place.id}`
      : place.destinationId
        ? `/destinations/${place.destinationId}`
        : '/saved'

  const canNavigate =
    place.type === 'destination' || Boolean(place.destinationId)

  return (
    <article
      role={canNavigate ? 'link' : undefined}
      tabIndex={canNavigate ? 0 : undefined}
      onClick={() => {
        if (canNavigate) navigate(href)
      }}
      onKeyDown={(e) => {
        if (!canNavigate) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(href)
        }
      }}
      className={cn(
        'group overflow-hidden rounded-3xl bg-rw-surface shadow-[0_1px_2px_var(--color-rw-card-shadow)] transition duration-300',
        canNavigate &&
          'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
      )}
    >
      <div className="relative h-48 overflow-hidden bg-rw-surface-muted">
        {place.image ? (
          <img
            src={place.image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-rw-muted">
            No image
          </div>
        )}

        <span
          className={cn(
            'absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-[0.55px]',
            TYPE_TONE[place.type] || TYPE_TONE.attraction,
          )}
        >
          {typeLabel(place.type)}
        </span>

        <button
          type="button"
          aria-label={`Remove ${place.name} from saved`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            removeSaved(place.id)
          }}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-rw-accent text-white shadow-sm transition hover:brightness-110"
        >
          <IconBookmark filled />
        </button>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
            {place.name}
          </h3>
          {place.meta?.rating ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold text-rw-ink">
              <IconStar className="text-amber-400" />
              {Number(place.meta.rating).toFixed
                ? Number(place.meta.rating).toFixed(1)
                : place.meta.rating}
            </span>
          ) : null}
        </div>

        {place.location ? (
          <p className="inline-flex items-center gap-1 text-xs text-rw-muted">
            <IconPin className="text-rw-faint" />
            {place.location}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {place.meta?.priceLabel ? (
            <span className="rounded-full bg-rw-surface-muted px-2 py-0.5 text-[11px] font-bold tracking-[0.4px] text-rw-muted">
              {place.meta.priceLabel}
            </span>
          ) : null}
          {place.meta?.subtitle ? (
            <span className="text-[11px] font-semibold text-rw-faint">
              {place.meta.subtitle}
            </span>
          ) : null}
        </div>

        {canNavigate ? (
          <Link
            to={href}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 inline-flex w-fit text-[12px] font-semibold text-rw-accent"
          >
            {place.type === 'destination' ? 'Open destination' : 'View destination'} →
          </Link>
        ) : null}
      </div>
    </article>
  )
}
