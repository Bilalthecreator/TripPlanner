import { useCallback, useState } from 'react'
import { tripService } from '../services/tripService.js'
import { useTripsList } from '../hooks/useTripsList.js'
import { useTrips } from '../store/useTrips.js'
import { getTripsOverviewStats } from '../utils/tripMetrics.js'
import { TripsStats } from '../components/trips/TripsStats.jsx'
import { TripsToolbar } from '../components/trips/TripsToolbar.jsx'
import { TripGrid } from '../components/trips/TripGrid.jsx'

export function TripsPage() {
  const tripsApi = useTrips()
  const list = useTripsList()
  const filters = tripService.getFilters()
  const [previewingEmpty, setPreviewingEmpty] = useState(false)
  const [busy, setBusy] = useState(false)

  const allTrips = previewingEmpty ? [] : tripsApi.trips
  const stats = getTripsOverviewStats(allTrips)
  const activeCount =
    list.status === 'loading' || list.status === 'idle' ? '…' : allTrips.length

  const clearFilters = useCallback(() => {
    list.setFilter('all')
    list.clearSearch()
  }, [list])

  const handlePreviewEmpty = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (previewingEmpty) {
        tripsApi.restoreSeed()
        setPreviewingEmpty(false)
      } else {
        tripsApi.previewEmpty()
        setPreviewingEmpty(true)
      }
      list.retry()
    } finally {
      setBusy(false)
    }
  }

  const handleRestoreSeed = async () => {
    if (busy) return
    setBusy(true)
    try {
      tripsApi.restoreSeed()
      setPreviewingEmpty(false)
      list.retry()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <TripsStats stats={stats} />

      <TripsToolbar
        activeCount={activeCount}
        filters={filters}
        activeFilter={list.activeFilter}
        onFilterChange={list.setFilter}
        searchValue={list.inputValue}
        onSearchChange={list.setInputValue}
        onPreviewEmpty={handlePreviewEmpty}
        previewingEmpty={previewingEmpty}
        disabled={busy}
      />

      <TripGrid
        trips={list.trips}
        status={list.status}
        error={list.error}
        onRetry={list.retry}
        hasQuery={Boolean(list.query)}
        hasFilter={list.activeFilter !== 'all'}
        onClearFilters={clearFilters}
        onRestoreSeed={handleRestoreSeed}
        previewingEmpty={previewingEmpty}
      />
    </div>
  )
}
