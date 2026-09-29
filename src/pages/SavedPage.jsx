import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSavedPlaces } from '../store/useSavedPlaces.js'
import { useSavedPlaceEnrichment } from '../hooks/useSavedPlaceEnrichment.js'
import {
  SAVED_FILTERS,
  filterSavedPlaces,
  typeLabel,
} from '../utils/savedPlaces.js'
import { SavedFilters } from '../components/saved/SavedFilters.jsx'
import { SavedGrid } from '../components/saved/SavedGrid.jsx'

const VALID = new Set(SAVED_FILTERS.map((f) => f.id))

export function SavedPage() {
  const { savedPlaces, patchSavedMany } = useSavedPlaces()
  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter') || 'all'
  const activeFilter = VALID.has(filterParam) ? filterParam : 'all'
  const [query, setQuery] = useState('')

  useSavedPlaceEnrichment(savedPlaces, { patchSavedMany })

  const counts = useMemo(() => {
    const next = {
      all: savedPlaces.length,
      destination: 0,
      attraction: 0,
      restaurant: 0,
      hotel: 0,
    }
    for (const place of savedPlaces) {
      if (next[place.type] != null) next[place.type] += 1
    }
    return next
  }, [savedPlaces])

  const filteredPlaces = useMemo(
    () =>
      filterSavedPlaces(savedPlaces, {
        type: activeFilter,
        query,
      }),
    [savedPlaces, activeFilter, query],
  )

  const setFilter = useCallback(
    (filterId) => {
      const next = new URLSearchParams(searchParams)
      if (!filterId || filterId === 'all') next.delete('filter')
      else next.set('filter', filterId)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const categoryLabel =
    SAVED_FILTERS.find((f) => f.id === activeFilter)?.label || 'Places'

  const filtered =
    activeFilter !== 'all' || Boolean(query.trim())

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-accent uppercase">
            Wishlist
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.45px] text-rw-ink">
            Saved Places
          </h1>
          <p className="max-w-xl text-sm leading-[22px] text-rw-muted">
            Destinations, attractions, restaurants, and hotels you’ve bookmarked
            for later trip planning.
          </p>
        </div>
        <p className="rounded-full bg-rw-surface-muted px-3 py-1 text-[12px] font-semibold text-rw-muted">
          {counts.all} saved
        </p>
      </header>

      <SavedFilters
        activeId={activeFilter}
        onChange={setFilter}
        counts={counts}
        query={query}
        onQueryChange={setQuery}
      />

      <SavedGrid
        places={filteredPlaces}
        status="success"
        filtered={filtered}
        categoryLabel={typeLabel(activeFilter) || categoryLabel}
        onClearFilter={() => {
          setFilter('all')
          setQuery('')
        }}
      />
    </div>
  )
}
