import { cn } from '../../utils/cn.js'

export function FilterChips({ filters, activeId, onChange, disabled = false }) {
  return (
    <div
      className="flex w-full gap-1 overflow-x-auto pb-1.5 scrollbar-thin"
      role="tablist"
      aria-label="Quick filters"
    >
      {filters.map((filter) => {
        const active = filter.id === activeId
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(filter.id)}
            className={cn(
              'shrink-0 rounded-full px-4 py-1 text-[11px] font-bold tracking-[0.55px] transition',
              active
                ? 'bg-rw-accent text-white shadow-sm'
                : 'bg-rw-surface-muted text-rw-muted hover:bg-rw-chip',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
