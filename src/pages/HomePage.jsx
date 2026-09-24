import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { discoverService } from '../services/discoverService.js'
import { useDestinationSearch } from '../hooks/useDestinationSearch.js'
import { DiscoverSearch } from '../components/discover/DiscoverSearch.jsx'
import { FilterChips } from '../components/discover/FilterChips.jsx'
import { FeaturedSpotlight } from '../components/discover/FeaturedSpotlight.jsx'
import { WeatherPreview } from '../components/discover/WeatherPreview.jsx'
import { DestinationGrid } from '../components/destination/DestinationGrid.jsx'
import { AttractionsStrip } from '../components/discover/AttractionsStrip.jsx'
import { DiscoveryTips } from '../components/discover/DiscoveryTips.jsx'

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => discoverService.getFilters(), [])
  const activeFilter = searchParams.get('filter') || 'all'
  const [layout, setLayout] = useState('grid')

  const search = useDestinationSearch({ filter: activeFilter })

  const weatherDestinationId = search.results[0]?.id ?? 'kyoto'

  const setFilter = (filterId) => {
    const next = new URLSearchParams(searchParams)
    if (filterId === 'all') next.delete('filter')
    else next.set('filter', filterId)
    setSearchParams(next, { replace: true })
  }

  const isSearch = Boolean(search.query)

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <DiscoverSearch
          value={search.inputValue}
          onChange={search.setInputValue}
          onSubmit={() => search.setShowSuggestions(false)}
          suggestions={search.suggestions}
          showSuggestions={search.showSuggestions}
          setShowSuggestions={search.setShowSuggestions}
          onSelectSuggestion={search.selectSuggestion}
        />
        <FilterChips
          filters={filters}
          activeId={activeFilter}
          onChange={setFilter}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <FeaturedSpotlight />
        <WeatherPreview destinationId={weatherDestinationId} />
      </section>

      <DestinationGrid
        destinations={search.results}
        status={search.status === 'idle' ? 'loading' : search.status}
        error={search.error}
        onRetry={search.retry}
        onClearSearch={search.clearSearch}
        layout={layout}
        onLayoutChange={setLayout}
        isSearch={isSearch}
      />

      <AttractionsStrip filter={activeFilter} />

      <DiscoveryTips />
    </div>
  )
}
