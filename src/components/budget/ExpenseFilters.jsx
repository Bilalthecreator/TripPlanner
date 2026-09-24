import { cn } from '../../utils/cn.js'
import { EXPENSE_CATEGORIES } from '../../utils/budgetUtils.js'
import { IconSearch } from '../common/Icons.jsx'

export function ExpenseFilters({
  category,
  onCategoryChange,
  query,
  onQueryChange,
}) {
  const options = [{ id: 'all', label: 'All' }, ...EXPENSE_CATEGORIES]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-md">
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-rw-faint" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search expenses"
          className="w-full rounded-xl border border-rw-divider/70 bg-rw-input py-2.5 pr-3 pl-10 text-sm text-rw-ink outline-none transition focus:border-rw-accent/60"
          aria-label="Search expenses"
        />
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
        role="group"
        aria-label="Filter by category"
      >
        {options.map((option) => {
          const active = category === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onCategoryChange(option.id)}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.2px] transition',
                active
                  ? 'bg-rw-accent text-white shadow-[0_4px_12px_-4px_rgba(185,5,56,0.35)]'
                  : 'bg-rw-surface-muted text-rw-muted hover:text-rw-ink',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
