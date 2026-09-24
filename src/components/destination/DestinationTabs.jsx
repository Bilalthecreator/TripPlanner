import { cn } from '../../utils/cn.js'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'attractions', label: 'Attractions' },
  { id: 'restaurants', label: 'Restaurants & Food' },
  { id: 'hotels', label: 'Stays & Hotels' },
  { id: 'map', label: 'Interactive Map' },
]

const FILTERS = [
  { id: 'all', label: null },
  { id: 'must-see', label: 'Must-See' },
  { id: 'free', label: 'Free Entry' },
  { id: 'walking', label: 'Walking Distance' },
]

export function DestinationTabs({
  activeTab,
  onTabChange,
  counts = {},
  activeFilter,
  onFilterChange,
}) {
  return (
    <div className="sticky top-16 z-30 -mx-4 border-y border-rw-divider/40 bg-rw-header px-4 py-1 shadow-sm backdrop-blur-[6px] sm:-mx-6 sm:px-6 md:top-16">
      <div className="flex flex-col gap-2 py-1 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto scrollbar-thin" role="tablist">
          {TABS.map((tab) => {
            const count =
              tab.id === 'attractions'
                ? counts.attractions
                : tab.id === 'restaurants'
                  ? counts.restaurants
                  : tab.id === 'hotels'
                    ? counts.hotels
                    : null
            const label =
              count != null && tab.id !== 'overview' && tab.id !== 'map'
                ? `${tab.label} (${count})`
                : tab.label
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1 text-[13px] font-semibold tracking-[0.26px] transition',
                  active
                    ? 'bg-rw-accent text-white shadow-[0_4px_6px_rgba(185,5,56,0.2)]'
                    : 'bg-rw-surface-soft text-rw-muted hover:bg-rw-surface-muted',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
          <span className="shrink-0 text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
            Filter:
          </span>
          {FILTERS.filter((f) => f.label).map((filter) => {
            const active = activeFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() =>
                  onFilterChange(active ? 'all' : filter.id)
                }
                className={cn(
                  'shrink-0 rounded-full px-2 py-1 text-[11px] font-bold tracking-[0.55px] transition',
                  active
                    ? 'bg-rw-accent text-white'
                    : 'bg-rw-surface-muted text-rw-ink hover:bg-rw-chip',
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
