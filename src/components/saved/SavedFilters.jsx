import { FilterChips } from '../discover/FilterChips.jsx'
import { SAVED_FILTERS } from '../../utils/savedPlaces.js'
import { IconSearch } from '../common/Icons.jsx'

export function SavedFilters({
  activeId,
  onChange,
  counts,
  query = '',
  onQueryChange,
}) {
  const filters = SAVED_FILTERS.map((filter) => ({
    ...filter,
    label:
      filter.id === 'all'
        ? `${filter.label} (${counts.all ?? 0})`
        : `${filter.label} (${counts[filter.id] ?? 0})`,
  }))

  return (
    <div className="flex flex-col gap-3">
      {typeof onQueryChange === 'function' ? (
        <div className="relative max-w-md">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-rw-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search saved places"
            className="w-full rounded-xl border border-rw-divider/70 bg-rw-input py-2.5 pr-3 pl-10 text-sm text-rw-ink outline-none transition focus:border-rw-accent/60"
            aria-label="Search saved places"
          />
        </div>
      ) : null}

      <SavedCategoryChip
        filters={filters}
        activeId={activeId}
        onChange={onChange}
      />
    </div>
  )
}

export function SavedCategoryChip({ filters, activeId, onChange }) {
  return (
    <FilterChips
      filters={filters}
      activeId={activeId}
      onChange={onChange}
    />
  )
}
