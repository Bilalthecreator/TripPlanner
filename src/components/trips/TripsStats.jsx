import { cn } from '../../utils/cn.js'
import { IconBook, IconGlobe, IconPlane } from '../common/Icons.jsx'

const CARDS = [
  {
    id: 'ledger',
    title: 'Travel Ledger',
    icon: IconPlane,
    iconWrap: 'bg-[#f8d7df] text-rw-accent dark:bg-rw-accent/20',
    getValue: (stats) => `${stats.daysOnRoad} days on road`,
    getSub: (stats) => String(stats.year),
  },
  {
    id: 'territories',
    title: 'Territories Visited',
    icon: IconGlobe,
    iconWrap: 'bg-[#d5f3ef] text-rw-teal dark:bg-rw-teal/20',
    getValue: (stats) =>
      `${stats.countries} ${stats.countries === 1 ? 'country' : 'countries'} explored`,
    getSub: null,
  },
  {
    id: 'blueprints',
    title: 'Saved Blueprints',
    icon: IconBook,
    iconWrap: 'bg-[#efe4d4] text-[#8b5e3c] dark:bg-[#3d342c] dark:text-[#e7ded3]',
    getValue: (stats) =>
      `${stats.templates} ready ${stats.templates === 1 ? 'template' : 'templates'}`,
    getSub: null,
  },
]

export function TripsStats({ stats, className }) {
  return (
    <section
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-3',
        className,
      )}
      aria-label="Trip overview"
    >
      {CARDS.map((card) => {
        const Icon = card.icon
        return (
          <article
            key={card.id}
            className="flex items-center gap-3 rounded-2xl bg-rw-surface px-4 py-3 shadow-[0_1px_2px_var(--color-rw-card-shadow)]"
          >
            <span
              className={cn(
                'inline-flex size-10 shrink-0 items-center justify-center rounded-full',
                card.iconWrap,
              )}
            >
              <Icon />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
                {card.title}
                {card.getSub ? (
                  <span className="normal-case tracking-[0.12px]">
                    {' '}
                    {card.getSub(stats)}
                  </span>
                ) : null}
              </p>
              <p className="truncate text-sm font-semibold tracking-[-0.08px] text-rw-ink">
                {card.getValue(stats)}
              </p>
            </div>
          </article>
        )
      })}
    </section>
  )
}
