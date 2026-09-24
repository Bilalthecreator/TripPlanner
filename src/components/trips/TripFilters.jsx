import { cn } from '../../utils/cn.js'

export function TripFilters({
  filters,
  activeId,
  onChange,
  disabled = false,
}) {
  return (
    <div
      className="flex w-full gap-1 overflow-x-auto pb-1 scrollbar-thin"
      role="tablist"
      aria-label="Trip status filters"
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
              'shrink-0 rounded-full px-4 py-1.5 text-[12px] font-semibold tracking-[0.26px] transition',
              active
                ? 'bg-rw-accent text-white shadow-sm'
                : 'bg-transparent text-rw-muted hover:bg-rw-surface-muted/70',
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
