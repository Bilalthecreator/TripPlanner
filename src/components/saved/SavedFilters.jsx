import { FilterChips } from '../discover/FilterChips.jsx'
import { SAVED_FILTERS } from '../../utils/savedPlaces.js'

export function SavedFilters({ activeId, onChange, counts }) {
  const filters = SAVED_FILTERS.map((filter) => ({
    ...filter,
    label:
      filter.id === 'all'
        ? `${filter.label} (${counts.all ?? 0})`
        : `${filter.label} (${counts[filter.id] ?? 0})`,
  }))

  return (
    <SavedCategoryChip
      filters={filters}
      activeId={activeId}
      onChange={onChange}
    />
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
