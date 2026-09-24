import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import { useSavedPlaces } from '../../store/useSavedPlaces.js'
import { IconArrowRight, IconBookmark, IconStar } from '../common/Icons.jsx'

export function DestinationCard({ destination, layout = 'grid' }) {
  const navigate = useNavigate()
  const { isSaved, toggleSaved } = useSavedPlaces()
  const saved = isSaved(destination.id)
  const href = `/destinations/${destination.id}`

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
      className={cn(
        'group cursor-pointer overflow-hidden rounded-3xl bg-rw-surface shadow-[0_1px_2px_var(--color-rw-card-shadow)] transition duration-300 hover:-translate-y-0.5 hover:shadow-md',
        layout === 'list' && 'sm:flex sm:min-h-[180px]',
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          layout === 'grid' ? 'h-56 w-full' : 'h-56 w-full sm:h-auto sm:w-56 sm:shrink-0',
        )}
      >
        <img
          src={destination.image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
          {destination.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[rgba(250,248,255,0.9)] px-1 py-0.5 text-[11px] font-bold tracking-[0.55px] text-rw-ink shadow-sm backdrop-blur-[6px] dark:bg-black/50 dark:text-white"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          aria-label={saved ? `Remove ${destination.name} from saved` : `Save ${destination.name}`}
          aria-pressed={saved}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleSaved(destination.id)
          }}
          className={cn(
            'absolute right-3 top-3 flex size-8 items-center justify-center rounded-full shadow-sm backdrop-blur-[6px] transition',
            saved
              ? 'bg-rw-accent text-white'
              : 'bg-[rgba(250,248,255,0.9)] text-rw-ink dark:bg-black/50 dark:text-white',
          )}
        >
          <IconBookmark filled={saved} />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(19,27,46,0.6)] px-2 py-0.5 text-[11px] font-bold tracking-[0.55px] text-[#faf8ff] backdrop-blur-[6px]">
            <IconStar className="size-[11px] text-amber-300" />
            {destination.rating.toFixed(2)} ({destination.ratingCount})
          </span>
          <span className="rounded-full bg-[rgba(19,27,46,0.6)] px-2 py-0.5 text-[11px] font-bold tracking-[0.55px] text-[#faf8ff] backdrop-blur-[6px]">
            {destination.status}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
              {destination.name}
            </h3>
            <span className="text-[11px] font-bold tracking-[0.55px] text-rw-teal">
              {destination.country}
            </span>
          </div>
          <p className="line-clamp-2 text-xs leading-[18px] tracking-[0.12px] text-rw-muted">
            {destination.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted">Daily Avg</p>
            <p className="text-base font-semibold tracking-[-0.08px] text-rw-ink">
              ${destination.dailyAvg}
              <span className="text-xs font-normal tracking-[0.12px] text-rw-muted"> /day</span>
            </p>
          </div>
          <Link
            to={href}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-full bg-rw-accent px-4 py-1.5 text-[11px] font-bold tracking-[0.55px] text-white shadow-sm transition hover:brightness-110"
          >
            Itinerary
            <IconArrowRight />
          </Link>
        </div>
      </div>
    </article>
  )
}
